"use client";

import { useEffect,useState } from "react";
import Icon from "./Icon";
import { getSongs, likeSong } from "@/lib/api";
import {genres} from "@/lib/data";


export default function MusicLibrary() {
  const [active, setActive] = useState("All");
  const [musicItems, setMusicItems] =  useState<any[]>([]);

  useEffect(() => {

  const loadSongs = async () => {

    try {

      const data = await getSongs();
      console.log("SONGS FROM API:", data);
      const mappedSongs = data.map((song:any) => ({
        id: song.id,
        tag: song.genre,
        title: song.title,
        artist: song.artist_name,
        plays: `${song.play_count || 0}`,
        likeCount: Number(song.like_count||0),
        liked: false,
        from: "#8a6d1a",
        to: "#3a2c08"
}));

      setMusicItems(
        mappedSongs
      );

    } catch (error) {

      console.error(
        "Failed to load songs",
        error
      );

    }

  };

  loadSongs();

}, []);
const filtered =
  active === "All"
    ? musicItems
    : musicItems.filter(
        (m) => m.tag === active
      );

 const handleLike = async (
  songId: string
) => {

  const user =
    localStorage.getItem("user");

  if (!user) {

    alert(
      "Please login first."
    );

    return;

  }

  const song = musicItems.find(
    (s) => s.id === songId
  );

  try {

    const unlike =
      song?.liked;

    const result =
      await likeSong(
        songId,
        unlike
      );

    setMusicItems(
      (prev) =>
        prev.map((s) => {

          if (
            s.id !== songId
          ) return s;

          return {
              ...s,
              liked: result.liked,

              likeCount:
                result.liked
                  ? s.likeCount + 1
                  : Math.max(0, s.likeCount - 1),
            };


        })
    );

  } catch (error) {

    console.error(error);

  }

};

  if (musicItems.length > 0) {
    return (
    <section id="music" className="triangle-bg text-white py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-orange-400 text-xs font-bold tracking-wide mb-3">
                  <Icon name="trend" /> TRENDING NOW
                </div>
                <h2 className="display text-4xl mb-2">
                  African Music <span className="text-orange-400">Library</span>
                </h2>
                <p className="text-white/60 max-w-lg">
                  Discover the sounds shaping the continent. From Amapiano to Afrobeat, support African artists.
                </p>
              </div>

        <div className="flex flex-wrap gap-2.5 mb-8">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setActive(g)}
              className={`genre-pill px-4 py-2 rounded-full text-sm font-medium border border-white/15 ${
                active === g ? "active" : "bg-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((m) => (
            <div key={m.title} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/25 transition-colors">
              <div
                className="h-40 relative flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${m.from},${m.to})` }}
              >
                <span className="absolute top-2.5 left-2.5 bg-yellow-400 text-green-950 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {m.tag}
                </span>
                <button onClick={() => 
                handleLike(m.id)
              }
                  className= {`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center 
                  justify-center${m.liked ? " text-red-500" : " text-white/30"}`}
                  
                >
                  <Icon name="heart" />
                </button>
                <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon name="play" className="w-5 h-5" />
                </span>
              </div>
              <div className="p-4">
                <div className="font-bold mb-0.5">{m.title}</div>
                <div className="text-white/60 text-sm mb-2">{m.artist}</div>
                <div className="flex items-center gap-1.5 text-white/50 text-xs">
                  <Icon name="radio" className="w-3.5 h-3.5" />
                  {m.plays} plays
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs mt-1">
                  <Icon name="heart"className={`w-3.5 h-3.5 ${ m.liked ? "text-red-500" : "" }`} />
                  {m.likeCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>)
  ;}
}
