import React, { useState, useEffect } from 'react';
import { MusicTrack, SoundEffect } from '@/lib/types';
import { getMusicTracks, addMusicTrack, deleteMusicTrack, SOUND_EFFECTS } from '@/lib/api';
import { audioEngine } from '@/lib/audioEngine';
import {
  Music,
  Plus,
  Play,
  Square,
  Upload,
  Volume2,
  Trash2,
  Sparkles,
  Sliders,
  Radio,
  FileAudio,
  Zap,
  Disc3,
  Layers,
} from 'lucide-react';

interface MusicCrateProps {
  onSelectTrackForStudio?: (track: MusicTrack) => void;
}

export default function MusicCrate({ onSelectTrackForStudio }: MusicCrateProps) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVol, setMusicVol] = useState(0.7);

  // Auto ducking settings
  const [duckingEnabled, setDuckingEnabled] = useState(true);
  const [duckingThreshold, setDuckingThreshold] = useState(25);

  // New track form modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Lo-Fi / Radio Bed');
  const [preset, setPreset] = useState<'lofi' | 'house' | 'jazz' | 'synthwave' | 'news'>('lofi');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    getMusicTracks().then(setTracks);
  }, []);

  const handlePlay = (track: MusicTrack) => {
    if (activeTrackId === track.id && isPlaying) {
      audioEngine.stopMusic();
      setIsPlaying(false);
      return;
    }

    setActiveTrackId(track.id);
    if (track.fileData) {
      audioEngine.playCustomAudioUrl(track.fileData, track.id, () => {
        setIsPlaying(false);
      });
    } else {
      audioEngine.playPresetMusic(track.synthPreset || 'lofi', track.id);
    }
    setIsPlaying(true);
  };

  const handleStop = () => {
    audioEngine.stopMusic();
    setIsPlaying(false);
    setActiveTrackId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this track from the music crate?')) {
      if (activeTrackId === id) {
        handleStop();
      }
      await deleteMusicTrack(id);
      const updated = await getMusicTracks();
      setTracks(updated);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    let fileUrl: string | undefined = undefined;
    if (uploadedFile) {
      fileUrl = URL.createObjectURL(uploadedFile);
    }

    const created = await addMusicTrack({
      title,
      artist: artist || 'Radio Studio',
      genre,
      duration: 200,
      bpm: 105,
      coverGradient: 'from-purple-600 to-stone-950',
      synthPreset: uploadedFile ? 'custom' : preset,
      fileData: fileUrl,
      isPreset: !uploadedFile,
    });

    setTracks((prev) => [created, ...prev]);
    setIsAddOpen(false);
    setTitle('');
    setArtist('');
    setUploadedFile(null);
  };

  const handleTriggerSfx = (sfx: SoundEffect) => {
    audioEngine.triggerSoundEffect(sfx.type);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Add Track CTA */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Music className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-green-950">Presenter Music Crate & SFX</h2>
          </div>
          <p className="text-stone-500 text-sm mt-1.5 max-w-2xl">
            Upload custom MP3 tracks, manage radio bed loops, configure instant sound effect hotkeys, and setup mic auto-ducking for live shows.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-green-900 hover:bg-green-800 text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Music Track
        </button>
      </div>

      {/* Main Grid: Track Library & Sound Effects */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Track Library (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-emerald-700" /> Radio Track Library ({tracks.length})
            </h3>
            {isPlaying && (
              <button
                onClick={handleStop}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Audio
              </button>
            )}
          </div>

          <div className="space-y-3">
            {tracks.map((track) => {
              const isCurrent = activeTrackId === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white bg-gradient-to-br ${track.coverGradient}`}
                    >
                      <Music className={`w-5 h-5 ${isCurrentPlaying ? 'animate-bounce' : ''}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 truncate">{track.title}</h4>
                      <p className="text-xs text-stone-500 truncate">{track.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          {track.genre}
                        </span>
                        {track.bpm && (
                          <span className="text-[10px] font-mono text-stone-500">
                            {track.bpm} BPM
                          </span>
                        )}
                        {track.fileData && (
                          <span className="text-[10px] font-semibold text-indigo-600">
                            Custom Upload
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePlay(track)}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isCurrentPlaying
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-900 hover:bg-green-800 text-white'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" /> Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Preview
                        </>
                      )}
                    </button>

                    {!track.isPreset && (
                      <button
                        onClick={() => handleDelete(track.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SFX & Auto-Ducking Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Soundboard FX */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Instant Sound FX Pads
              </h3>
              <span className="text-[11px] font-mono text-stone-500">Synthesized 100% Offline</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SOUND_EFFECTS.map((sfx) => (
                <button
                  key={sfx.id}
                  onClick={() => handleTriggerSfx(sfx)}
                  className={`p-3 rounded-xl font-semibold text-xs text-white flex items-center justify-between transition shadow-xs active:scale-95 cursor-pointer ${sfx.color}`}
                >
                  <span className="truncate">{sfx.name}</span>
                  <span className="text-[10px] font-mono bg-black/25 px-1.5 py-0.5 rounded">
                    [{sfx.hotkey}]
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Ducking Configuration */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Mic Auto-Ducking</h4>
                  <p className="text-[11px] text-stone-400">Lowers music when you talk</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !duckingEnabled;
                  setDuckingEnabled(next);
                  audioEngine.autoDucking = next;
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  duckingEnabled ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {duckingEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex justify-between text-stone-300">
                <span>Voice Trigger Sensitivity</span>
                <span className="text-emerald-400">{duckingThreshold}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={duckingThreshold}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setDuckingThreshold(val);
                  audioEngine.duckingThreshold = val;
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Track Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Music className="w-5 h-5 text-emerald-700" /> Add Music Track to Studio
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Track Title *</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Chill Loop"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Artist / Composer</label>
                <input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Studio Crate"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Genre</label>
                  <input
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-green-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Radio Synth Style</label>
                  <select
                    value={preset}
                    onChange={(e) => setPreset(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-green-700"
                  >
                    <option value="lofi">Lo-Fi Chill Bed</option>
                    <option value="house">Club House Groove</option>
                    <option value="jazz">Smooth Lounge Jazz</option>
                    <option value="synthwave">Retro Synthwave</option>
                    <option value="news">Breaking News Alert</option>
                  </select>
                </div>
              </div>

              {/* Upload custom MP3 */}
              <div className="border-2 border-dashed border-stone-300 rounded-xl p-5 text-center bg-stone-50">
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <label className="cursor-pointer block text-xs text-green-800 font-semibold hover:underline">
                  <span>{uploadedFile ? uploadedFile.name : 'Select or drop MP3 audio file'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadedFile(e.target.files[0]);
                        if (!title) {
                          setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-stone-400 mt-1">Accepts MP3, WAV, AAC, OGG files</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-900 hover:bg-green-800 text-white font-semibold text-sm py-2.5 rounded-xl shadow-xs"
                >
                  Save Track
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="border border-stone-300 hover:bg-stone-100 font-semibold text-sm px-5 py-2.5 rounded-xl text-stone-700"
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
