"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import { listVideos, type VideoItem } from "@/services/video.service";

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds < 0) return null;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function VideoHub() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    listVideos()
      .then((items) => {
        if (active) setVideos(items);
      })
      .catch((error: unknown) => {
        console.error("Failed to load videos:", error);
        if (active) setLoadError("Videos could not be loaded right now.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeVideo) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeVideo]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        videos
          .map((video) => video.category_name?.trim())
          .filter((value): value is string => Boolean(value) && value !== "All")
      ),
    ],
    [videos]
  );
  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return videos.filter((video) => {
      const matchesCategory = category === "All" || video.category_name?.trim() === category;
      const matchesSearch =
        !query ||
        `${video.title} ${video.description ?? ""} ${video.category_name ?? ""}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, search, videos]);

  return (
    <FadeIn>
      <section id="videos" className="bg-stone-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-green-700">
                <Icon name="play" /> VIDEO HUB
              </div>
              <h2 className="display mb-2 text-4xl text-green-900">Stories of Africa</h2>
              <p className="max-w-lg text-stone-500">
                Documentaries, cultural celebrations, interviews and educational content. Watch here, streamed by YouTube.
              </p>
            </div>
            <a href="#video-library" className="flex items-center gap-1 text-sm font-semibold text-orange-600 transition-all hover:gap-2">
              Browse All Videos <Icon name="arrow" />
            </a>
          </div>

          <div id="video-library" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 sm:w-80">
              <Icon name="search" className="h-4 w-4 text-stone-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search videos"
                aria-label="Search videos"
                className="min-w-0 flex-1 text-sm outline-none"
              />
            </label>
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2" aria-label="Filter videos by category">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      category === item ? "bg-green-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loadError ? (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{loadError}</p>
          ) : filteredVideos.length === 0 ? (
            <p className="rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-500">
              {videos.length ? "No videos match your search." : "The Video Hub is getting ready. Check back soon."}
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video, index) => {
                if (!video.youtube_video_id) return null;
                const isFeatured = video.is_featured && index === 0;
                const duration = formatDuration(video.duration_seconds);
                const thumbnail =
                  video.thumbnail_url ||
                  `https://i.ytimg.com/vi/${video.youtube_video_id}/hqdefault.jpg`;

                return (
                  <article
                    key={video.id}
                    className={`${isFeatured ? "lg:col-span-2" : ""} group overflow-hidden rounded-xl border border-stone-200 bg-white`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      aria-label={`Play ${video.title}`}
                      className="relative block aspect-video w-full overflow-hidden bg-stone-900 text-left"
                    >
                      <img
                        src={thumbnail}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/95 text-white shadow-lg">
                          <Icon name="play" className="h-6 w-6" />
                        </span>
                      </span>
                      {video.category_name && (
                        <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-1 text-[11px] font-bold uppercase text-green-950">
                          {video.category_name}
                        </span>
                      )}
                      {duration && (
                        <span className="absolute bottom-3 right-3 rounded bg-black/75 px-1.5 py-0.5 text-[11px] text-white">
                          {duration}
                        </span>
                      )}
                    </button>
                    <div className="p-4">
                      <h3 className="font-bold text-green-950">{video.title}</h3>
                      {video.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-stone-600">{video.description}</p>
                      )}
                      <p className="mt-3 text-xs text-stone-500">
                        {new Intl.NumberFormat().format(video.view_count ?? 0)} views
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {activeVideo?.youtube_video_id && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveVideo(null);
          }}
        >
          <div className="w-full max-w-5xl">
            <div className="mb-3 flex items-center justify-between gap-4 text-white">
              <h2 className="truncate font-semibold">{activeVideo.title}</h2>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="rounded px-3 py-1.5 text-sm hover:bg-white/15"
              >
                Close
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtube_video_id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
