"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import { getBroadcastStatus,getIcecastStatus } from "@/lib/api";

type Bar = { height: number; delay: number };

// Deterministic fallback used for the server-rendered markup so it matches
// what React expects on the very first client render (avoids hydration
// mismatches from Math.random()).
const STATIC_BARS: Bar[] = Array.from({ length: 48 }, (_, i) => ({
  height: 10 + ((i * 7) % 28),
  delay: (i % 12) * 0.09,
}));

export default function Hero() {
  const [bars, setBars] = useState<Bar[]>(STATIC_BARS);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [liveBroadcast, setLiveBroadcast] = useState<any>(null);
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const BASE_STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL ?? "";
  const STREAM_URL = `${BASE_STREAM_URL.replace(/\/$/, "")}/live`;

  const [icecastStatus, setIcecastStatus] = useState({online: false, listeners: 0, bitrate: 0,});
  useEffect(() => {
      const loadIcecast = async () => {
        try {
          const data = await getIcecastStatus();
          setIcecastStatus(data);
        } catch (err) {
          console.error(err);
        }
      };

      loadIcecast();

      const interval = setInterval(
        loadIcecast,
        10000
      );

      return () => clearInterval(interval);
    }, []);

  const setMediaSessionMetadata = () => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: liveBroadcast?.show_title || "iLIZWI Radio",
      artist: liveBroadcast?.presenter_name || "iLIZWI Radio",
      album: "iLIZWI Radio — Live",
      artwork: [
        { src: "/logo-96.png", sizes: "96x96", type: "image/png" },
        { src: "/logo-192.png", sizes: "192x192", type: "image/png" },
        { src: "/logo-256.png", sizes: "256x256", type: "image/png" },
        { src: "/logo-512.png", sizes: "512x512", type: "image/png" },
      ],
    });
    navigator.mediaSession.playbackState = "playing";

    navigator.mediaSession.setActionHandler("play", async () => {
       if (audio) { await audio.play();   setIsPlaying(true);}});

    navigator.mediaSession.setActionHandler("pause", () => {
      if (audio) { audio.pause();    setIsPlaying(false); }});

    navigator.mediaSession.setActionHandler("stop", () => {handleStop(); }); };

  const clearMediaSession = () => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = "paused";
    navigator.mediaSession.metadata = null;
  };

  const handleListenLive = async () => {
    if(!icecastStatus.online) {
      setStreamError(true);
      return;
    }
    setStreamError(false);
    try {
      // First click: create player
      if (!audio) {
        const player = new Audio(STREAM_URL);

        player.onplay = () => setIsPlaying(true);
        player.onpause = () => setIsPlaying(false);
        player.onended = () => {
          setIsPlaying(false);
          setAudio(null);
        };
        player.volume = volume;

        await player.play();

        setAudio(player);
        setIsPlaying(true);
        setMediaSessionMetadata();

        return;
      }

      // Toggle play/pause
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (err) {
      setStreamError(true);
      console.error(err);
    }
  };

  const handleStop = () => {
  if (!audio) return;

  audio.pause();
  audio.src = "";
  audio.load();

  setAudio(null);
  setIsPlaying(false);

  clearMediaSession();
};

  useEffect(() => {
    getBroadcastStatus()
      .then(setLiveBroadcast)
      .catch(console.error);
  }, []);

  // This updates every 10 seconds. Auto Refresh
  useEffect(() => {
    const loadBroadcast = async () => {
      try {
        const data = await getBroadcastStatus();
        setLiveBroadcast(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadBroadcast();

    const interval = setInterval(loadBroadcast, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Randomize only after mount, once we're safely past hydration.
    setBars(
      Array.from({ length: 48 }, () => ({
        height: 6 + Math.random() * 28,
        delay: Math.random() * 1.1,
      }))
    );
  }, []);

  // Stop the stream if the component unmounts (e.g. navigating away)
  // so audio doesn't keep playing silently in the background.
  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  return (
    <section id="top" className="hero-gradient triangle-bg text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center relative">
        <div>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> BROADCASTING LIVE &nbsp;•&nbsp; {icecastStatus.listeners|| 0} LISTENERS
          </span>
          <h1 className="display text-5xl sm:text-6xl leading-[1.05] mb-6">
            Where <span className="text-yellow-400">Africa</span>
            <br />
            Speaks &amp; the
            <br />
            World <span className="text-orange-400">Learns</span>
          </h1>
          <p className="text-white/80 text-lg max-w-md mb-8">
            Celebrating African culture through AI-powered broadcasting, music, language learning, and storytelling.
            Connect with the heartbeat of the continent — 24/7.
          </p>
         <div className="flex gap-2">
            <button
              onClick={handleListenLive}
              disabled={!icecastStatus.online}
              className="btn-pill bg-orange-500 hover:bg-orange-600 px-6 py-3 font-semibold"
            >
              {!icecastStatus.online
              ?"Currently off Air"
              :!audio
                ? "Listen Live Now"
                : isPlaying
                ? "Pause"
                : "Resume"}
            </button>
             <button className="btn-pill bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 font-semibold flex items-center gap-2">
            <Icon name="globe" /> Learn a Language</button>
          </div>
          <div className="mt-3">
              {streamError && (
                <div className="text-yellow-400 text-sm mb-3">
              No presenter is currently live. Please check back later.
              </div>
            )}
           
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <div className="bg-white/8 border border-white/10 rounded-xl p-3">
              <Icon name="radio" className="w-4 h-4 text-yellow-400 mb-1" />
              <div className="text-xs text-white/60">24/7 Radio</div>
              <div className="font-bold text-sm">Always On</div>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="relative h-56 bg-gradient-to-br from-orange-800 via-orange-600 to-green-900 flex items-center justify-center">
            <span className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${icecastStatus.online ? "bg-red-600" : "bg-stone-700"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {icecastStatus.online?"LIVE NOW": "OFF AIR"}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-wide">
              iLIZWI <span className="text-orange-300">RADIO</span>
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold text-yellow-400 tracking-wide mb-1">{liveBroadcast?.show_title || "No Live Show"}</div>
                <div className="font-bold text-lg">{liveBroadcast?.show_title || "No Live Show"}</div>
                <div className="text-white/60 text-sm">{liveBroadcast?.presenter_name || "Unknown Presenter"} {" • "} {liveBroadcast?.language || ""}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-white/50">Listeners</div>
                <div className="font-bold text-yellow-400">{icecastStatus.listeners|| 0}</div>
              </div>
            </div>
            <div className="wave mb-4">
              {bars.map((b, i) => (
                <span key={i} style={{ height: `${b.height}px`, animationDelay: `${b.delay}s` }} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleListenLive}
                className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center transition-all"
              >
                <Icon name={!audio ? "play" : isPlaying ? "pause" : "play"} />
              </button>
              <Icon name="vol" className="w-4 h-4 text-white/60" />
              <input type="range"  min="0"  max="1"  step="0.01" value={volume} onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                if (audio) {audio.volume = v;}}} className="flex-1"/>
              <span className="text-[11px] font-semibold text-white/70">{!audio ? "OFF AIR":isPlaying ? "LIVE" : "PAUSED"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}