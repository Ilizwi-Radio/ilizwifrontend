'use client';

import { useEffect, useRef, useState } from 'react';
import { getCohostConnectionToken } from '@/lib/api';
import { audioEngine } from '@/lib/audioEngine';

const SIGNALING_URL = (process.env.NEXT_PUBLIC_RELAY_URL || '').replace(/\/broadcast\/?$/, '/cohost');

export default function CohostLink({ showId, showTitle, onConnectionChange }: {
  showId: string;
  showTitle: string;
  onConnectionChange?: (connected: boolean) => void;
}) {
  const [status, setStatus] = useState('Not connected');
  const [joining, setJoining] = useState(false);
  const [participantRole, setParticipantRole] = useState<'host' | 'cohost' | null>(null);
  const [cohostMicMuted, setCohostMicMuted] = useState(false);
  const participantRoleRef = useRef<'host' | 'cohost' | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const removeFromMixRef = useRef<(() => void) | null>(null);

  const disconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    pendingIceRef.current = [];
    if (participantRoleRef.current === 'cohost') {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    } else if (participantRoleRef.current === 'host' && !audioEngine.isStreaming) {
      audioEngine.stopMicrophone();
    }
    localStreamRef.current = null;
    removeFromMixRef.current?.();
    removeFromMixRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    participantRoleRef.current = null;
    setParticipantRole(null);
    setCohostMicMuted(false);
    setStatus('Not connected');
    onConnectionChange?.(false);
  };

  useEffect(() => disconnect, [showId]);

  const sendSignal = (type: string, payload?: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    }
  };

  const join = async () => {
    if (!SIGNALING_URL) {
      setStatus('Co-host connection is not configured.');
      return;
    }
    setJoining(true);
    try {
      const authorization = await getCohostConnectionToken(showId);
      participantRoleRef.current = authorization.participantRole;
      setParticipantRole(authorization.participantRole);

      let localStream: MediaStream;
      if (authorization.participantRole === 'host') {
        const mic = await audioEngine.startMicrophone();
        if (mic.simulated) throw new Error('Allow microphone access before joining the co-host room.');
        localStream = audioEngine.getMicrophoneStream()!;
      } else {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
      }
      localStreamRef.current = localStream;

      const peer = new RTCPeerConnection({
        iceServers: authorization.iceServers?.length
          ? authorization.iceServers
          : [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerRef.current = peer;
      localStream.getAudioTracks().forEach((track) => peer.addTrack(track, localStream));
      peer.onicecandidate = (event) => {
        if (event.candidate) sendSignal('ice', event.candidate.toJSON());
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected') setStatus('Co-host audio connected');
        if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
          setStatus('Connection interrupted. Check network or relay settings.');
        }
      };
      peer.ontrack = (event) => {
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        if (authorization.participantRole === 'host') {
          removeFromMixRef.current?.();
          removeFromMixRef.current = audioEngine.addRemoteMicrophone(remoteStream);
        } else if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          void remoteAudioRef.current.play().catch(() => undefined);
        }
      };

      const socket = new WebSocket(SIGNALING_URL, ['ilizwi-cohost', authorization.token]);
      socketRef.current = socket;
      socket.onopen = () => {
        onConnectionChange?.(true);
        setStatus('Waiting for the other presenter…');
      };
      socket.onerror = () => setStatus('Could not connect to the co-host signaling service.');
      socket.onclose = (event) => {
        if (event.code === 4002) setStatus('This presenter is already connected in another tab.');
        else if (peer.connectionState !== 'connected') setStatus('Co-host connection closed.');
      };
      socket.onmessage = async (event) => {
        let message: any;
        try { message = JSON.parse(event.data); } catch { return; }
        try {
          if (message.type === 'peer-joined' && authorization.participantRole === 'host') {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            sendSignal('offer', offer);
          } else if (message.type === 'offer' && authorization.participantRole === 'cohost') {
            await peer.setRemoteDescription(message.payload);
            for (const candidate of pendingIceRef.current.splice(0)) {
              await peer.addIceCandidate(candidate);
            }
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            sendSignal('answer', answer);
          } else if (message.type === 'answer' && authorization.participantRole === 'host') {
            await peer.setRemoteDescription(message.payload);
            for (const candidate of pendingIceRef.current.splice(0)) {
              await peer.addIceCandidate(candidate);
            }
          } else if (message.type === 'ice' && message.payload) {
            if (peer.remoteDescription) await peer.addIceCandidate(message.payload);
            else pendingIceRef.current.push(message.payload);
          } else if (message.type === 'peer-left') {
            removeFromMixRef.current?.();
            removeFromMixRef.current = null;
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
            setStatus('The other presenter disconnected. Waiting for them to return…');
          }
        } catch {
          setStatus('Could not establish the audio connection. Please reconnect.');
        }
      };
      setStatus(`Joined as ${authorization.participantRole === 'host' ? 'primary host' : 'co-host'}. Waiting for the other presenter…`);
    } catch (error) {
      disconnect();
      setStatus(error instanceof Error ? error.message : 'Could not join the co-host room.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-emerald-950">Remote co-host · {showTitle}</h3>
          <p role="status" className="mt-1 text-sm text-emerald-800">{status}</p>
        </div>
        {participantRole ? (
          <div className="flex gap-2">
            {participantRole === 'cohost' && (
              <button
                onClick={() => {
                  const nextMuted = !cohostMicMuted;
                  localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !nextMuted; });
                  setCohostMicMuted(nextMuted);
                }}
                className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-100"
              >
                {cohostMicMuted ? 'Unmute mic' : 'Mute mic'}
              </button>
            )}
            <button onClick={disconnect} className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-100">Leave co-host room</button>
          </div>
        ) : (
          <button onClick={join} disabled={joining} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {joining ? 'Connecting…' : 'Join co-host room'}
          </button>
        )}
      </div>
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <p className="mt-3 text-xs text-emerald-800">Use headphones to prevent echo. Connection quality depends on both presenters’ networks.</p>
    </section>
  );
}
