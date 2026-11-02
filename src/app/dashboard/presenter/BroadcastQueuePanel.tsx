"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addBroadcastQueueItem,
  completeBroadcastQueueItem,
  failBroadcastQueueItem,
  getBroadcastQueue,
  playNextBroadcastQueueItem,
  removeBroadcastQueueItem,
  searchStationSongs,
} from "@/lib/api";
import { audioEngine } from "@/lib/audioEngine";
import type {
  BroadcastQueueItem,
  BroadcastQueueItemType,
  StationSong,
} from "@/lib/types";
import { ListMusic, Pause, Play, Plus, Search, Trash2 } from "lucide-react";

export default function BroadcastQueuePanel({
  showId,
  canPlay,
  onPlaybackStart,
  onPlaybackStateChange,
}: {
  showId: string;
  canPlay: boolean;
  onPlaybackStart: () => void;
  onPlaybackStateChange: (playing: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<StationSong[]>([]);
  const [queue, setQueue] = useState<BroadcastQueueItem[]>([]);
  const [itemType, setItemType] = useState<BroadcastQueueItemType>("song");
  const [currentItem, setCurrentItem] = useState<BroadcastQueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isChangingQueue, setIsChangingQueue] = useState(false);
  const canPlayRef = useRef(canPlay);
  canPlayRef.current = canPlay;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const refreshQueue = useCallback(async () => {
    setQueue(await getBroadcastQueue(showId));
  }, [showId]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setError("");
      try {
        const songs = await searchStationSongs(search);
        if (active) setResults(songs);
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Could not search the library.");
          setResults([]);
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    let active = true;
    setError("");
    setQueue([]);
    if (!showId) return;
    getBroadcastQueue(showId)
      .then((items) => {
        if (active) setQueue(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the queue.");
      });
    return () => {
      active = false;
    };
  }, [showId]);

  useEffect(() => {
    setCurrentItem(null);
    setIsPlaying(false);
    return () => {
      if (isPlayingRef.current) audioEngine.stopMusic();
      onPlaybackStateChange(false);
    };
  }, [onPlaybackStateChange, showId]);

  useEffect(() => {
    if (canPlay || !isPlaying) return;
    audioEngine.stopMusic();
    setIsPlaying(false);
    onPlaybackStateChange(false);
  }, [canPlay, isPlaying, onPlaybackStateChange]);

  const playNext = useCallback(async () => {
    if (!canPlayRef.current) return;
    setError("");
    try {
      const next = await playNextBroadcastQueueItem(showId);
      if (!canPlayRef.current) {
        setIsPlaying(false);
        onPlaybackStateChange(false);
        return;
      }
      if (!next.item || !next.audioUrl) {
        setCurrentItem(null);
        setIsPlaying(false);
        onPlaybackStateChange(false);
        await refreshQueue();
        return;
      }
      audioEngine.stopMusic();
      onPlaybackStart();
      setCurrentItem(next.item);
      setIsPlaying(true);
      onPlaybackStateChange(true);
      audioEngine.playCustomAudioUrl(
        next.audioUrl,
        next.item.queueItemId,
        () => {
          void (async () => {
            if (!canPlayRef.current) return;
            try {
              await completeBroadcastQueueItem(showId, next.item!.queueItemId);
              await refreshQueue();
              await playNext();
            } catch (requestError) {
              setError(requestError instanceof Error ? requestError.message : "Could not advance the queue.");
              setIsPlaying(false);
              onPlaybackStateChange(false);
            }
          })();
        },
        () => {
          void (async () => {
            try {
              await failBroadcastQueueItem(showId, next.item!.queueItemId);
              await refreshQueue();
              if (canPlayRef.current) await playNext();
            } catch (requestError) {
              setError(requestError instanceof Error ? requestError.message : "The queue item could not be played.");
              setIsPlaying(false);
              onPlaybackStateChange(false);
            }
          })();
        }
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not start the queue.");
      setIsPlaying(false);
      onPlaybackStateChange(false);
    }
  }, [onPlaybackStart, onPlaybackStateChange, refreshQueue, showId]);

  const handleAdd = async (song: StationSong) => {
    setIsChangingQueue(true);
    setError("");
    try {
      await addBroadcastQueueItem(showId, song.id, itemType);
      await refreshQueue();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add this song.");
    } finally {
      setIsChangingQueue(false);
    }
  };

  const handleRemove = async (item: BroadcastQueueItem) => {
    setIsChangingQueue(true);
    setError("");
    try {
      await removeBroadcastQueueItem(showId, item.queueItemId);
      await refreshQueue();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not remove this queue item.");
    } finally {
      setIsChangingQueue(false);
    }
  };

  const handlePause = () => {
    audioEngine.stopMusic();
    setIsPlaying(false);
    onPlaybackStateChange(false);
  };

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-white">
            <ListMusic className="h-4 w-4 text-emerald-400" /> Station library & broadcast queue
          </h4>
          <p className="mt-1 text-[11px] text-stone-400">
            Search by title, artist, genre, or language. Queue playback continues on the backend if the studio disconnects.
          </p>
        </div>
        {isPlaying ? (
          <button onClick={handlePause} className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white">
            <Pause className="h-3.5 w-3.5" /> Pause queue
          </button>
        ) : (
          <button
            onClick={() => void playNext()}
            disabled={!canPlay || !queue.length}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            title={!canPlay ? "Connect to the live relay before playing queue audio." : undefined}
          >
            <Play className="h-3.5 w-3.5" /> Play queue
          </button>
        )}
      </div>

      {currentItem && isPlaying && (
        <p className="rounded-lg bg-emerald-950/60 px-3 py-2 text-xs text-emerald-200">
          Now playing: <strong>{currentItem.title}</strong> — {currentItem.artist}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, artist, genre, or language"
            className="w-full rounded-lg border border-stone-700 bg-stone-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-stone-500"
          />
        </label>
        <select
          value={itemType}
          onChange={(event) => setItemType(event.target.value as BroadcastQueueItemType)}
          className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white"
          aria-label="Queue item type"
        >
          <option value="song">Song</option>
          <option value="jingle">Jingle</option>
          <option value="advert">Advert</option>
        </select>
      </div>

      <div className="max-h-44 space-y-1 overflow-y-auto">
        {isSearching && <p className="text-xs text-stone-500">Searching the library…</p>}
        {!isSearching && !results.length && <p className="text-xs text-stone-500">No matching audio in the station library.</p>}
        {results.map((song) => (
          <div key={song.id} className="flex items-center justify-between gap-3 rounded-lg bg-stone-900 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-stone-100">{song.title}</p>
              <p className="truncate text-[11px] text-stone-400">
                {song.artist} · {song.genre} · {song.language_code}
              </p>
            </div>
            <button
              onClick={() => void handleAdd(song)}
              disabled={isChangingQueue}
              className="shrink-0 rounded-md bg-stone-800 p-2 text-emerald-300 hover:bg-emerald-800 disabled:opacity-50"
              aria-label={`Add ${song.title} to queue`}
              title="Add to queue"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-stone-800 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Queue ({queue.length})</p>
        {!queue.length && <p className="text-xs text-stone-500">No queued audio for this show.</p>}
        {queue.map((item) => (
          <div key={item.queueItemId} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5">
            <p className="min-w-0 truncate text-xs text-stone-200">
              <span className="mr-2 uppercase text-emerald-500">{item.itemType}</span>
              {item.title} — {item.artist}
              {item.status === "playing" && <span className="ml-2 text-amber-400">(current)</span>}
            </p>
            {item.status === "queued" && (
              <button
                onClick={() => void handleRemove(item)}
                disabled={isChangingQueue}
                className="rounded p-1 text-stone-500 hover:bg-red-950 hover:text-red-300 disabled:opacity-50"
                aria-label={`Remove ${item.title} from queue`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    </section>
  );
}
