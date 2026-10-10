// --- STUB: replace with real API calls ---
// Same idea as handleResetPassword: lets the admin page load and the section
// switches move, but it only saves in THIS browser, so it does NOT hide anything
// on the public site yet.
//
// When the backend route exists, add getSiteSettings / updateSiteSettings to
// @/lib/api (same style as your other functions), delete this file, and change
// the import in App.tsx back to "@/lib/api".

const KEY = "ilizwi_site_settings";

export async function getSiteSettings(): Promise<{ homepage_sections?: Record<string, boolean> }> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export async function updateSiteSettings(patch: { homepage_sections?: Record<string, boolean> }) {
  const current = await getSiteSettings();
  const next = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
// --- end stub ---
