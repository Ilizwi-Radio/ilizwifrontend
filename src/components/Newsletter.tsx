"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="py-14" style={{ background: "linear-gradient(90deg,#ea6a10,#c23a1f)" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-white">
        <div>
          <h3 className="display text-2xl mb-1">Join the iLizwi Community</h3>
          <p className="text-white/85">Get weekly updates on new shows, music, language lessons &amp; cultural events.</p>
        </div>
        <form
          className="flex w-full sm:w-auto gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSubscribed(true);
          }}
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="rounded-full px-5 py-3 text-stone-800 flex-1 sm:w-72 outline-none"
          />
          <button className="btn-pill bg-green-900 hover:bg-green-800 px-5 py-3 font-semibold flex items-center gap-2 shrink-0">
            {subscribed ? "Subscribed ✓" : "Subscribe"} {!subscribed && <Icon name="send" />}
          </button>
        </form>
      </div>
    </section>
  );
}
