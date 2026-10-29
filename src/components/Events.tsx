"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import { getEvents, registerForEvent } from "@/lib/api";
import type { PublicEvent } from "@/lib/public-content";

function formatEvent(event: PublicEvent) {
  const date = event.start_at ? new Date(event.start_at) : null;
  const validDate = date && !Number.isNaN(date.getTime()) ? date : null;
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    tag: event.category || "EVENT",
    loc: event.location || "Location to be announced",
    date: validDate
      ? new Intl.DateTimeFormat("en-ZA", { day: "numeric", timeZone: "Africa/Johannesburg" }).format(validDate)
      : "",
    mon: validDate
      ? new Intl.DateTimeFormat("en-ZA", { month: "short", timeZone: "Africa/Johannesburg" }).format(validDate).toUpperCase()
      : "",
    from: "#c9762f",
    to: "#3a1508",
    registered: false,
  };
}

export default function Events({ initialEvents }: { initialEvents: PublicEvent[] }) {
  const [events, setEvents] = useState(() => initialEvents.map(formatEvent));

  const handleRegister = async (eventId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to register for events.");
      return;
    }

    try {
      await registerForEvent(eventId);
      setEvents((previous) => previous.map((event) =>
        event.id === eventId ? { ...event, registered: true } : event
      ));
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register for the event. Please try again later.");
    }
  };

  useEffect(() => {
    getEvents()
      .then((data) => {
        if (Array.isArray(data)) setEvents(data.map(formatEvent));
      })
      .catch((error) => console.error("Failed to refresh events:", error));
  }, []);

  if (!events.length) {
    return (
      <section id="events" className="py-20 text-center" aria-labelledby="events-heading">
        <h2 id="events-heading" className="display text-4xl text-green-900 mb-2">Events &amp; Festivals</h2>
        <p className="text-stone-500">No events are listed right now. Please check back soon.</p>
      </section>
    );
  }

  return (
    <FadeIn>
      <section id="events" className="max-w-7xl mx-auto px-6 py-20" aria-labelledby="events-heading">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
            <Icon name="calendar" /> UPCOMING
          </div>
          <h2 id="events-heading" className="display text-4xl text-green-900 mb-2">Events &amp; Festivals</h2>
          <p className="text-stone-500 max-w-lg">Join cultural celebrations, workshops and live experiences across Africa.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <article key={event.id} className="rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="h-40 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg,${event.from},${event.to})` }}>
                {event.date && (
                  <span className="absolute top-2.5 left-2.5 bg-white text-green-900 rounded-lg px-2.5 py-1 text-center leading-none">
                    <span className="block font-extrabold text-lg">{event.date}</span>
                    <span className="block text-[10px] font-semibold">{event.mon}</span>
                  </span>
                )}
                <span className="absolute top-2.5 right-2.5 bg-yellow-400 text-green-950 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {event.tag}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-green-900 mb-1">{event.title}</h3>
                {event.description && <p className="text-stone-500 text-sm mb-2">{event.description}</p>}
                <div className="text-stone-500 text-sm flex items-center gap-1.5 mb-4">
                  <Icon name="pin" className="w-3.5 h-3.5" />
                  {event.loc}
                </div>
                <div className="flex gap-2.5">
                  <button
                    className="flex-1 bg-green-900 hover:bg-green-800 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5"
                    onClick={() => handleRegister(event.id)}
                  >
                    <Icon name="ticket" className="w-3.5 h-3.5" />
                    {event.registered ? "Registered ✓" : "Register"}
                  </button>
                  <button className="flex-1 border border-stone-300 hover:bg-stone-50 rounded-lg py-2 text-sm font-semibold">Details</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
