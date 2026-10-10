# Hide content on the main page — what the admin now needs

The admin UI sends two things:

1. **Per item:** `updateX(id, { is_visible: false | true })` from the new Hide / Show row buttons.
2. **Per section:** `updateSiteSettings({ homepage_sections: { schedule: true, music: false, ... } })`.

A missing `is_visible` or a missing section key means **visible**, so nothing disappears until an admin hides it.

## 1. Database (adjust table names to yours)

```sql
ALTER TABLE shows         ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE courses       ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE songs         ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE videos        ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE events        ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);
INSERT INTO site_settings (key, value) VALUES ('homepage_sections', '{}') ON CONFLICT DO NOTHING;
```

## 2. Backend (Express)

- Make sure your existing PUT/PATCH handlers for the six tables **accept `is_visible`** (if you whitelist columns, add it).
- Add two routes:
  - `GET  /site-settings` → `{ homepage_sections: {...} }` (public, no auth)
  - `PUT  /site-settings` → admin only; merges `homepage_sections` into the row
- **Filter on the server for public requests.** Hidden items should not be in the JSON the public site receives. Easiest: public GETs add `WHERE is_visible = TRUE`, while the admin's authenticated calls return everything (the admin needs to see hidden rows to un-hide them). Either a separate public route, or a check on the admin role inside the existing GET.

## 3. `@/lib/api`

Add `getSiteSettings()` and `updateSiteSettings(patch)` in the same style as your other getters/updaters, pointing at the routes above.

## 4. Public homepage

Hiding a whole section:

```tsx
const [sections, setSections] = useState<Record<string, boolean>>({});
useEffect(() => {
  getSiteSettings().then((s) => setSections(s?.homepage_sections ?? {})).catch(console.error);
}, []);

{sections.music !== false && <MusicSection />}
```

If you can't filter on the server straight away, filter on the page as a stopgap (hidden items stay visible in the raw API response):

```tsx
const visibleSongs = songs.filter((s) => s.is_visible !== false);
```

Apply it everywhere these lists render, including the Upcoming Activities page (shows and events) and the notification bell.
