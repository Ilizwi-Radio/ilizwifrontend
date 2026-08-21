"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { useDataStore } from "@/lib/store";

export default function ActivitiesPage() {
  const store = useDataStore();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-nav-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
              <Icon name="radio" className="w-4 h-4 text-white" />
            </span>
            <span className="font-bold">
              iLIZWI <span className="text-orange-400">RADIO</span>
            </span>
          </Link>
          <Link href="/" className="text-sm bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 font-semibold">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
          <Icon name="bell" className="w-4 h-4" /> UPCOMING ACTIVITIES
        </div>
        <h1 className="display text-4xl text-green-900 mb-3">What&apos;s Happening</h1>
        <p className="text-stone-500 max-w-lg mb-10">
          Every live session and event below is managed by the iLizwi Radio team from the Admin Dashboard — this page
          always reflects the latest schedule.
        </p>

        <h2 className="font-bold text-lg text-green-900 mb-4">Live Sessions</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {store.schedule.map((s, index) => (
            <div key={`${s.title}-${index}`} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${s.imgFrom},${s.imgTo})` }}
              >
                <Icon name={s.icon as "mic" | "video" | "briefcase"} className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {s.tag === "LIVE" && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </span>
                  )}
                  <span className="font-semibold text-green-900 truncate">{s.title}</span>
                </div>
                <div className="text-stone-500 text-xs mt-0.5 truncate">
                  {s.host} {s.tag !== "LIVE" && `• ${s.tag}`} {s.lang && `• ${s.lang}`}
                </div>
              </div>
            </div>
          ))}
          {store.schedule.length === 0 && <p className="text-stone-400 text-sm">No live sessions scheduled right now.</p>}
        </div>

        <h2 className="font-bold text-lg text-green-900 mb-4">Events &amp; Festivals</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {store.events.map((e, index) => (
            <div key={index} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg shrink-0 flex flex-col items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg,${e.from},${e.to})` }}
              >
                <span className="font-extrabold text-sm leading-none">{e.date}</span>
                <span className="text-[9px] font-semibold">{e.mon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-green-900 block truncate">{e.title}</span>
                <span className="text-stone-500 text-xs flex items-center gap-1.5 mt-0.5">
                  <Icon name="pin" className="w-3.5 h-3.5 shrink-0" /> {e.loc}
                </span>
              </div>
            </div>
          ))}
          {store.events.length === 0 && <p className="text-stone-400 text-sm">No events scheduled right now.</p>}
        </div>
      </div>
    </div>
  );
}
