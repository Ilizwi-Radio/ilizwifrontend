"use client";
import {useState,useEffect} from "react";
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

export default function Home() {
  const [isProfileOpen,setIsProfileOpen] = useState(false);
  const [user,setUser] = useState<any>(null);
  console.log("CURRENT USER:", user);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Invalid user data in localStorage");
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <main>
      <Navbar user={user} onProfileClick={() => setIsProfileOpen(true) }/>
      <AuthModal 
      isOpen={isProfileOpen}
      user={user}
       onClose={() =>  setIsProfileOpen(false) }  
       onLoginSuccess={(user) => {
        console.log("Logged in:", user);
        setUser(user);
         }}/>
      <Hero />
      <LiveBroadcasts />
      <MusicLibrary />
      <BadgePromo />
      <VideoHub />
      <LanguageHub />
      <Events />
      <Community />
      <Careers />
      <Newsletter />
      <Footer />
    </main>
  );
}
