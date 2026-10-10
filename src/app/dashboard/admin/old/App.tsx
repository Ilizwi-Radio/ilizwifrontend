"use client";

import { useEffect, useState } from "react";
import { getPresenters, getEvents, getShows, getOpportunities, getVideos, getSongs, getCourses } from "@/lib/api";
import DashboardHeader from "@/components/DashboardHeader";
import Link from "next/link";
import Icon from "@/components/Icon";

import { TabKey } from "./adminConfig";
import StatsRow from "./StatsRow";
import TabNav from "./TabNav";
import ShowsManagement from "./ShowsManagement";
import LanguagesManagement from "./LanguagesManagement";
import MusicManagement from "./MusicManagement";
import VideosManagement from "./VideosManagement";
import EventsManagement from "./EventsManagement";
import CareersManagement from "./CareersManagement";
import PresentersManagement from "./PresentersManagement";
import GenresManagement from "./GenresManagement";

export default function App() {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [genres, setGenres] = useState<string[]>(["All"]);
  const [tab, setTab] = useState<TabKey>("schedule");

  // Counts derive from the lists, so they can't drift out of sync
  const presentersCount = presenters.length;
  const showsCount = shows.length;
  const eventsCount = events.length;
  const opportunitiesCount = opportunities.length;
  const songsCount = songs.length;
  const videosCount = videos.length;

  useEffect(() => {
    getPresenters().then(setPresenters).catch(console.error);
    getEvents().then(setEvents).catch(console.error);
    getShows().then(setShows).catch(console.error);
    getOpportunities().then(setOpportunities).catch(console.error);
    getSongs().then(setSongs).catch(console.error);
    getVideos().then(setVideos).catch(console.error);
    getCourses().then(setCourses).catch(console.error);
  }, []);

  const refreshPresenters = async () => { setPresenters(await getPresenters()); };
  const refreshEvents = async () => { setEvents(await getEvents()); };
  const refreshShows = async () => { setShows(await getShows()); };
  const refreshOpportunities = async () => { setOpportunities(await getOpportunities()); };
  const refreshSongs = async () => { setSongs(await getSongs()); };
  const refreshVideos = async () => { setVideos(await getVideos()); };
  const refreshCourses = async () => { setCourses(await getCourses()); };

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardHeader title="Admin Dashboard" subtitle="Full site content control" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsRow
          presentersCount={presentersCount}
          showsCount={showsCount}
          eventsCount={eventsCount}
          opportunitiesCount={opportunitiesCount}
          songsCount={songsCount}
          videosCount={videosCount}
        />

        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="display text-3xl text-green-900">Content Management</h1>
            <p className="text-stone-500 text-sm mt-1">
              Manage upcoming activities (live sessions), languages, and every other content type on the public site.
              Changes appear immediately on the live pages.
            </p>
          </div>
          <Link href="/activities" className="text-orange-600 font-semibold text-sm flex items-center gap-1">
            <Icon name="calendar" className="w-4 h-4" /> View Upcoming Activities page
          </Link>
        </div>

        <TabNav tab={tab} setTab={setTab} />

        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          {tab === "schedule" && <ShowsManagement shows={shows} refreshShows={refreshShows} />}
          {tab === "languages" && <LanguagesManagement courses={courses} refreshCourses={refreshCourses} />}
          {tab === "music" && (
            <MusicManagement songs={songs} refreshSongs={refreshSongs} genres={genres} setGenres={setGenres} />
          )}
          {tab === "videos" && <VideosManagement videos={videos} refreshVideos={refreshVideos} />}
          {tab === "events" && <EventsManagement events={events} refreshEvents={refreshEvents} />}
          {tab === "careers" && (
            <CareersManagement opportunities={opportunities} refreshOpportunities={refreshOpportunities} />
          )}
          {tab === "presenters" && (
            <PresentersManagement presenters={presenters} refreshPresenters={refreshPresenters} />
          )}
          {tab === "genres" && <GenresManagement genres={genres} setGenres={setGenres} />}
        </div>
      </div>
    </div>
  );
}
