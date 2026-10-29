"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import { getShows } from "@/lib/api";
import type { PublicShow } from "@/lib/public-content";

function formatShow(show: PublicShow) {
  const isLive = show.is_live ?? show.status === "live";
  const startTime = show.scheduled_start ? new Date(show.scheduled_start) : null;
  const time = startTime && !Number.isNaN(startTime.getTime())
    ? startTime.toLocaleTimeString("en-ZA", {
        timeZone: "Africa/Johannesburg",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Scheduled";
  const languageNames: Record<string, string> = {
    zu: "isiZulu",
    en: "English",
    xh: "isiXhosa",
    st: "Sesotho",
    tn: "Setswana",
    ts: "itsonga",
    ve: "Tshivenda",
    nr: "isiNdebele",
  };

  return {
    id: show.id,
    isLive,
    tag: isLive ? "LIVE" : time,
    tagColor: isLive ? "bg-red-600" : "bg-black/60",
    icon: show.presenter_type === "ai" ? "briefcase" : "mic",
    title: show.title,
    description: show.description,
    host: [show.display_name || show.presenter_name || "iLizwi Radio", show.cohost_display_name]
      .filter(Boolean)
      .join(" & "),
    lang: languageNames[show.language_code || ""] || show.language_code || "",
    listeners: show.listener_count ? String(show.listener_count) : null,
  };
}

export default function LiveBroadcasts({ initialShows }: { initialShows: PublicShow[] }) {
  const [schedule, setSchedule] = useState(() => initialShows.map(formatShow));

  useEffect(() => {
    getShows()
      .then((data) => setSchedule(data.map(formatShow)))
      .catch((error) => console.error("Failed to refresh live broadcasts:", error));
  }, []);

  if (!schedule.length) {
    return (
      <section id="live" className="py-20 text-center" aria-labelledby="live-heading">
        <h2 id="live-heading" className="display text-4xl text-green-900 mb-2">Live Broadcasts</h2>
        <p className="text-stone-500">No broadcasts are listed right now. Please check back soon.</p>
        <a href="/activities" className="inline-block mt-4 text-orange-600 font-semibold">View activities</a>
      </section>
    );
  }

  return (
    <FadeIn>
      <section id="live" className="max-w-7xl mx-auto px-6 py-20" aria-labelledby="live-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
              <Icon name="radio" /> TODAY&apos;S SCHEDULE
            </div>
            <h2 id="live-heading" className="display text-4xl text-green-900 mb-2">Live Broadcasts</h2>
            <p className="text-stone-500 max-w-lg">
              Tune into live shows hosted by African presenters and AI broadcasters across multiple languages.
            </p>
          </div>
          <a href="/activities" className="text-orange-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View Full Schedule <Icon name="arrow" />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {schedule.map((show) => (
            <article key={show.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-28 relative flex items-center justify-center bg-gradient-to-br from-orange-600 to-amber-950">
                <span className={`absolute top-2.5 left-2.5 ${show.tagColor} text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1`}>
                  {show.isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {show.tag}
                </span>
                <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center">
                  <Icon name={show.icon as "mic" | "video" | "briefcase"} className="w-3.5 h-3.5 text-white" />
                </span>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold text-orange-600 tracking-wide mb-1">
                  {show.isLive ? "ON AIR" : "UPCOMING SHOW"}
                </p>
                <h3 className="font-bold text-green-900 mb-0.5">{show.title}</h3>
                <p className="text-stone-500 text-sm mb-3">{show.host}</p>
                {show.description && <p className="text-stone-600 text-sm mb-3">{show.description}</p>}
                <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2.5 mb-3">
                  <span>{show.lang}</span>
                  {show.listeners && (
                    <span className="flex items-center gap-1 text-green-800 font-semibold">
                      <Icon name="people" className="w-3.5 h-3.5" />
                      {show.listeners}
                    </span>
                  )}
                </div>
                <button className="w-full bg-green-900 hover:bg-green-800 text-white rounded-lg py-2 text-sm font-semibold">
                  {show.isLive ? "Join Live" : "Set Reminder"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
