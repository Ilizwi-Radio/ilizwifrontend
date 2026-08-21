"use client";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import {useEffect, useState} from "react";
import { getVideos } from "@/lib/api";



export default function VideoHub() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {

  const loadVideos = async () => {

    try {

      const data = await getVideos();

      const mappedVideos = data.map((video: any, index: number) => ({

        tag:
          video.category_name?.toUpperCase() ||
          "VIDEO",

        title:
          video.title,

        views:
          `${video.view_count || 0} views`,

        dur:
          `${Math.floor(video.duration_seconds / 60)}:${String(
            video.duration_seconds % 60
          ).padStart(2, "0")}`,

        from: "#c9762f",

        to: "#7a3a17",

        big: index === 0

      }));

      setVideos(mappedVideos);

    } catch (error) {

      console.error(
        "Failed to load videos",
        error
      );

    }

  };

  loadVideos();

}, []);
  return (
    <FadeIn>
      <section id="videos" className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-green-700 text-xs font-bold tracking-wide mb-3">
                <Icon name="play" /> VIDEO HUB
              </div>
              <h2 className="display text-4xl text-green-900 mb-2">Stories of Africa</h2>
              <p className="text-stone-500 max-w-lg">
                Documentaries, cultural celebrations, interviews and educational content. Save &amp; watch offline.
              </p>
            </div>
            <a href="#" className="text-orange-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Browse All Videos <Icon name="arrow" />
            </a>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
          
            {videos.length > 0 && videos.map((v) => (
              <div
                key={v.title}
                className={`${v.big ? "lg:col-span-2 lg:row-span-2" : ""} rounded-xl overflow-hidden bg-white border border-stone-200 group`}
              >
                <div
                  className={`relative ${v.big ? "h-full min-h-[280px]" : "h-40"} flex items-center justify-center`}
                  style={{ background: `linear-gradient(135deg,${v.from},${v.to})` }}
                >
                  <span className="absolute top-2.5 left-2.5 bg-yellow-400 text-green-950 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {v.tag}
                  </span>
                  <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                    <button className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center">
                      <Icon name="bookmark" className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center">
                      <Icon name="download" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="w-14 h-14 rounded-full bg-orange-500/90 group-hover:scale-110 transition-transform flex items-center justify-center">
                    <Icon name="play" className="w-6 h-6" />
                  </span>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between">
                    <span className="font-bold text-sm">{v.title}</span>
                    <span className="text-[11px] bg-black/40 rounded px-1.5 py-0.5">{v.dur}</span>
                  </div>
                </div>
                <div className="px-3 py-2 text-stone-500 text-xs">{v.views}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
