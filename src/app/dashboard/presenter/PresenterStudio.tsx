'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Show, MusicTrack, SoundEffect } from '@/lib/types';
import { audioEngine } from '@/lib/audioEngine';
import { getShows, getMusicTracks, SOUND_EFFECTS, addMusicTrack, getBroadcastRelayToken, getMyPresenterProfile } from '@/lib/api';
import { startBroadcast, stopBroadcast, getBroadcastStatus, updateListenerCount, playBroadcastContent,clearBroadcastContent, getIcecastStatus,} from '@/lib/api';
import VoiceVisualizer from './VoiceVisualizer';
import BroadcastQueuePanel from './BroadcastQueuePanel';
import CohostLink from './CohostLink';
import { useAuth } from '@/lib/auth';
import {
  Mic,
  MicOff,
  Radio,
  Play,
  Square,
  Volume2,
  Sparkles,
  Music,
  Plus,
  Clock,
  Users,
  Upload,
  Disc3,
  Circle,
  MessageSquare,
  Send,
  Zap,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STREAM_URL = `${process.env.NEXT_PUBLIC_STREAM_URL}/live`;
// console.log("STREAM_URL =", STREAM_URL);

const RELAY_WS_URL = process.env.NEXT_PUBLIC_RELAY_URL || '';

type StreamStatus = 'idle' | 'connecting' | 'live' | 'error' | 'stopped';

interface PresenterStudioProps {
  presenterId: string;
  presenterName: string;
  initialShowId?: string;
  onNavigateToShows?: () => void;
  onNavigateToMusic?: () => void;
}

export default function PresenterStudio({
  presenterId,
  presenterName,
  initialShowId,
  onNavigateToShows,
  onNavigateToMusic,
}: PresenterStudioProps) {
  const { user } = useAuth();
  const [myPresenterProfileId, setMyPresenterProfileId] = useState<string | null>(null);
  const [presenterProfileLoaded, setPresenterProfileLoaded] = useState(false);
  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [cohostRoomJoined, setCohostRoomJoined] = useState(false);
  const [broadcastId, setBroadcastId] =  useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(1.0);
  const [autoDucking, setAutoDucking] = useState(true);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [voicePeak, setVoicePeak] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const localRecorderRef = useRef<MediaRecorder | null>(null);
  const localRecordingChunksRef = useRef<Blob[]>([]);

  // Streaming (relay -> Icecast) connection status, separate from isBroadcasting
  // so we can tell the presenter when audio has actually stopped reaching
  // listeners even though the studio still thinks it's "on air."
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');

  // Shows & Selection
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState<string>('');

  useEffect(() => {
    if (initialShowId) setSelectedShowId(initialShowId);
  }, [initialShowId]);

  // Live Timer & Listener Counter
  const [broadcastSeconds, setBroadcastSeconds] = useState(0);
  const [liveListeners, setLiveListeners] = useState(0);
  const listenerRef = useRef(liveListeners);

  // Music Tracks & Player
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isQueuePlaying, setIsQueuePlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);

  // Add Music Modal
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Chill / Ambient');
  const [newTrackPreset, setNewTrackPreset] = useState<'lofi' | 'house' | 'jazz' | 'synthwave' | 'news'>('lofi');
  const [customFile, setCustomFile] = useState<File | null>(null);

  
  // Live Chat / Shoutouts
  const [messages, setMessages] = useState<{ id: string; user: string; text: string; time: string; tag?: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  useEffect(() => {
      getShows().then((allShows) => {
        setShows(allShows);
      }).catch((error) => {
        console.error("Failed to load presenter shows:", error);
        setShows([]);
      });

      getMusicTracks().then((allTracks) => {
        setTracks(allTracks);
      });
      getMyPresenterProfile()
        .then((profile) => setMyPresenterProfileId(profile.id))
        .catch(() => setMyPresenterProfileId(null))
        .finally(() => setPresenterProfileLoaded(true));
    }, []);

  const [icecastStatus, setIcecastStatus] =  useState({ online: false,  listeners: 0,  bitrate: 0, listenerPeak: 0,});
  // Subscribe to real-time voice meter
  useEffect(() => {
    const unsubscribe = audioEngine.subscribeIntensity((intensity, peak) => {
      setVoiceIntensity(intensity);
      setVoicePeak(peak);
    });
    return () => unsubscribe();
  }, []);

  // Broadcast timer & live listeners fluctuation loop
  useEffect(() => { listenerRef.current = liveListeners;}, [liveListeners]);
  useEffect(() => {
    let timer: number;
    if (isBroadcasting) {
      timer = window.setInterval(() => {
        setBroadcastSeconds((sec) => sec + 1);
        // Subtle organic listener fluctuations
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBroadcasting]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  const startLocalRecording = () => {
    setRecordingError(null);
    try {
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('Local recording is not supported by this browser.');
      }
      const stream = audioEngine.getBroadcastStream();
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 })
        : new MediaRecorder(stream);

      localRecordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) localRecordingChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setRecordingError('The local recording stopped because the browser reported an audio error.');
        setIsRecording(false);
      };
      recorder.onstop = () => {
        const blob = new Blob(localRecordingChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        localRecordingChunksRef.current = [];
        localRecorderRef.current = null;
        setIsRecording(false);
        setRecordingSeconds(0);
        if (!blob.size) {
          setRecordingError('No audio was captured. Start a new recording and try again.');
          return;
        }

        const extension = recorder.mimeType.includes('mp4') ? 'm4a' : 'webm';
        const date = new Date().toISOString().replace(/[:.]/g, '-');
        const url = URL.createObjectURL(blob);
        const download = document.createElement('a');
        download.href = url;
        download.download = `ilizwi-radio-${date}.${extension}`;
        document.body.appendChild(download);
        download.click();
        download.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      };

      recorder.start(1000);
      localRecorderRef.current = recorder;
      setRecordingSeconds(0);
      setIsRecording(true);
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : 'Could not start a local recording.');
    }
  };

  const stopLocalRecording = () => {
    const recorder = localRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  };

  useEffect(() => {
  const loadIcecastStatus = async () => {
    try {
      const status =
        await getIcecastStatus();

      setIcecastStatus(status);
      setLiveListeners(
        status.listeners || 0
      );
    } catch (error) {
      console.error(error);
    }
  };

  loadIcecastStatus();

  const interval =
    setInterval(loadIcecastStatus, 10000);

  return () =>
    clearInterval(interval);
}, []);

useEffect(() => {
  return audioEngine.subscribeStreamingStatus((status) => {
    console.log("Streaming status:", status);
    setStreamStatus(status);
  });
}, []);

  useEffect(() => {
  if (!broadcastId || !isBroadcasting) {
    return;
  }

  const interval = setInterval(() => {
    }, 10000);

  return () => clearInterval(interval);

}, [
  broadcastId,
  isBroadcasting
]);


  useEffect(() => {
  getBroadcastStatus()
    .then((status) => {
      if (status) {
        setBroadcastId(status.id);
        setIsBroadcasting(true);

        setLiveListeners(
          status.listener_count || 0
        );
      }
    })
    .catch(console.error);
    }, []);

  // Toggle Live Broadcast
  const handleToggleBroadcast = async () => {
  if (!isBroadcasting) {
    if (
      myPresenterProfileId &&
      shows.find((show) => show.id === selectedShowId)?.cohost_presenter_id === myPresenterProfileId
    ) {
      alert("Only the primary host can start the station broadcast. Join the co-host room to contribute your microphone.");
      return;
    }
    if (!selectedShowId) {
      console.log("Select a show before going live.");
        alert("Please select a show before going live.");
        return;
      }

    if (!RELAY_WS_URL) {
      alert("Streaming relay is not configured. Please contact an admin.");
      return;
    }

    setIsGoingLive(true);
    let stage = "microphone access";

    try {
      const res = await audioEngine.startMicrophone();

      if (res.simulated) {
        // No real microphone was captured — going live now would broadcast
        // dead air (or worse) to real listeners. Bail out instead of
        // silently "succeeding" with a fake mic.
        audioEngine.stopMicrophone();
        alert(
          "We couldn't access your microphone, so we can't go live. Please grant microphone permission in your browser and try again."
        );
        return;
      }

      stage = "relay authorization";
      try {
        const relayToken = await getBroadcastRelayToken(selectedShowId);
        stage = "radio relay connection";
        await audioEngine.startStreaming(RELAY_WS_URL, relayToken);
      } catch (streamErr) {
        if (!cohostRoomJoined) audioEngine.stopMicrophone();
        throw streamErr;
      }

      console.log("STARTING BROADCAST");
      // console.log("Selected Show:", selectedShowId);
      // console.log("Stream URL:", STREAM_URL);

      let broadcast;
      try {
        stage = "broadcast registration";
        broadcast = await startBroadcast(selectedShowId, STREAM_URL);
      } catch (apiErr) {
        // Streaming to Icecast succeeded but recording the broadcast in our
        // own backend failed — don't leave the presenter "live" with no
        // corresponding broadcast record. Tear everything back down.
        audioEngine.stopStreaming();
        if (!cohostRoomJoined) audioEngine.stopMicrophone();
        throw apiErr;
      }

      console.log("Selected Show ID:", selectedShowId);
      console.log("Shows:", shows);

      setBroadcastId(broadcast.id);
      setIsSimulated(false);
      setIsBroadcasting(true);
      setIsMuted(false);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
        });
      } catch {
        /* ignore */
      }
    } catch (error) {
      console.error(`Failed during ${stage}`, error);
      audioEngine.stopStreaming();
      if (!cohostRoomJoined) audioEngine.stopMicrophone();
      const detail = error instanceof Error ? error.message : "Unknown error.";
      const guidance = detail === "Route not found."
        ? "The live relay endpoint is missing from the deployed backend. Update and restart the backend, then try again."
        : detail;
      alert(`Couldn't go live during ${stage}: ${guidance}`);
    } finally {
      setIsGoingLive(false);
    }
  } else {
    try {
      stopLocalRecording();
      if (broadcastId) {

          await updateListenerCount(
            broadcastId,
            liveListeners
          );

          await stopBroadcast(
            broadcastId
          );
        }

      if (!cohostRoomJoined) audioEngine.stopMicrophone();
      audioEngine.stopMusic();
      audioEngine.stopStreaming();

      setBroadcastId(null);
      setIsBroadcasting(false);
      setIsPlayingMusic(false);
      setBroadcastSeconds(0);
      setVoiceIntensity(0);
      setVoicePeak(0);
    } catch (error) {
      console.error("Failed to stop broadcast", error);
      // Even if the API calls above failed, make sure we don't leave the
      // mic/stream running locally — the presenter clicked "stop."
      if (!cohostRoomJoined) audioEngine.stopMicrophone();
      audioEngine.stopMusic();
      audioEngine.stopStreaming();
      setBroadcastId(null);
      setIsBroadcasting(false);
      setIsPlayingMusic(false);
      setBroadcastSeconds(0);
      setVoiceIntensity(0);
      setVoicePeak(0);
    }
  }
};

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleMicVolumeChange = (vol: number) => {
    setMicVolume(vol);
    audioEngine.setMicVolume(vol);
  };

  const handleMusicVolumeChange = (vol: number) => {
    setMusicVolume(vol);
    audioEngine.setMusicVolume(vol);
  };

  const handleToggleDucking = () => {
    const next = !autoDucking;
    setAutoDucking(next);
    audioEngine.autoDucking = next;
  };

  // Music Playback
  const handlePlayMusic = async (track: MusicTrack) => {
    if (isQueuePlaying) return;
    setActiveTrack(track);
    console.log("TRACK ID:", track.id);
    console.log("BROADCAST ID:", broadcastId);
    if (broadcastId) {
        try {

          await playBroadcastContent(
            broadcastId,
            track.id
          );

        } catch (error) {

          console.error(
            "Failed to update current content",
            error
          );

        }
      }
    if (track.fileData) {
      audioEngine.playCustomAudioUrl(track.fileData, track.id, () => {
        setIsPlayingMusic(false);
      });
    } else if (track.synthPreset) {
      audioEngine.playPresetMusic(track.synthPreset, track.id);
    } else {
      audioEngine.playPresetMusic('lofi', track.id);
    }
    setIsPlayingMusic(true);
  };

  const handleStopMusic = async () => {

  audioEngine.stopMusic();

  setIsPlayingMusic(false);

  if (broadcastId) {
    try {

      await clearBroadcastContent(
        broadcastId
      );

    } catch (error) {

      console.error(error);

    }
  }
};

  // SFX trigger
  const handleTriggerSfx = (sfx: SoundEffect) => {
    audioEngine.triggerSoundEffect(sfx.type);
  };

  // Add custom music track
  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle) return;

    let fileUrl: string | undefined = undefined;
    if (customFile) {
      fileUrl = URL.createObjectURL(customFile);
    }

    const created = await addMusicTrack({
      title: newTrackTitle,
      artist: newTrackArtist || presenterName,
      genre: newTrackGenre,
      duration: 180,
      bpm: 110,
      coverGradient: 'from-emerald-600 to-indigo-950',
      synthPreset: customFile ? 'custom' : newTrackPreset,
      fileData: fileUrl,
      isPreset: !customFile,
    });

    setTracks((prev) => [created, ...prev]);
    setActiveTrack(created);
    setIsAddMusicOpen(false);
    setNewTrackTitle('');
    setNewTrackArtist('');
    setCustomFile(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      {
        id: String(Date.now()),
        user: `${presenterName} (Host)`,
        text: chatInput,
        time: 'Just now',
        tag: 'Host',
      },
      ...prev,
    ]);
    setChatInput('');
  };

  // Format broadcast time
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const presenterShows = shows.filter((show) =>
    myPresenterProfileId
      ? show.presenter_id === myPresenterProfileId || show.cohost_presenter_id === myPresenterProfileId
      : user?.role === 'admin'
  );
  const selectedShow = presenterShows.find((show) => show.id === selectedShowId);
  const selectedShowIsCohost = Boolean(
    myPresenterProfileId && selectedShow?.cohost_presenter_id === myPresenterProfileId
  );
  const activeShow = selectedShow || presenterShows[0];

  // Small badge describing relay/Icecast connection health, distinct from
  // isBroadcasting (which only reflects local studio state).
  const renderStreamStatusBadge = () => {
    if (!isBroadcasting) return null;

    if (streamStatus === 'live') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
          <Wifi className="w-3.5 h-3.5" /> Streaming to listeners
        </div>
      );
    }

    if (streamStatus === 'connecting') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700 animate-pulse">
          <Wifi className="w-3.5 h-3.5" /> Connecting to stream…
        </div>
      );
    }

    // 'error' or 'stopped' while isBroadcasting is still true means the
    // studio thinks it's live but audio isn't actually reaching Icecast.
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-950/80 text-red-300 border border-red-700/60">
        <WifiOff className="w-3.5 h-3.5" /> Not reaching listeners — check connection
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {user?.role === "admin" && presenterProfileLoaded && !myPresenterProfileId && (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <p className="font-semibold">Set up your presenter profile before going live</p>
          <p className="mt-1 text-sm">
            In Admin Dashboard → Presenters, create a profile and use “Link Login” with your admin account. Then in Live Sessions, set that profile as the show’s primary host.
          </p>
          <a href="/dashboard/admin" className="mt-2 inline-block text-sm font-semibold underline">Open Admin Dashboard</a>
        </div>
      )}
      {/* Studio Header Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* ON AIR Indicator Sign */}
          <div
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 border ${
              isBroadcasting
                ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                isBroadcasting ? 'bg-red-500 animate-ping' : 'bg-stone-600'
              }`}
            />
            {isBroadcasting ? 'ON AIR • LIVE BROADCAST' : 'OFF AIR • STUDIO READY'}
          </div>

          {renderStreamStatusBadge()}

          {/* Show Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Show:</span>
            <select
              value={selectedShowId}
              onChange={(e) => setSelectedShowId(e.target.value)}
              className="bg-stone-950 border border-stone-800 text-stone-200 text-sm font-semibold rounded-xl px-3 py-1.5 outline-none focus:border-emerald-600"
            >
              {presenterShows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.show_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tickers: Time, Listeners, Ducking status */}
        <div className="flex items-center gap-4 flex-wrap font-mono text-sm">
          <div className="flex items-center gap-2 text-stone-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-stone-400">AIRTIME:</span>
            <span className="font-bold text-white tracking-wider">{formatTime(broadcastSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-300">
            <Users className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-stone-400">LISTENERS:</span>
            <span className="font-bold text-white tracking-wider">
              {isBroadcasting ? icecastStatus.listeners : 0}
            </span>
          </div>

          <button
            onClick={handleToggleDucking}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
              autoDucking
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
            title="Auto-Ducking lowers music volume automatically while speaking into microphone"
          >
            <Zap className={`w-3.5 h-3.5 ${autoDucking ? 'text-emerald-400' : 'text-stone-500'}`} />
            Auto-Duck {autoDucking ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {selectedShow && myPresenterProfileId && (selectedShow.presenter_id === myPresenterProfileId || selectedShow.cohost_presenter_id === myPresenterProfileId) && (
        <details open={cohostRoomJoined} className="rounded-xl border border-emerald-200 bg-emerald-50">
          <summary className="cursor-pointer px-4 py-2 text-sm font-semibold text-emerald-950">
            Remote co-host controls
          </summary>
          <div className="px-3 pb-3">
            <CohostLink showId={selectedShow.id} showTitle={selectedShow.title} onConnectionChange={setCohostRoomJoined} />
          </div>
        </details>
      )}

      {/* Compact broadcast mixer */}
      <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-r from-stone-900 to-stone-950 p-3 shadow-xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-emerald-500/70" />
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,1fr)] xl:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
              isBroadcasting
                ? isMuted
                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-300'
                  : 'border-red-400/50 bg-red-500/15 text-red-300'
                : 'border-stone-700 bg-stone-800 text-stone-400'
            }`}>
              {isMuted && isBroadcasting ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </div>
            <div className="min-w-[110px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Microphone</p>
              <p className="text-sm font-bold text-white">{isBroadcasting ? (isMuted ? 'Muted' : 'Live on air') : 'Standby'}</p>
            </div>
            <button
              onClick={handleToggleBroadcast}
              disabled={isGoingLive || (selectedShowIsCohost && !isBroadcasting)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-wait disabled:opacity-50 ${
                isBroadcasting ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              <Radio className="h-4 w-4" />
              {isGoingLive ? 'Connecting…' : isBroadcasting ? 'End broadcast' : selectedShowIsCohost ? 'Co-host mode' : 'Go live'}
            </button>
            {isBroadcasting && (
              <button
                onClick={handleToggleMute}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                  isMuted ? 'border-amber-500 bg-amber-600 text-white' : 'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            )}
            {isBroadcasting && (
              <button
                onClick={isRecording ? stopLocalRecording : startLocalRecording}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                  isRecording ? 'border-red-700 bg-red-950 text-red-200' : 'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
                aria-pressed={isRecording}
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4 text-red-400" />}
                {isRecording ? `Recording ${formatTime(recordingSeconds)}` : 'Record'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-950/80 px-3 py-2">
            <span className="shrink-0 text-[10px] font-semibold tracking-wider text-stone-500">MIC GAIN</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={micVolume}
              onChange={(e) => handleMicVolumeChange(parseFloat(e.target.value))}
              className="min-w-16 flex-1 accent-emerald-500 cursor-pointer"
              aria-label="Microphone gain"
            />
            <span className="w-10 text-right font-mono text-xs font-bold text-white">{Math.round(micVolume * 100)}%</span>
            <div className="hidden h-6 items-end gap-0.5 sm:flex" aria-label={`Microphone level ${voiceIntensity}%`}>
              {Array.from({ length: 12 }, (_, index) => {
                const active = isBroadcasting && !isMuted && voiceIntensity >= ((index + 1) / 12) * 100;
                return (
                  <span
                    key={index}
                    className={`w-1.5 rounded-sm ${active ? index > 9 ? 'bg-red-500' : index > 7 ? 'bg-amber-400' : 'bg-emerald-400' : 'bg-stone-700'}`}
                    style={{ height: `${6 + index * 1.25}px` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Studio Status Badge & Controls Under Mic */}
        <div className="mt-2 space-y-2">
          {recordingError && (
            <p role="alert" className="text-xs text-red-300">{recordingError}</p>
          )}

          {streamStatus === 'error' && isBroadcasting && (
            <p className="text-[11px] text-red-400/90 font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Lost connection to the stream relay. Listeners may not be hearing you.
            </p>
          )}
        </div>
      </div>

      {/* REAL-TIME VOICE INTENSITY & SPECTRUM VISUALIZER */}
      <details className="rounded-xl border border-stone-800 bg-stone-900">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-stone-200">
          Advanced signal monitor
          <span className="ml-2 text-xs font-normal text-stone-500">{isMuted ? 'Mic muted' : `${voiceIntensity}% input`} · peak {voicePeak}%</span>
        </summary>
        <div className="p-3 pt-0">
          <VoiceVisualizer
            isLive={isBroadcasting}
            isMuted={isMuted}
            intensity={voiceIntensity}
            peak={voicePeak}
          />
        </div>
      </details>

      {/* PRESENTER MUSIC DECK & SOUNDBOARD (Dual Grid) */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
        {/* MUSIC DECK (7 Cols) */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">On-air deck</h3>
                <p className="text-[11px] text-stone-400">Station library · live playback and queue</p>
              </div>
            </div>
          </div>

          {selectedShowId ? (
            <BroadcastQueuePanel
              showId={selectedShowId}
              canPlay={isBroadcasting && streamStatus === 'live'}
              onPlaybackStart={() => {
                setIsPlayingMusic(false);
                setActiveTrack(null);
              }}
              onPlaybackStateChange={setIsQueuePlaying}
            />
          ) : (
            <p className="rounded-lg border border-stone-800 bg-stone-950/70 p-3 text-xs text-stone-400">
              Select a show to search the station library and manage its broadcast queue.
            </p>
          )}

          <details className="rounded-lg border border-stone-800 bg-stone-950/50">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-stone-300">
              Legacy local deck
              <span className="ml-2 font-normal text-stone-500">{tracks.length} tracks · volume and playback</span>
            </summary>
            <div className="space-y-3 p-3 pt-1">
              <button
                onClick={() => setIsAddMusicOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-stone-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add local track
              </button>
          {/* Active Player Deck */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                  activeTrack?.coverGradient || 'from-emerald-600 to-slate-900'
                }`}
              >
                <Disc3
                  className={`w-7 h-7 text-white/80 ${
                    isPlayingMusic ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {activeTrack?.title || 'No Track Selected'}
                </h4>
                <p className="text-xs text-stone-400 truncate">
                  {activeTrack?.artist || 'Select a music track from the list'}
                </p>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded mt-1 inline-block">
                  {activeTrack?.genre || 'Radio Bed'} • {activeTrack?.bpm || 100} BPM
                </span>
              </div>
            </div>

            {/* Deck Play / Stop and Volume controls */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              {isPlayingMusic ? (
                <button
                  onClick={handleStopMusic}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl shadow-lg transition"
                  title="Stop Music"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => activeTrack && handlePlayMusic(activeTrack)}
                  disabled={isQueuePlaying}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl shadow-lg transition"
                  title="Play Music"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              )}

              {/* Music Volume Fader */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-stone-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-24 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Music Track Crate List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <p className="text-xs font-mono text-stone-400 uppercase tracking-wider">
              Studio Music Library ({tracks.length} tracks available)
            </p>
            {tracks.map((track) => {
              const isCurrent = activeTrack?.id === track.id;
              const isCurrentPlaying = isCurrent && isPlayingMusic;

              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-stone-800/90 border-emerald-600/60'
                      : 'bg-stone-950/60 border-stone-800 hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-br ${track.coverGradient}`}
                    >
                      <Music className="w-4 h-4 text-white/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                      <p className="text-[11px] text-stone-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCurrentPlaying ? (
                      <button
                        onClick={handleStopMusic}
                        className="p-1.5 rounded-lg bg-red-600 text-white text-xs flex items-center gap-1 font-semibold"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlayMusic(track)}
                        disabled={isQueuePlaying}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white text-xs flex items-center gap-1 font-semibold transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Play
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </details>
        </div>

        {/* SOUNDBOARD FX & LIVE CHAT (5 Cols) */}
        <div className="space-y-3">
          {/* Instant Soundboard FX */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Soundboard</h3>
              </div>
              <span className="text-[10px] font-mono text-stone-500">FX</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-2">
              {SOUND_EFFECTS.map((sfx) => (
                <button
                  key={sfx.id}
                  onClick={() => handleTriggerSfx(sfx)}
                  className={`min-h-9 rounded-lg px-2 py-1.5 font-semibold text-[11px] text-white flex items-center justify-between gap-1 transition active:scale-95 cursor-pointer ${sfx.color}`}
                >
                  <span className="truncate">{sfx.name}</span>
                  <span className="text-[10px] font-mono opacity-75 bg-black/30 px-1.5 py-0.5 rounded">
                    [{sfx.hotkey}]
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Studio Feed / Listener Shoutouts */}
          <details className="rounded-xl border border-stone-800 bg-stone-900">
            <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-white">
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                Local shoutout notes
              </span>
              <span className="ml-2 text-[10px] font-normal text-stone-500">Not connected to listener chat</span>
            </summary>
            <div className="space-y-3 border-t border-stone-800 p-3">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>Drafts stay in this studio session</span>
                <span>{messages.length} notes</span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto text-xs pr-1">
                {!messages.length && <p className="text-xs text-stone-500">No notes yet.</p>}
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="font-bold text-emerald-400">{msg.user}</span>
                      <span className="text-stone-500">{msg.time}</span>
                    </div>
                    <p className="text-stone-300">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Draft a shoutout..."
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg"
                  aria-label="Save local shoutout note"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>

      {/* ADD MUSIC MODAL */}
      {isAddMusicOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-emerald-400" /> Add Music to Studio Crate
              </h3>
              <button
                onClick={() => setIsAddMusicOpen(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">Track Title</label>
                <input
                  required
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  placeholder="e.g. Late Night City Lights"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">Artist / Producer</label>
                <input
                  value={newTrackArtist}
                  onChange={(e) => setNewTrackArtist(e.target.value)}
                  placeholder={`e.g. ${presenterName}`}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">Genre</label>
                  <input
                    value={newTrackGenre}
                    onChange={(e) => setNewTrackGenre(e.target.value)}
                    placeholder="e.g. Lo-Fi Beats"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">Radio Synth Style</label>
                  <select
                    value={newTrackPreset}
                    onChange={(e) => setNewTrackPreset(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-600"
                  >
                    <option value="lofi">Lo-Fi Chill Lounge</option>
                    <option value="house">Deep House Groove</option>
                    <option value="jazz">Smooth Radio Jazz</option>
                    <option value="synthwave">Retro Synthwave</option>
                    <option value="news">Breaking News Bed</option>
                  </select>
                </div>
              </div>

              {/* Custom MP3 File Upload option */}
              <div className="border-2 border-dashed border-stone-800 rounded-xl p-4 text-center hover:border-emerald-600/50 transition">
                <Upload className="w-8 h-8 text-stone-500 mx-auto mb-2" />
                <label className="cursor-pointer block text-xs text-emerald-400 font-semibold hover:underline">
                  <span>{customFile ? customFile.name : 'Upload MP3 / WAV audio file'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setCustomFile(e.target.files[0]);
                        if (!newTrackTitle) {
                          setNewTrackTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-stone-500 mt-1">
                  Or use the built-in radio synthesizer engine for instant playback.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2.5 rounded-xl shadow"
                >
                  Save to Studio Crate
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddMusicOpen(false)}
                  className="border border-stone-700 text-stone-300 hover:bg-stone-800 font-semibold text-sm px-5 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
