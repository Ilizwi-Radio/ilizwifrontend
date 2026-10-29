"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveBroadcasts from "@/components/LiveBroadcasts";
import MusicLibrary from "@/components/MusicLibrary";
import BadgePromo from "@/components/BadgePromo";
import VideoHub from "@/components/VideoHub";
import LanguageHub from "@/components/LanguageHub";
import Events from "@/components/Events";
import Community from "@/components/Community";
import Careers from "@/components/Careers";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { getSiteSettings } from "@/lib/api";
import type { PublicEvent, PublicShow } from "@/lib/public-content";
import { useAuth } from "@/lib/auth";

export default function HomeClient({
  initialShows,
  initialEvents,
}: {
  initialShows: PublicShow[];
  initialEvents: PublicEvent[];
}) {
  const [sections, setSections] = useState<Record<string, boolean>>({});
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getSiteSettings()
      .then((data) => setSections(data?.homepage_sections ?? {}))
      .catch(console.error);
  }, []);

  return (
    <main>
      <Navbar user={user} onProfileClick={() => setIsProfileOpen(true)} />
      <AuthModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
      />
      <Hero />
      {sections.liveSessions !== false && <LiveBroadcasts initialShows={initialShows} />}
      {sections.music !== false && <MusicLibrary />}
      <BadgePromo />
      {sections.videos !== false && <VideoHub />}
      {sections.languages !== false && <LanguageHub />}
      {sections.events !== false && <Events initialEvents={initialEvents} />}
      <Community />
      {sections.careers !== false && <Careers />}
      <Newsletter />
      <Footer />
    </main>
  );
}
