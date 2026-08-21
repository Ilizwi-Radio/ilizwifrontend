"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

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

  useEffect(() => {
    // Randomize only after mount, once we're safely past hydration.
    setBars(
      Array.from({ length: 48 }, () => ({
        height: 6 + Math.random() * 28,
        delay: Math.random() * 1.1,
      }))
    );
  }, []);

  return (
    <section id="top" className="hero-gradient triangle-bg text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center relative">
        <div>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> BROADCASTING LIVE &nbsp;•&nbsp; 12,882 LISTENERS
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
          <div className="flex flex-wrap gap-4 mb-10">
            <button className="btn-pill bg-orange-500 hover:bg-orange-600 px-6 py-3 font-semibold flex items-center gap-2">
              <Icon name="play" /> Listen Live Now
            </button>
            <button className="btn-pill bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 font-semibold flex items-center gap-2">
              <Icon name="globe" /> Learn a Language
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <div className="bg-white/8 border border-white/10 rounded-xl p-3">
              <Icon name="radio" className="w-4 h-4 text-yellow-400 mb-1" />
              <div className="text-xs text-white/60">24/7 Radio</div>
              <div className="font-bold text-sm">Always On</div>
            </div>
            <div className="bg-white/8 border border-white/10 rounded-xl p-3">
              <Icon name="mic" className="w-4 h-4 text-yellow-400 mb-1" />
              <div className="text-xs text-white/60">Podcasts</div>
              <div className="font-bold text-sm">120+ Shows</div>
            </div>
            <div className="bg-white/8 border border-white/10 rounded-xl p-3">
              <Icon name="people" className="w-4 h-4 text-yellow-400 mb-1" />
              <div className="text-xs text-white/60">Community</div>
              <div className="font-bold text-sm">85K Members</div>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="relative h-56 bg-gradient-to-br from-orange-800 via-orange-600 to-green-900 flex items-center justify-center">
            <span className="absolute top-3 left-3 bg-red-600 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE ON AIR
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-wide">
              iLIZWI <span className="text-orange-300">RADIO</span>
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold text-yellow-400 tracking-wide mb-1">NOW PLAYING</div>
                <div className="font-bold text-lg">Morning Heritage Show</div>
                <div className="text-white/60 text-sm">with AI Presenter Nala • isiZulu</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-white/50">Listeners</div>
                <div className="font-bold text-yellow-400">12,882</div>
              </div>
            </div>
            <div className="wave mb-4">
              {bars.map((b, i) => (
                <span key={i} style={{ height: `${b.height}px`, animationDelay: `${b.delay}s` }} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <Icon name="play" />
              </button>
              <Icon name="vol" className="w-4 h-4 text-white/60" />
              <div className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-yellow-400 to-orange-500" />
              </div>
              <span className="text-[11px] font-semibold text-white/70">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
