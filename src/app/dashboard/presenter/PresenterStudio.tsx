import React, { useState, useEffect, useRef } from 'react';
import { Show, MusicTrack, SoundEffect } from '@/lib/types';
import { audioEngine } from '@/lib/audioEngine';
import { getShows, getMusicTracks, SOUND_EFFECTS, addMusicTrack } from '@/lib/api';
import { startBroadcast, stopBroadcast, getBroadcastStatus, updateListenerCount, playBroadcastContent,clearBroadcastContent} from '@/lib/api';
import VoiceVisualizer from './VoiceVisualizer';
import {
  Mic,
  MicOff,
  Radio,
  Play,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Music,
  Plus,
  Flame,
  Clock,
  Users,
  RadioTower,
  Headphones,
  Upload,
  Layers,
  Check,
  Disc3,
  MessageSquare,
  Send,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PresenterStudioProps {
  presenterId: string;
  presenterName: string;
  onNavigateToShows?: () => void;
  onNavigateToMusic?: () => void;
}

export default function PresenterStudio({
  presenterId,
  presenterName,
  onNavigateToShows,
  onNavigateToMusic,
}: PresenterStudioProps) {
  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastId, setBroadcastId] =  useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(1.0);
  const [autoDucking, setAutoDucking] = useState(true);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [voicePeak, setVoicePeak] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);

  // Shows & Selection
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState<string>('');

  // Live Timer & Listener Counter
  const [broadcastSeconds, setBroadcastSeconds] = useState(0);
  const [liveListeners, setLiveListeners] = useState(0);
  const listenerRef = useRef(liveListeners);

  // Music Tracks & Player
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);

  // Add Music Modal
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Chill / Ambient');
  const [newTrackPreset, setNewTrackPreset] = useState<'lofi' | 'house' | 'jazz' | 'synthwave' | 'news'>('lofi');
  const [customFile, setCustomFile] = useState<File | null>(null);

  
  // Live Chat / Shoutouts
  const [messages, setMessages] = useState<{ id: string; user: string; text: string; time: string; tag?: string }[]>([
    { id: '1', user: 'Sarah_K', text: 'Marcus on the airwaves! Turn that baseline UP! 🔥', time: 'Just now', tag: 'Fan' },
    { id: '2', user: 'AlexRadio', text: 'Greetings from London! Loving the late night selection.', time: '1m ago', tag: 'Listener' },
    { id: '3', user: 'Elena_FM', text: 'Great handover Marcus, smash the set! 📻', time: '3m ago', tag: 'Co-Host' },
  ]);
  const [chatInput, setChatInput] = useState('');
  useEffect(() => {
      getShows().then((allShows) => {
        console.log("SHOWS:", allShows);
        setShows(allShows);
      });

      getMusicTracks().then((allTracks) => {
        console.log("TRACKS:", allTracks);
        setTracks(allTracks);
      });
    }, []);
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
        if (Math.random() > 0.4) {
          const delta = Math.floor(Math.random() * 11) - 4;
          setLiveListeners((curr) => Math.max(100, curr + delta));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBroadcasting]);

  useEffect(() => {
  if (!broadcastId || !isBroadcasting) {
    return;
  }

  const interval = setInterval(() => {
    updateListenerCount(
      broadcastId,
      listenerRef.current
    ).catch(console.error);
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
    if (!selectedShowId) {
        alert("Please select a show before going live.");
        return;
      }
    try {
      const res = await audioEngine.startMicrophone();

      const broadcast = await startBroadcast(
        selectedShowId,
        "studio"
      );
      console.log("Selected Show ID:", selectedShowId);
      console.log("Shows:", shows);

      setBroadcastId(broadcast.id);
      setIsSimulated(res.simulated);
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
      console.error("Failed to start broadcast", error);
    }
  } else {
    try {
      if (broadcastId) {

          await updateListenerCount(
            broadcastId,
            liveListeners
          );

          await stopBroadcast(
            broadcastId
          );
        }

      audioEngine.stopMicrophone();
      audioEngine.stopMusic();

      setBroadcastId(null);
      setIsBroadcasting(false);
      setIsPlayingMusic(false);
      setBroadcastSeconds(0);
      setVoiceIntensity(0);
      setVoicePeak(0);
    } catch (error) {
      console.error("Failed to stop broadcast", error);
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

  const activeShow = shows.find((s) => s.id === selectedShowId) || shows[0];

  return (
    <div className="space-y-8">
      {/* Studio Header Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
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

          {/* Show Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Show:</span>
            <select
              value={selectedShowId}
              onChange={(e) => setSelectedShowId(e.target.value)}
              className="bg-stone-950 border border-stone-800 text-stone-200 text-sm font-semibold rounded-xl px-3 py-1.5 outline-none focus:border-emerald-600"
            >
              {shows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.show_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tickers: Time, Listeners, Ducking status */}
        <div className="flex items-center gap-6 flex-wrap font-mono text-sm">
          <div className="flex items-center gap-2 text-stone-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-stone-400">AIRTIME:</span>
            <span className="font-bold text-white tracking-wider">{formatTime(broadcastSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-300">
            <Users className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-stone-400">LISTENERS:</span>
            <span className="font-bold text-white tracking-wider">
              {isBroadcasting ? liveListeners.toLocaleString() : '0'}
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

      {/* CENTERSTAGE: HUGE MICROPHONE WITH SOUND WAVES */}
      <div className="relative bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden text-center">
        {/* Subtle Ambient Background glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            isBroadcasting && !isMuted
              ? 'opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent'
              : 'opacity-0'
          }`}
        />

        {/* Huge Microphone Wave Container */}
        <div className="relative flex items-center justify-center py-6">
          {/* Animated Wave Rings based on Voice Intensity */}
          {isBroadcasting && !isMuted && (
            <>
              {/* Outer Wave Ring 3 */}
              <div
                className="absolute rounded-full border border-emerald-500/30 transition-all duration-150 pointer-events-none"
                style={{
                  width: `${240 + voiceIntensity * 2.8}px`,
                  height: `${240 + voiceIntensity * 2.8}px`,
                  opacity: Math.min(0.8, 0.2 + voiceIntensity / 140),
                  transform: `scale(${1 + (voiceIntensity / 250)})`,
                  boxShadow: `0 0 ${20 + voiceIntensity * 0.4}px rgba(16, 185, 129, 0.25)`,
                }}
              />

              {/* Middle Wave Ring 2 */}
              <div
                className="absolute rounded-full border-2 border-emerald-400/40 transition-all duration-100 pointer-events-none"
                style={{
                  width: `${190 + voiceIntensity * 2.0}px`,
                  height: `${190 + voiceIntensity * 2.0}px`,
                  opacity: Math.min(0.9, 0.3 + voiceIntensity / 100),
                  transform: `scale(${1 + (voiceIntensity / 300)})`,
                  boxShadow: `0 0 ${15 + voiceIntensity * 0.5}px rgba(16, 185, 129, 0.4)`,
                }}
              />

              {/* Inner High-Energy Wave Ring 1 */}
              <div
                className="absolute rounded-full border-2 border-emerald-300/60 transition-all duration-75 pointer-events-none"
                style={{
                  width: `${150 + voiceIntensity * 1.2}px`,
                  height: `${150 + voiceIntensity * 1.2}px`,
                  opacity: Math.min(1.0, 0.4 + voiceIntensity / 80),
                  boxShadow: `0 0 ${25 + voiceIntensity * 0.6}px rgba(52, 211, 153, 0.6)`,
                }}
              />
            </>
          )}

          {/* Huge Interactive Center Microphone Button */}
          <button
            onClick={handleToggleBroadcast}
            className={`relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer group ${
              isBroadcasting
                ? isMuted
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_40px_rgba(217,119,6,0.5)] ring-8 ring-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_60px_rgba(16,185,129,0.6)] ring-8 ring-emerald-500/40'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-4 border-stone-700 hover:border-emerald-600/60'
            }`}
          >
            {isBroadcasting ? (
              isMuted ? (
                <>
                  <MicOff className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse text-amber-100" />
                  <span className="text-xs font-mono font-bold uppercase mt-1 tracking-wider text-amber-100">
                    MUTED
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                  <span className="text-xs font-mono font-bold uppercase mt-1 tracking-wider text-emerald-100">
                    LIVE
                  </span>
                </>
              )
            ) : (
              <>
                <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-stone-400 group-hover:text-emerald-400 transition" />
                <span className="text-xs font-mono font-bold uppercase mt-1 tracking-wider text-stone-400 group-hover:text-white">
                  CLICK TO GO LIVE
                </span>
              </>
            )}
          </button>
        </div>

        {/* Studio Status Badge & Controls Under Mic */}
        <div className="mt-4 max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Go Live / Stop broadcast button */}
            <button
              onClick={handleToggleBroadcast}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center gap-2 ${
                isBroadcasting
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
              }`}
            >
              <Radio className="w-4 h-4" />
              {isBroadcasting ? 'End Broadcast' : 'Start Broadcasting'}
            </button>

            {/* Mute toggle button */}
            {isBroadcasting && (
              <button
                onClick={handleToggleMute}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm border transition flex items-center gap-2 ${
                  isMuted
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'Unmute Mic' : 'Mute Mic'}
              </button>
            )}
          </div>

          {/* Mic Gain Slider */}
          <div className="bg-stone-950/70 backdrop-blur border border-stone-800 rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs font-mono">
            <span className="text-stone-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              MIC GAIN
            </span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={micVolume}
              onChange={(e) => handleMicVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
            <span className="text-white font-bold w-12 text-right">
              {Math.round(micVolume * 100)}%
            </span>
          </div>

          {isSimulated && isBroadcasting && (
            <p className="text-[11px] text-amber-400/90 font-mono">
              💡 Studio Voice Simulator active (Microphone fallback). Speak or test audio.
            </p>
          )}
        </div>
      </div>

      {/* REAL-TIME VOICE INTENSITY & SPECTRUM VISUALIZER */}
      <VoiceVisualizer
        isLive={isBroadcasting}
        isMuted={isMuted}
        intensity={voiceIntensity}
        peak={voicePeak}
      />

      {/* PRESENTER MUSIC DECK & SOUNDBOARD (Dual Grid) */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* MUSIC DECK (7 Cols) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Presenter Music Deck</h3>
                <p className="text-xs text-stone-400">
                  Play background music, lo-fi talk beds, and imported tracks while live
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddMusicOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Music Track
            </button>
          </div>

          {/* Active Player Deck */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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

        {/* SOUNDBOARD FX & LIVE CHAT (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instant Soundboard FX */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Live Soundboard FX</h3>
              </div>
              <span className="text-[11px] font-mono text-stone-400">Click to Trigger</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SOUND_EFFECTS.map((sfx) => (
                <button
                  key={sfx.id}
                  onClick={() => handleTriggerSfx(sfx)}
                  className={`p-3 rounded-xl font-semibold text-xs text-white flex items-center justify-between transition shadow active:scale-95 cursor-pointer ${sfx.color}`}
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
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-200">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Live Studio Chat</h4>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                3 New
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto text-xs pr-1">
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

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a host shoutout to listeners..."
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
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
