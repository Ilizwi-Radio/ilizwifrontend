"use client";


import { useEffect, useState } from "react";
import { getPresenters,createPresenter, updatePresenter, deletePresenter,
  getEvents, createEvent,  updateEvent,  deleteEvent,
  getShows, createShow,  updateShow,  deleteShow,
  getOpportunities,  createOpportunity,  updateOpportunity,  deleteOpportunity,
  getVideos,createVideo,updateVideo,
  deleteVideo,  getSongs,createSong,updateSong,deleteSong,
  getCourses,createCourse,updateCourse,deleteCourse} from "@/lib/api";
import RequireRole from "@/components/RequireRole";
import DashboardHeader from "@/components/DashboardHeader";

import AdminCollectionEditor, { FieldConfig } from "@/components/AdminCollectionEditor";
import Link from "next/link";
import Icon from "@/components/Icon";

const TABS = [
  { key: "schedule", label: "Live Sessions" },
  { key: "languages", label: "Languages" },
  { key: "music", label: "Music" },
  { key: "videos", label: "Videos" },
  { key: "events", label: "Events" },
  { key: "careers", label: "Careers" },
  { key: "presenters", label: "Presenters" },
  { key: "genres", label: "Genres" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const scheduleFields: FieldConfig[] = [
  { key: "title", label: "Show Title", placeholder: "Morning Heritage Show" },
  { key: "host", label: "Host Name", placeholder: "AI Presenter Nala" },
  { key: "type", label: "Host Type", type: "select", options: ["AI PRESENTER", "LIVE HOST", "VIDEO SHOW"] },
  { key: "icon", label: "Icon", type: "select", options: ["mic", "video", "briefcase"] },
  { key: "tag", label: "Time / Tag", placeholder: "e.g. 10:00 or LIVE" },
  { key: "tagColor", label: "Tag Color Class", placeholder: "bg-black/60 or bg-red-600" },
  { key: "lang", label: "Language", placeholder: "isiZulu" },
  { key: "listeners", label: "Listener Count (leave blank if not live)", placeholder: "12,847" },
  { key: "cta", label: "Button Label", type: "select", options: ["Join Live", "Set Reminder"] },
  { key: "imgFrom", label: "Gradient Start", type: "color", placeholder: "#ea6a10" },
  { key: "imgTo", label: "Gradient End", type: "color", placeholder: "#7a2e0f" },
  { key: "presenterId", label: "Presenter Account ID (optional)", placeholder: "presenter-sipho" },
];

const languageFields: FieldConfig[] = [
  { key: "name", label: "Language Name", placeholder: "isiZulu" },
  { key: "code", label: "Country Code", placeholder: "ZA" },
  { key: "region", label: "Region", placeholder: "South Africa" },
  { key: "speakers", label: "Speaker Count", placeholder: "12M speakers" },
  { key: "phrase", label: "Sample Phrase", placeholder: "Sawubona" },
  { key: "translation", label: "Translation", placeholder: "Hello (I see you)" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#1c8a4e" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#0b3a20" },
];

const musicFields: FieldConfig[] = [
  { key: "title", label: "Track Title", placeholder: "Soweto Sunrise" },
  { key: "artist", label: "Artist", placeholder: "Thandi Khumalo" },
  { key: "tag", label: "Genre", placeholder: "Amapiano" },
  { key: "plays", label: "Play Count", placeholder: "2.4M" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#8a6d1a" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#3a2c08" },
];

const videoFields: FieldConfig[] = [
  { key: "title", label: "Video Title", placeholder: "Heritage Day Celebration 2025" },
  { key: "tag", label: "Category", placeholder: "CULTURAL" },
  { key: "views", label: "Views", placeholder: "142K views" },
  { key: "dur", label: "Duration", placeholder: "24:18" },
  { key: "big", label: "Feature as large card", type: "checkbox" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#c9762f" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#7a3a17" },
];

const eventFields: FieldConfig[] = [
  { key: "title", label: "Event Title", placeholder: "AfroFest 2026" },
  { key: "date", label: "Day", placeholder: "12" },
  { key: "mon", label: "Month (3-letter)", placeholder: "JUN" },
  { key: "tag", label: "Category", placeholder: "FESTIVAL" },
  { key: "loc", label: "Location", placeholder: "Johannesburg, ZA" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#c9762f" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#3a1508" },
];

const presenterFields: FieldConfig[] = [
  { key: "display_name", label: "Display Name" },
  {key: "presenter_type",   label: "Presenter Type" },
  {key: "bio", label: "Bio"},
  { key: "status", label: "Status"}
];

const careerFields: FieldConfig[] = [
  { key: "title", label: "Role Title", placeholder: "Cultural Content Writer" },
  { key: "dept", label: "Department", placeholder: "Heritage Team" },
  { key: "tag", label: "Type", type: "select", options: ["INTERNSHIP", "FULL-TIME", "VOLUNTEER", "SCHOLARSHIP", "CONTRACT"] },
  { key: "deadline", label: "Deadline", placeholder: "20 Jun" },
  { key: "icon", label: "Icon", type: "select", options: ["mic", "briefcase", "heart", "cap"] },
  { key: "iconBg", label: "Icon Background Classes", placeholder: "bg-green-100 text-green-700" },
  { key: "tagStyle", label: "Tag Style Classes", placeholder: "bg-green-900 text-white" },
];


function AdminContent() {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [presentersCount, setPresentersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [showsCount, setShowsCount] = useState(0);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);

const songsCount = songs.length;
const videosCount = videos.length;

  const [genres, setGenres] = useState<string[]>([ "All"]);
  const [tab, setTab] = useState<TabKey>("schedule");
  const [genreInput, setGenreInput] = useState("");  
  useEffect(() => {
    getPresenters().then((data) => {
      setPresenters(data);
      setPresentersCount(data.length);
    }).catch(console.error);

    getEvents().then((data) => {
      setEvents(data);
      setEventsCount(data.length);
    }).catch(console.error);
      
    getShows().then((data) => {
      setShows(data);
      setShowsCount(data.length);
    }).catch(console.error);

    getOpportunities().then((data) => {
      setOpportunities(data);
      setOpportunitiesCount(data.length);
    }).catch(console.error);

    getSongs()
    .then(setSongs)
    .catch(console.error);

    getVideos()
    .then(setVideos)
    .catch(console.error);

    getCourses()
    .then(setCourses)
    .catch(console.error);

  }, []);

const refreshPresenters = async () => {const data = await getPresenters(); setPresenters(data);
  setPresentersCount(data.length);
};

const refreshEvents = async () => {const data = await getEvents(); setEvents(data);
   setEventsCount(data.length);
};

const refreshShows = async () => {const data = await getShows(); setShows(data);
  setShowsCount(data.length);
};

const refreshOpportunities = async () => { const data = await getOpportunities(); setOpportunities(data);
  setOpportunitiesCount(data.length);
};
const refreshSongs = async () => { const data = await getSongs();setSongs(data);};
const refreshVideos = async () => { const data = await getVideos(); setVideos(data);};
const refreshCourses = async () => { const data = await getCourses(); setCourses(data);};
  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardHeader title="Admin Dashboard" subtitle="Full site content control" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-6 gap-4 mb-8">

  <div className="bg-white p-5 rounded-2xl border">
    <p className="text-sm text-stone-500">
      Presenters
    </p>

    <h2 className="text-3xl font-bold">
      {presentersCount}
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl border">
    <p className="text-sm text-stone-500">
      Shows
    </p>

    <h2 className="text-3xl font-bold">
      {showsCount}
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl border">
    <p className="text-sm text-stone-500">
      Events
    </p>

    <h2 className="text-3xl font-bold">
      {eventsCount}
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl border">
    <p className="text-sm text-stone-500">
      Opportunities
    </p>

    <h2 className="text-3xl font-bold">
      {opportunitiesCount}
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl border">
  <p className="text-sm text-stone-500">
    Songs
  </p>

  <h2 className="text-3xl font-bold">
    {songsCount}
  </h2>
</div>

<div className="bg-white p-5 rounded-2xl border">
  <p className="text-sm text-stone-500">
    Videos
  </p>

  <h2 className="text-3xl font-bold">
    {videosCount}
  </h2>
</div>

</div>
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

        <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-200 pb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                tab === t.key ? "bg-green-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          {tab === "schedule" && (
            <AdminCollectionEditor
              title="Live Sessions & Schedule"
              description="These power both the homepage schedule grid and the public Upcoming Activities page (linked from the notification bell)."
              items={shows}
              fields={scheduleFields}
              idPrefix="sched"
              columns={["title", "status"]}
              onAdd={async (item) => {  await createShow(item);     await refreshShows(); }}

              onUpdate={async (id, patch) => { await updateShow(id, patch); await refreshShows(); }}

              onDelete={async (id) => { await deleteShow(id); await refreshShows(); }}
            />
          )}
          {tab === "languages" && (
            <AdminCollectionEditor
              title="Language Hub"
              description="Cards shown on the Learn African Languages section."
              items={courses}
              fields={languageFields}
              idPrefix="lang"
              columns={["name", "region"]}
              onAdd={async (item) => {
                await createCourse(item);
                await refreshCourses();
              }}

              onUpdate={async (id, patch) => {
                await updateCourse(id, patch);
                await refreshCourses();
              }}

              onDelete={async (id) => {
                await deleteCourse(id);
                await refreshCourses();
              }}
            />
          )}
          {tab === "music" && (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-lg text-green-900 mb-3">Genres</h3>
                <p className="text-stone-500 text-sm mb-3">Powers the filter pills on the Music Library.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {genres.map((g) => (
                    <span key={g} className="inline-flex items-center gap-2 bg-stone-100 rounded-full px-3 py-1.5 text-sm">
                      {g}
                      {g !== "All" && (
                        <button
                          onClick={() => setGenres(genres.filter((x) => x !== g))}
                          className="text-stone-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
                      setGenres([...genres, genreInput.trim()]);
                    }
                    setGenreInput("");
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    placeholder="Add a genre…"
                    className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                  />
                  <button type="submit" className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2">
                    Add
                  </button>
                </form>
              </div>

              <AdminCollectionEditor
                  title="Tracks"
                  items={songs}
                  fields={musicFields}
                  idPrefix="music"
                  columns={["title", "artist"]}
                  onAdd={async (item) => {
                    await createSong(item);
                    await refreshSongs();
                  }}
                  onUpdate={async (id, patch) => {
                    await updateSong(id, patch);
                    await refreshSongs();
                  }}
                  onDelete={async (id) => {
                    await deleteSong(id);
                    await refreshSongs();
                  }}
                />
            </div>
          )}
          {tab === "videos" && (
            <AdminCollectionEditor
              title="Video Hub"
              items={videos}
              fields={videoFields}
              idPrefix="video"
              columns={["title"]}
              onAdd={async (item) => {
                await createVideo(item);
                await refreshVideos();
              }}
              onUpdate={async (id, patch) => {
                await updateVideo(id, patch);
                await refreshVideos();
              }}
              onDelete={async (id) => {
                await deleteVideo(id);
                await refreshVideos();
              }}
            />
          )}
          {tab === "events" && (
            <AdminCollectionEditor
              title="Events & Festivals"
              description="These also appear on the public Upcoming Activities page."
              items={events}
              fields={eventFields}
              idPrefix="event"
              columns={["title", "location"]}
              onAdd={async (item) => {
                await createEvent(item);
                await refreshEvents();
              }}

              onUpdate={async (id, patch) => {
                await updateEvent(id, patch);
                await refreshEvents();
              }}

              onDelete={async (id) => {
                await deleteEvent(id);
                await refreshEvents();
}}
            />
          )}
          {tab === "careers" && (
            <AdminCollectionEditor
              title="Careers & Empowerment"
              items={opportunities}
              fields={careerFields}
              idPrefix="career"
              columns={["title", "category"]}
             onAdd={async (item) => {
                await createOpportunity(item);
                await refreshOpportunities();
              }}

              onUpdate={async (id, patch) => {
                await updateOpportunity(id, patch);
                await refreshOpportunities();
              }}

              onDelete={async (id) => {
                await deleteOpportunity(id);
                await refreshOpportunities();
              }}
            />
          )}
          {tab === "presenters" && (
            <AdminCollectionEditor
              title="Presenters"
              description="Adding a presenter here does not create their login — that's provisioned separately (see BACKEND_INTEGRATION_MAP.md, Auth service)."
              items={presenters}
              fields={presenterFields}
              idPrefix="presenter"
              columns={["display_name", "presenter_type"]}
              onAdd={async (item) => { await createPresenter(item); await refreshPresenters();}}
              onUpdate={async (id, patch) => { await updatePresenter(id, patch); await refreshPresenters();}}
              onDelete={async (id) => {  await deletePresenter(id);  await refreshPresenters();}}
            />
          )}
          {tab === "genres" && (
            <div>
              <h3 className="font-bold text-lg text-green-900 mb-3">Genres</h3>
              <p className="text-stone-500 text-sm mb-3">Also editable from the Music tab.</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span key={g} className="bg-stone-100 rounded-full px-3 py-1.5 text-sm">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireRole role="admin">
      <AdminContent />
    </RequireRole>
  );
}
