"use client";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import { getShows } from "@/lib/api";
import { useEffect, useState } from "react";

export default function LiveBroadcasts() {
  const [schedule, setSchedule] =  useState<any[]>([]);
  useEffect(() => {

  const loadShows = async () => {

    const data = await getShows();

    const mappedShows = data.map((show: any) => {

  const startTime = new Date(
    show.scheduled_start
  );

  return {
    

    tag: show.is_live
      ? "LIVE"
      : startTime.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

    tagColor: show.is_live
      ? "bg-red-600"
      : "bg-black/60",

    icon:
  show.presenter_type === "ai"
    ? "briefcase"
    : "mic",

    imgFrom: "#ea6a10",

    imgTo: "#7a2e0f",

   type:
  show.presenter_type === "ai"
    ? "AI PRESENTER"
    : "LIVE HOST",

    title:
      show.title,

    host:
      show.presenter_name ||
      "Presenter",

  lang:
  show.language_code === "zu"
    ? "isiZulu"
    : show.language_code === "en"
    ? "English"
    : show.language_code === "xh"
    ? "isiXhosa"
    : show.language_code === "st"
    ? "Sesotho"
    : show.language_code === "tn"
    ? "Setswana"
    : show.language_code === "ts"
    ? "Xitsonga"
    : show.language_code === "ve"
    ? "Tshivenda"
    : show.language_code === "nr"
    ? "isiNdebele"
    : show.language_code,

    listeners:
      show.listener_count
        ? String(show.listener_count)
        : null,

    cta:
      show.is_live
        ? "Join Live"
        : "Set Reminder",

    id: show.id,

  };

});

    setSchedule(mappedShows);

  };

  loadShows();

}, []);

if (!schedule.length) {

  return (
    <div className="py-20 text-center">
      Loading broadcasts...
    </div>
  );

}
  return (
    <FadeIn>
      <section id="live" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
              <Icon name="radio" /> TODAY&apos;S SCHEDULE
            </div>
            <h2 className="display text-4xl text-green-900 mb-2">Live Broadcasts</h2>
            <p className="text-stone-500 max-w-lg">
              Tune into 24/7 live shows hosted by African presenters and our AI broadcasters across multiple languages.
            </p>
          </div>
          <a href="#" className="text-orange-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View Full Schedule <Icon name="arrow" />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {schedule.map((s) => (
            <div key={s.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="h-28 relative flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${s.imgFrom},${s.imgTo})` }}
              >
                <span className={`absolute top-2.5 left-2.5 ${s.tagColor} text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1`}>
                  {s.tag === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {s.tag}
                </span>
                <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center">
                  <Icon name={s.icon as "mic" | "video" | "briefcase"} className="w-3.5 h-3.5 text-white" />
                </span>
              </div>
              <div className="p-4">
                <div className="text-[10px] font-bold text-orange-600 tracking-wide mb-1">{s.type}</div>
                <div className="font-bold text-green-900 mb-0.5">{s.title}</div>
                <div className="text-stone-500 text-sm mb-3">{s.host}</div>
                <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2.5 mb-3">
                  <span>{s.lang}</span>
                  {s.listeners && (
                    <span className="flex items-center gap-1 text-green-800 font-semibold">
                      <Icon name="people" className="w-3.5 h-3.5" />
                      {s.listeners}
                    </span>
                  )}
                </div>
                <button className="w-full bg-green-900 hover:bg-green-800 text-white rounded-lg py-2 text-sm font-semibold">
                  {s.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
