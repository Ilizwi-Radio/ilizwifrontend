"use client";

import { useEffect, useState } from "react";

const DISMISSAL_KEY = "ilizwi-essential-cookie-notice-dismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(sessionStorage.getItem(DISMISSAL_KEY) !== "true");
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSAL_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie information"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur sm:p-5"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-4xl text-sm leading-6 text-stone-700">
          iLIZWI uses an essential, secure cookie when you sign in to keep your session active. We don’t use advertising or analytics cookies. Playing an embedded YouTube video may allow YouTube to use its own technologies.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-green-900 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
        >
          Got it
        </button>
      </div>
    </aside>
  );
}
