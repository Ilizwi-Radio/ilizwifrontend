"use client";
import { useMemo, useState } from "react";
import Icon from "./Icon";
import { getEvents, getOpportunities, getShows, getSongs, getVideos } from "@/lib/api";


const links = ["Live Radio", "Music", "Videos", "Languages", "Events", "Careers", "Community"];
const anchors = ["#live", "#music", "#videos", "#languages", "#events", "#careers", "#community"];

export default function Navbar({ user,onProfileClick }: {  user: any; onProfileClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchItems, setSearchItems] = useState<Array<{
    title: string;
    detail: string;
    section: string;
    searchText: string;
  }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const results = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 2) return [];
    return searchItems
      .filter((item) => item.searchText.includes(term))
      .slice(0, 8);
  }, [searchItems, searchTerm]);

  const openSearch = async () => {
    setSearchOpen(true);
    setSearchError("");
    if (searchItems.length || searchLoading) return;

    setSearchLoading(true);
    try {
      const [shows, songs, videos, events, opportunities] = await Promise.all([
        getShows(), getSongs(), getVideos(), getEvents(), getOpportunities(),
      ]);
      const entries = [
        ...(Array.isArray(shows) ? shows.map((item: any) => ({
          title: item.title,
          detail: `Show${item.presenter_name ? ` · ${item.presenter_name}` : ""}`,
          section: "#live",
          searchText: `${item.title || ""} ${item.description || ""} ${item.presenter_name || ""} ${item.language_code || ""}`.toLowerCase(),
        })) : []),
        ...(Array.isArray(songs) ? songs.map((item: any) => ({
          title: item.title,
          detail: `Music${item.artist_name ? ` · ${item.artist_name}` : ""}`,
          section: "#music",
          searchText: `${item.title || ""} ${item.artist_name || ""} ${item.genre || ""}`.toLowerCase(),
        })) : []),
        ...(Array.isArray(videos) ? videos.map((item: any) => ({
          title: item.title,
          detail: `Video${item.category_name ? ` · ${item.category_name}` : ""}`,
          section: "#videos",
          searchText: `${item.title || ""} ${item.description || ""} ${item.category_name || ""}`.toLowerCase(),
        })) : []),
        ...(Array.isArray(events) ? events.map((item: any) => ({
          title: item.title,
          detail: `Event${item.location ? ` · ${item.location}` : ""}`,
          section: "#events",
          searchText: `${item.title || ""} ${item.description || ""} ${item.location || ""} ${item.category || ""}`.toLowerCase(),
        })) : []),
        ...(Array.isArray(opportunities) ? opportunities.map((item: any) => ({
          title: item.title,
          detail: `Opportunity${item.department ? ` · ${item.department}` : ""}`,
          section: "#careers",
          searchText: `${item.title || ""} ${item.description || ""} ${item.department || ""} ${item.type || ""}`.toLowerCase(),
        })) : []),
      ];
      setSearchItems(entries.filter((item) => item.title));
    } catch {
      setSearchError("Search is unavailable right now. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      <div className="h-1.5 bg-kente-stripe" />
      <header className="bg-nav-gradient sticky top-0 z-50 text-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-3 shrink-0">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
              <Icon name="radio" className="w-5 h-5 text-white" />
            </span>
            <span className="leading-tight">
              <span className="block font-extrabold tracking-tight text-lg">
                iLIZWI <span className="text-orange-400">RADIO</span>
              </span>
              <span className="block text-[10px] tracking-[0.2em] text-white/70 -mt-0.5">WHERE AFRICA SPEAKS</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-white/90">
            {links.map((label, i) => (
              <a key={label} href={anchors[i]} className="hover:text-white">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button onClick={openSearch} aria-label="Search" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <Icon name="search" />
            </button>
            {user && (
              <button aria-label="Notifications" title="Notifications" className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <Icon name="bell" />
              </button>
            )}
            <button onClick={onProfileClick} className="hidden sm:flex w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center">
              <Icon name="user" /> 
            </button>
            {/* <button className="btn-pill bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LISTEN LIVE
            </button> */}
          </div>
        </div>
      </header>
      <div className="h-1.5 bg-kente-stripe" />
      {searchOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm p-4 flex items-start justify-center pt-[12vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeSearch();
          }}
        >
          <section role="dialog" aria-modal="true" aria-label="Search iLIZWI Radio" className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white text-stone-900 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-stone-200 px-5">
              <Icon name="search" className="h-5 w-5 text-stone-500" />
              <input
                autoFocus
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search shows, music, videos, events..."
                className="h-16 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-stone-400"
              />
              <button onClick={closeSearch} aria-label="Close search" className="rounded-lg px-2 py-1 text-sm text-stone-500 hover:bg-stone-100">Esc</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {searchLoading && <p className="px-3 py-5 text-sm text-stone-500">Loading site content…</p>}
              {!searchLoading && searchError && <p role="status" className="px-3 py-5 text-sm text-red-700">{searchError}</p>}
              {!searchLoading && !searchError && searchTerm.trim().length < 2 && (
                <p className="px-3 py-5 text-sm text-stone-500">Type at least two characters to search the site.</p>
              )}
              {!searchLoading && !searchError && searchTerm.trim().length >= 2 && results.length === 0 && (
                <p className="px-3 py-5 text-sm text-stone-500">No matches found. Try another search.</p>
              )}
              {!searchLoading && results.map((item, index) => (
                <a
                  key={`${item.section}-${item.title}-${index}`}
                  href={item.section}
                  onClick={closeSearch}
                  className="block rounded-xl px-3 py-3 hover:bg-stone-100 focus:bg-stone-100 focus:outline-none"
                >
                  <span className="block font-semibold">{item.title}</span>
                  <span className="block text-sm text-stone-500">{item.detail}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
