"use client";
import { useState } from "react";
import Icon from "./Icon";
import Link from "next/link";


const links = ["Live Radio", "Music", "Videos", "Languages", "Events", "Careers", "Community"];
const anchors = ["#live", "#music", "#videos", "#languages", "#events", "#careers", "#community"];

export default function Navbar({ user,onProfileClick }: {  user: any; onProfileClick: () => void }) {
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
            <button aria-label="Search" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <Icon name="search" />
            </button>
            <button aria-label="Notifications" className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <Icon name="bell" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-[#1c6b3c]" />
            </button>
            <button onClick={onProfileClick} className="hidden sm:flex w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center">
              <Icon name="user" /> 
            </button>
            <button className="btn-pill bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LISTEN LIVE
            </button>
          </div>
        </div>
      </header>
      <div className="h-1.5 bg-kente-stripe" />
    </>
  );
}
