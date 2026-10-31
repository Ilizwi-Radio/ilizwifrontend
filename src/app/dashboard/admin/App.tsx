"use client";

import { useEffect, useState } from "react";
import {
  getPresenters,
  getEvents,
  getShows,
  getOpportunities,
  getVideos,
  getSongs,
  getCourses,
} from "@/lib/api";
import {
  getRadioSourceMode,
  isRadioSourceMode,
  updateRadioSourceMode,
  type RadioSourceMode,
} from "@/lib/radioSourceApi";
import { getSiteSettings, updateSiteSettings } from "@/lib/api";
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
import SectionsManagement from "./SectionsManagement";
import UsersManagement from "./UsersManagement";

export default function App({ moderatorMode = false }: { moderatorMode?: boolean }) {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [sectionSettings, setSectionSettings] = useState<Record<string, boolean>>({});
  const [radioSourceMode, setRadioSourceMode] = useState<RadioSourceMode>("auto");
  const [radioSourceError, setRadioSourceError] = useState<string | null>(null);
  const [savingRadioSource, setSavingRadioSource] = useState(false);

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
    getEvents(true).then(setEvents).catch(console.error);
    getShows(true).then(setShows).catch(console.error);
    getOpportunities(true).then(setOpportunities).catch(console.error);
    getSongs(true).then(setSongs).catch(console.error);
    getVideos(true).then(setVideos).catch(console.error);
    getCourses(true).then(setCourses).catch(console.error);
    if (!moderatorMode) {
      getSiteSettings().then((s) => setSectionSettings(s?.homepage_sections ?? {})).catch(console.error);
      getRadioSourceMode()
        .then(setRadioSourceMode)
        .catch((error) => {
          console.error("Failed to load radio source mode:", error);
          setRadioSourceError("Could not load the current listener source setting.");
        });
    }
  }, []);

  const refreshPresenters = async () => { setPresenters(await getPresenters()); };
  const refreshEvents = async () => { setEvents(await getEvents(true)); };
  const refreshShows = async () => { setShows(await getShows(true)); };
  const refreshOpportunities = async () => { setOpportunities(await getOpportunities(true)); };
  const refreshSongs = async () => { setSongs(await getSongs(true)); };
  const refreshVideos = async () => { setVideos(await getVideos(true)); };
  const refreshCourses = async () => { setCourses(await getCourses(true)); };

  const toggleSection = async (key: string, visible: boolean) => {
    const next = { ...sectionSettings, [key]: visible };
    setSectionSettings(next); // optimistic, so the switch responds instantly
    try {
      await updateSiteSettings({ homepage_sections: next });
    } catch (err) {
      console.error(err);
      setSectionSettings(sectionSettings); // roll back if the save failed
    }
  };

  const changeRadioSourceMode = async (mode: RadioSourceMode) => {
    setSavingRadioSource(true);
    setRadioSourceError(null);
    try {
      setRadioSourceMode(await updateRadioSourceMode(mode));
    } catch (error) {
      console.error("Failed to update radio source mode:", error);
      setRadioSourceError("Could not save this setting. Please try again.");
    } finally {
      setSavingRadioSource(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardHeader
        title={moderatorMode ? "Content Manager Dashboard" : "Admin Dashboard"}
        subtitle={moderatorMode ? "Manage station content" : "Full site and account control"}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!moderatorMode && <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Listener radio source</h2>
              <p className="mt-1 max-w-2xl text-sm text-stone-600">
                Automatic follows the presenter Icecast stream while a broadcast is live, then returns listeners to Zeno.
                Use an override if you need to test or temporarily fall back.
              </p>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-stone-700">
              Source
              <select
                value={radioSourceMode}
                disabled={savingRadioSource}
                onChange={(event) => {
                  if (isRadioSourceMode(event.target.value)) {
                    changeRadioSourceMode(event.target.value);
                  }
                }}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 disabled:opacity-60"
              >
                <option value="auto">Automatic</option>
                <option value="zeno">Force Zeno</option>
                <option value="presenter">Force presenter stream</option>
              </select>
            </label>
          </div>
          {radioSourceError && (
            <p role="alert" className="mt-3 text-sm text-red-700">{radioSourceError}</p>
          )}
        </section>}

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

        <TabNav tab={tab} setTab={setTab} showAdminTabs={!moderatorMode} />

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
            <PresentersManagement
              presenters={presenters}
              refreshPresenters={refreshPresenters}
              allowAccountActions={!moderatorMode}
            />
          )}
          {tab === "genres" && <GenresManagement genres={genres} setGenres={setGenres} />}
          {!moderatorMode && tab === "sections" && <SectionsManagement settings={sectionSettings} onToggle={toggleSection} />}
          {!moderatorMode && tab === "users" && <UsersManagement />}
        </div>
      </div>
    </div>
  );
}
