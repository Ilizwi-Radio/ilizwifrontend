import Link from "next/link";
import Icon from "@/components/Icon";
import { getPublicHomepageContent } from "@/lib/public-content";

export const revalidate = 300;

function formatShowTime(value?: string | null) {
  if (!value) return "Time to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time to be announced";
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatEventDate(value?: string | null) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "long",
  }).format(date);
}

export default async function ActivitiesPage() {
  const { shows, events } = await getPublicHomepageContent();

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="bg-nav-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
              <Icon name="radio" className="w-4 h-4 text-white" />
            </span>
            <span className="font-bold">
              iLIZWI <span className="text-orange-400">RADIO</span>
            </span>
          </Link>
          <Link href="/" className="text-sm bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 font-semibold">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
          <Icon name="bell" className="w-4 h-4" /> UPCOMING ACTIVITIES
        </div>
        <h1 className="display text-4xl text-green-900 mb-3">What&apos;s Happening</h1>
        <p className="text-stone-500 max-w-lg mb-10">
          Explore upcoming iLizwi Radio shows, live sessions, and events celebrating African music and culture.
        </p>

        <section aria-labelledby="activity-shows-heading" className="mb-12">
          <h2 id="activity-shows-heading" className="font-bold text-lg text-green-900 mb-4">Live Radio Shows</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {shows.map((show) => {
              const isLive = show.is_live ?? show.status === "live";
              const host = [show.display_name || show.presenter_name, show.cohost_display_name]
                .filter(Boolean)
                .join(" & ");
              return (
                <article key={show.id} className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {isLive && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</span>}
                    <h3 className="font-semibold text-green-900">{show.title}</h3>
                  </div>
                  {show.description && <p className="text-stone-600 text-sm mb-2">{show.description}</p>}
                  <p className="text-stone-500 text-sm">
                    {host || "iLizwi Radio"} · {formatShowTime(show.scheduled_start)}
                    {show.language_code ? ` · ${show.language_code}` : ""}
                  </p>
                </article>
              );
            })}
            {shows.length === 0 && <p className="text-stone-500 text-sm">No live sessions are scheduled right now.</p>}
          </div>
        </section>

        <section aria-labelledby="activity-events-heading">
          <h2 id="activity-events-heading" className="font-bold text-lg text-green-900 mb-4">Events &amp; Festivals</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <article key={event.id} className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-green-900">{event.title}</h3>
                  {event.category && <span className="text-orange-600 text-xs font-bold">{event.category}</span>}
                </div>
                {event.description && <p className="text-stone-600 text-sm mb-2">{event.description}</p>}
                <p className="text-stone-500 text-sm">
                  {formatEventDate(event.start_at)}{event.location ? ` · ${event.location}` : ""}
                </p>
              </article>
            ))}
            {events.length === 0 && <p className="text-stone-500 text-sm">No events are scheduled right now.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
