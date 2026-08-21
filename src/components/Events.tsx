"use client";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import {getEvents,registerForEvent} from "@/lib/api";
import {useEffect, useState} from "react";



export default function Events() {
  const [events, setEvents] =  useState<any[]>([]);
  const handleRegister = async (eventId: string) => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);
    console.log("User:",localStorage.getItem("user"));
      if (!token) {
        alert("Please log in to register for events.");
        return;
      }
    try {
      const result = await registerForEvent(eventId);
      console.log("Registration response:", result);
      setEvents((prev) => prev.map((event) => event.id === eventId ? { ...event, registered: true } : event));
      // Optionally, update the UI to reflect the registration status
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register for the event. Please try again later.");
    }
  };
  useEffect(() => {
    const loadEvents = async () => {
      const data = await getEvents();

      const mappedEvents = data.map((event: any) => {

        const date = new Date(event.start_at);

        return {
          id: event.id,
          title: event.title,
          tag: event.category,
          loc: event.location,
          date: date.getDate(),
          mon: date
            .toLocaleString("en", { month: "short" })
            .toUpperCase(),
          from: "#c9762f",
          to: "#3a1508",
          registered: false
        };
      });

      setEvents(mappedEvents);
    };

    loadEvents();

}, []);

if (!events.length) {
  return (
    <div className="py-20 text-center">
      Loading events...
    </div>
  );
}
  return (
    <FadeIn>
      <section id="events" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
            <Icon name="calendar" /> UPCOMING
          </div>
          <h2 className="display text-4xl text-green-900 mb-2">Events &amp; Festivals</h2>
          <p className="text-stone-500 max-w-lg">Join cultural celebrations, workshops and live experiences across Africa.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e) => (
            <div key={e.title} className="rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg transition-shadow">
              <div
                className="h-40 relative flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${e.from},${e.to})` }}
              >
                <span className="absolute top-2.5 left-2.5 bg-white text-green-900 rounded-lg px-2.5 py-1 text-center leading-none">
                  <span className="block font-extrabold text-lg">{e.date}</span>
                  <span className="block text-[10px] font-semibold">{e.mon}</span>
                </span>
                <span className="absolute top-2.5 right-2.5 bg-yellow-400 text-green-950 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {e.tag}
                </span>
              </div>
              <div className="p-4">
                <div className="font-bold text-green-900 mb-1">{e.title}</div>
                <div className="text-stone-500 text-sm flex items-center gap-1.5 mb-4">
                  <Icon name="pin" className="w-3.5 h-3.5" />
                  {e.loc}
                </div>
                <div className="flex gap-2.5">
                  <button className="flex-1 bg-green-900 hover:bg-green-800 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5"
                          onClick={()=> handleRegister(e.id)}>
                    <Icon name="ticket" className="w-3.5 h-3.5" />
                      {e.registered
                          ? "Registered ✓"
                          : "Register"}
                  </button>
                  <button className="flex-1 border border-stone-300 hover:bg-stone-50 rounded-lg py-2 text-sm font-semibold">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
