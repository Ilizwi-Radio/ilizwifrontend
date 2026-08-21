# iLizwi Radio — Frontend → Backend Integration Map

**Purpose:** every place in the Next.js frontend that currently renders mock/static data or a non-functional button, mapped to the backend service that should power it (per the TRD's service list), with the exact file/line, the suggested endpoint, and the expected request/response shape.

Legend for **TRD Service** column = the service names from Section 4 of the TRD (Auth, User, Broadcast, Music, Video, Learning, Community, Events, Careers, Analytics, Payments, Admin).

All suggested endpoints follow the TRD's `/api/v1/...` REST convention (Section 6).

---

## 1. Navbar — `src/components/Navbar.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 1.1 | Search button | `Navbar.tsx:33-35` | Icon-only, no handler | Music / Video / Events / User (aggregated search) | `GET /api/v1/search?q={query}&type=all` | Query param `q: string`, optional `type: "music"\|"video"\|"event"\|"presenter"` | `{ music: MusicTrack[], videos: VideoItem[], events: EventItem[], presenters: Presenter[] }` |
| 1.2 | Notification bell + badge dot | `Navbar.tsx:36-39` | Static dot, always shown | Community (notifications) | `GET /api/v1/notifications?unread=true` (poll or WebSocket) | Auth header (JWT) | `{ unreadCount: number, items: Notification[] }` where `Notification = { id, type, message, createdAt, read }` |
| 1.3 | Account/user icon | `Navbar.tsx:40-42` | Icon-only, no session awareness | Auth | `GET /api/v1/auth/me` | Auth header (JWT) | `{ id, name, avatarUrl, role }` on success; 401 → render as "Log In" link instead of icon |
| 1.4 | "LISTEN LIVE" pill button | `Navbar.tsx:43-45` | No handler | Broadcast | `GET /api/v1/broadcast/live` | none | `{ streamUrl: string (HLS/DASH), nowPlaying: { title, hostName, language, listeners } }` — result should feed a **global audio player context** (see §9) so this button and the Hero player share state |
| 1.5 | Nav link anchors (Live Radio, Music, Videos, Languages, Events, Careers, Community) | `Navbar.tsx:3-4, 25-29` | In-page `#anchor` scroll links | — | N/A | — | If these become real routes (`/music`, `/videos`, etc.) rather than sections on one page, swap `href="#music"` for `href="/music"` — no data needed here, just routing |

---

## 2. Hero — `src/components/Hero.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 2.1 | "BROADCASTING LIVE • 12,882 LISTENERS" badge | `Hero.tsx:34` | Hardcoded string | Broadcast | `GET /api/v1/broadcast/live` (same call as 1.4 — fetch once, share via context) | none | `{ isLive: boolean, listenerCount: number }` |
| 2.2 | "LIVE ON AIR" badge on player art | `Hero.tsx:76-78` | Hardcoded, always shown | Broadcast | same as above | — | `isLive: boolean` toggles this badge |
| 2.3 | Now Playing block (title, presenter, language) | `Hero.tsx:86-88` | Hardcoded "Morning Heritage Show" / "AI Presenter Nala" / "isiZulu" | Broadcast | `GET /api/v1/broadcast/live` | — | `{ nowPlaying: { title: string, hostName: string, language: string, hostType: "ai"\|"human" } }` |
| 2.4 | Listener count (right side) | `Hero.tsx:90-92` | Hardcoded "12,882" | Broadcast / Analytics | same call, ideally pushed over WebSocket for live increment | — | `{ listenerCount: number }` — recommend a WS channel (`wss://.../broadcast/live`) since this changes constantly, per TRD §11 scalability notes |
| 2.5 | Waveform bars | `Hero.tsx:95-99` | Decorative random heights, not driven by real audio | Broadcast (stream) | N/A (client-side audio analysis) | — | Should be replaced with a real `<audio>`/HLS.js element bound to `streamUrl` from 2.1, with a `Web Audio API AnalyserNode` driving bar heights from actual frequency data |
| 2.6 | Play button, volume icon, progress bar, "LIVE" label | `Hero.tsx:101-108` | Decorative, no playback wired up | Broadcast | Consumes `streamUrl` from `GET /api/v1/broadcast/live` | — | Wire to an actual `<audio src={streamUrl}>` (or hls.js instance for adaptive bitrate per TRD §2/§11); play/pause toggles `audio.play()/.pause()` |
| 2.7 | "Listen Live Now" button | `Hero.tsx:48-50` | No handler | Broadcast | same as 2.6 | — | Should call the same play handler as 2.6 |
| 2.8 | "Learn a Language" button | `Hero.tsx:51-53` | No handler | Learning | Routes to `/languages` (Learning service course list) | — | `GET /api/v1/learning/courses` on that page: `{ courses: Course[] }` |
| 2.9 | Stat chips: "120+ Shows", "85K Members" | `Hero.tsx:63-64, 68-69` | Hardcoded | Broadcast (show count) / User (member count) | `GET /api/v1/broadcast/shows/count`, `GET /api/v1/users/count` | — | `{ count: number }` each — or combine into one `GET /api/v1/stats/platform` returning `{ showCount, memberCount, podcastCount }` |

---

## 3. Live Broadcasts / Schedule — `src/components/LiveBroadcasts.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 3.1 | Schedule grid | `LiveBroadcasts.tsx:3, 25` (data source: `src/lib/data.ts` `schedule` array) | Static array of 8 mock shows | Broadcast | `GET /api/v1/broadcast/schedule?date=today` | Optional `date` query param (`YYYY-MM-DD`) | `ScheduleItem[]` — see shape below |
| 3.2 | "LIVE" tag + pulsing dot | `LiveBroadcasts.tsx:31-33` | Hardcoded per mock item (`tag === "LIVE"`) | Broadcast | same call | — | Each item needs `isLive: boolean` |
| 3.3 | Host-type icon (mic / video / briefcase) | `LiveBroadcasts.tsx:36` | Cast from mock `icon` string | Broadcast | same call | — | Each item needs `hostType: "human" \| "ai" \| "video"` (frontend maps this to an icon) |
| 3.4 | Listener count (only shown on live item) | `LiveBroadcasts.tsx:45-50` | Hardcoded "12,847" | Broadcast / Analytics | same call, ideally live via WS for the currently-live item | — | `listeners?: number` |
| 3.5 | CTA button: "Join Live" vs "Set Reminder" | `LiveBroadcasts.tsx:52-54` | Static label, no handler | Broadcast (Join Live) / Community or notification service (Set Reminder) | Join Live: same as Hero 2.6 play handler, scrolled to top player. Set Reminder: `POST /api/v1/broadcast/{showId}/reminder` | Set Reminder body: `{ userId: string }` (from auth session) | Join Live: none (client action). Set Reminder: `{ success: boolean, reminderId: string }` |
| 3.6 | "View Full Schedule" link | `LiveBroadcasts.tsx:19-21` | `href="#"`, no destination | Broadcast | Routes to a full schedule page calling `GET /api/v1/broadcast/schedule` (paginated, no date filter, or a date-picker) | `page`, `pageSize` | `{ items: ScheduleItem[], total: number }` |

**`ScheduleItem` shape (suggested):**
```ts
{
  id: string;
  startTime: string;      // ISO 8601
  isLive: boolean;
  hostType: "human" | "ai" | "video";
  title: string;
  hostName: string;
  language: string;
  listeners?: number;
  imageUrl?: string;       // replaces the current CSS gradient placeholder
}
```

---

## 4. Music Library — `src/components/MusicLibrary.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 4.1 | Genre filter pills | `MusicLibrary.tsx:5, 27-37` (data: `genres` array in `data.ts`) | Static list `["All","Afrobeat","Amapiano","Gospel","Traditional","Hip-Hop","Jazz"]` | Music | `GET /api/v1/music/genres` | — | `string[]` or `{ id, label }[]` if genres need stable IDs |
| 4.2 | Genre filter state/logic | `MusicLibrary.tsx:8-9` | Client-side `Array.filter()` on the full mock list | Music | `GET /api/v1/music?genre={genre}&page={n}` | `genre?: string`, pagination | `{ items: MusicTrack[], total: number }` — move filtering server-side once catalog is large |
| 4.3 | Music grid / track cards | `MusicLibrary.tsx:5, 41` (data: `musicItems` in `data.ts`) | 8 static mock tracks | Music | same as 4.2 | — | `MusicTrack = { id, title, artist, genre, coverUrl, plays, audioUrl, likedByUser? }` |
| 4.4 | Heart/like button | `MusicLibrary.tsx:50-52` | No handler | Music (or User service, storing likes on user profile) | `POST /api/v1/music/{trackId}/like` / `DELETE /api/v1/music/{trackId}/like` | Auth header; no body | `{ liked: boolean, likeCount: number }` |
| 4.5 | Play button on card | `MusicLibrary.tsx:53-55` | No handler | Music | Track's `audioUrl` from 4.3, or `GET /api/v1/music/{trackId}/stream` if signed URLs are needed | — | Feeds a **global music player** (separate from the live radio player in Hero) |
| 4.6 | Play count ("2.4M plays") | `MusicLibrary.tsx:60-63` | Hardcoded string per track | Music / Analytics | Included in 4.3 response (`plays: number`), increment via `POST /api/v1/music/{trackId}/play-event` when playback starts | — | `{ plays: number }` |

---

## 5. Cultural Badges Promo — `src/components/BadgePromo.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 5.1 | "Sign Up to Track Progress" button | entire file, button element | No handler | Auth (signup) + Learning (badge tracking enrollment) | If logged out: routes to signup (`POST /api/v1/auth/register`). If logged in: `POST /api/v1/learning/badges/opt-in` | Signup: `{ email, password, name }`. Opt-in: auth header only | Signup: `{ userId, token }`. Opt-in: `{ success: boolean }` |

---

## 6. Video Hub — `src/components/VideoHub.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 6.1 | Video grid | `VideoHub.tsx:3, 26` (data: `videos` in `data.ts`) | 6 static mock videos | Video | `GET /api/v1/videos?category={cat}&page={n}` | Optional `category`, pagination | `{ items: VideoItem[], total: number }` |
| 6.2 | Category tag pill | `VideoHub.tsx:35-37` | Hardcoded per mock item | Video | included in 6.1 response | — | `category: string` |
| 6.3 | Bookmark button | `VideoHub.tsx:39-41` | No handler | Video (or User service) | `POST /api/v1/videos/{id}/bookmark` / `DELETE /api/v1/videos/{id}/bookmark` | Auth header | `{ bookmarked: boolean }` |
| 6.4 | Download button | `VideoHub.tsx:42-44` | No handler | Video (Object/Media Storage) | `GET /api/v1/videos/{id}/download` | Auth header (if download is a paid/gated feature) | `{ downloadUrl: string }` — signed, short-lived S3-compatible URL per TRD §6 |
| 6.5 | Play button overlay | `VideoHub.tsx:46-48` | No handler | Video | Track's `videoUrl`/HLS manifest from 6.1, or `GET /api/v1/videos/{id}/stream` | — | Opens a video player (modal or dedicated page) streaming via CDN/adaptive bitrate |
| 6.6 | Duration badge | `VideoHub.tsx:50-51` | Hardcoded ("24:18" etc.) | Video | included in 6.1 response | — | `duration: string` (or seconds, formatted client-side) |
| 6.7 | View count | `VideoHub.tsx:54` | Hardcoded ("142K views") | Video / Analytics | included in 6.1 response, increment via `POST /api/v1/videos/{id}/view-event` | — | `{ views: number }` |
| 6.8 | "Browse All Videos" link | `VideoHub.tsx:20-22` | `href="#"` | Video | Routes to full catalog page calling `GET /api/v1/videos` (no filter) | pagination | `{ items: VideoItem[], total: number }` |

---

## 6b. Language Hub — `src/components/LanguageHub.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 6b.1 | Language cards grid | `LanguageHub.tsx` (data: `languages` in `data.ts`) | 8 static mock languages (isiZulu, isiXhosa, Swahili, Yoruba, Sesotho, Shona, Tswana, Amharic) | Learning (per TRD §5.2 "Supported AI Languages" / §5.5 Language Learning AI) | `GET /api/v1/learning/languages` | — | `LanguageItem[]` — see shape below |
| 6b.2 | Country code + flag-style badge ("ZA", "KE", "NG"...) | `LanguageHub.tsx` (card header block) | Hardcoded per mock item | Learning | included in 6b.1 | — | `countryCode: string` (ISO 3166-1 alpha-2) |
| 6b.3 | Region + speaker count ("South Africa • 12M speakers") | `LanguageHub.tsx` (card header block) | Hardcoded | Learning | included in 6b.1 | — | `{ region: string, speakerCount: string }` |
| 6b.4 | Sample phrase + translation ("Sawubona" / "Hello (I see you)") | `LanguageHub.tsx` (phrase row) | Hardcoded single example phrase per language | Learning | included in 6b.1, or a separate `GET /api/v1/learning/languages/{code}/sample-phrase` if phrases rotate | — | `{ phrase: string, translation: string }` |
| 6b.5 | Speaker/pronunciation button | `LanguageHub.tsx` (`aria-label="Hear pronunciation..."` button) | No handler, decorative icon only | AI Services — TTS (Coqui, per TRD §5.1) | `GET /api/v1/learning/languages/{code}/pronounce?text={phrase}` | `text` or a `phraseId` | Audio stream/URL (`audio/mpeg` or signed URL) — plays the TTS-generated pronunciation of the sample phrase |
| 6b.6 | "Start Lesson 1" button | `LanguageHub.tsx` (bottom CTA button) | No handler | Learning | Routes to `GET /api/v1/learning/languages/{code}/lessons/1` | Auth header (to track progress against the user, per TRD §5.5 and the "Cultural Badges" feature in §5) | `{ lessonId, content, exercises: [...] }` — this is also where the "Learn a Language" button in the Hero (§2.8) and the "Earn Cultural Badges" promo (§5) should ultimately land the user |

**`LanguageItem` shape (suggested):**
```ts
{
  code: string;          // ISO country code, e.g. "ZA"
  name: string;           // e.g. "isiZulu"
  region: string;         // e.g. "South Africa"
  speakerCount: string;   // e.g. "12M speakers" (or a raw number, formatted client-side)
  samplePhrase: string;   // e.g. "Sawubona"
  translation: string;    // e.g. "Hello (I see you)"
}
```

---

## 7. Events & Festivals — `src/components/Events.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 7.1 | Events grid | `Events.tsx:3, 18` (data: `events` in `data.ts`) | 6 static mock events | Events | `GET /api/v1/events?upcoming=true&page={n}` | pagination | `{ items: EventItem[], total: number }` |
| 7.2 | Date badge (day/month) | `Events.tsx:25-26` | Hardcoded per mock item | Events | included in 7.1 | — | `startDate: string` (ISO), split into day/month client-side |
| 7.3 | Category tag ("FESTIVAL", "WORKSHOP", etc.) | `Events.tsx:28-30` | Hardcoded | Events | included in 7.1 | — | `category: string` |
| 7.4 | Location | `Events.tsx:36` | Hardcoded ("Johannesburg, ZA" etc.) | Events | included in 7.1 | — | `location: string` |
| 7.5 | "Register" button | `Events.tsx:39-42` | No handler | Events, and Payments if the event is ticketed | `POST /api/v1/events/{id}/register` | `{ userId }` (auth), or route into a checkout flow if `event.isPaid` (Payments service, per TRD §4/§7) | `{ success: boolean, ticketId?: string }` |
| 7.6 | "Details" button | `Events.tsx:43` | No handler | Events | Routes to detail page calling `GET /api/v1/events/{id}` | — | Full `EventItem` incl. description, capacity, etc. |

---

## 8. Community / Meet The Voices — `src/components/Community.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 8.1 | Presenter cards | `Community.tsx:3, 17` (data: `presenters` in `data.ts`) | 4 static mock presenters | User (presenter profiles) | `GET /api/v1/users?role=presenter&page={n}` | pagination | `{ items: Presenter[], total: number }` |
| 8.2 | "AI PRESENTER" badge | `Community.tsx:23-27` | Hardcoded `p.ai` boolean on mock data | User | included in 8.1 | — | `isAI: boolean` |
| 8.3 | Follower count | `Community.tsx:34` | Hardcoded ("24.5K" etc.) | User | included in 8.1 | — | `followerCount: number` |
| 8.4 | "Follow" button | `Community.tsx:35-37` | No handler | User / Community | `POST /api/v1/users/{presenterId}/follow` / `DELETE .../follow` | Auth header | `{ following: boolean, followerCount: number }` |
| 8.5 | Stats row: "142K Daily Conversations", "38K Cultural Badges Earned", "4.9★ Community Rating" | `Community.tsx:50, 59, 68` | Hardcoded | Analytics | `GET /api/v1/stats/community` | — | `{ dailyConversations: number, badgesEarned: number, communityRating: number }` |

---

## 9. Careers & Empowerment — `src/components/Careers.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 9.1 | Job/opportunity cards | `Careers.tsx:3, 26` (data: `careers` in `data.ts`) | 6 static mock listings | Careers | `GET /api/v1/careers?type={type}&page={n}` | Optional `type` (internship/full-time/volunteer/scholarship/contract), pagination | `{ items: CareerItem[], total: number }` |
| 9.2 | Type tag + deadline | `Careers.tsx:33-34` | Hardcoded | Careers | included in 9.1 | — | `{ type: string, deadline: string (ISO date) }` |
| 9.3 | "Apply Now" link | `Careers.tsx:39-41` | `href="#"` | Careers | Routes to application form → `POST /api/v1/careers/{id}/apply` (multipart, for CV upload) | `{ userId, coverNote }` + file (CV) → stored via Object Storage per TRD §6 | `{ applicationId: string, status: "submitted" }` |
| 9.4 | "All Opportunities" link | `Careers.tsx:20-22` | `href="#"` | Careers | Routes to full listing page, `GET /api/v1/careers` (no filter) | pagination | `{ items: CareerItem[], total: number }` |

---

## 10. Newsletter — `src/components/Newsletter.tsx`

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Request data | Response data |
|---|---|---|---|---|---|---|---|
| 10.1 | Email input + "Subscribe" button | `Newsletter.tsx` (entire `<form onSubmit>` handler) | `event.preventDefault()` only — sets local `subscribed` state, no network call | Admin/Community (or a 3rd-party ESP integration, per TRD §7 third-party integrations) | `POST /api/v1/newsletter/subscribe` | `{ email: string }` | `{ success: boolean }` — surface validation errors (already-subscribed, invalid email) back into the form |

---

## 11. Footer — `src/components/Footer.tsx`

Mostly static navigation — no backend needed for the link columns (Platform/Community/About) as long as they route to real pages. Two items worth flagging:

| # | Feature | File:Line | Current state | TRD Service | Suggested endpoint | Notes |
|---|---|---|---|---|---|---|
| 11.1 | Social icons (f / 𝕏 / ig / yt) | `Footer.tsx` (`FooterCol`/social block) | `href="#"` placeholders | — | N/A | Just needs real social profile URLs — no API |
| 11.2 | "Become a Presenter", "Artist Submission", "Volunteer", "Support" links | `Footer.tsx` (`FooterCol` links array) | `href="#"` placeholders | Careers / User / Community | Likely each routes to its own application form, similar pattern to §9.3 | Confirm with product whether these are separate forms or funnel into the Careers endpoints |

---

## 12. Global / cross-cutting concerns

These aren't tied to one component but affect several of the items above:

1. **Auth/session state.** Several features (Follow, Like, Bookmark, Set Reminder, Apply Now, Newsletter, Account icon) need to know if a user is logged in and attach a JWT (per TRD §9 Security Requirements). Recommend a `useAuth()` / `AuthContext` at the `layout.tsx` level, backed by `GET /api/v1/auth/me`, so every component can read `user` / `isAuthenticated` without re-fetching.
2. **Global audio player.** The "LISTEN LIVE" nav button (1.4), Hero's player (2.1–2.7), and the schedule's "Join Live" (3.5) all need to share one live-audio-player state (so pressing "Join Live" on a schedule card actually plays in the persistent player, not a separate instance). Recommend a `LivePlayerContext` wrapping the whole app.
3. **Data fetching layer.** All the `src/lib/data.ts` mock arrays (`schedule`, `genres`, `musicItems`, `videos`, `languages`, `events`, `presenters`, `careers`) should be replaced by fetch calls (e.g. Next.js server components fetching directly, or a small `src/lib/api.ts` client wrapping `fetch()` against the endpoints above). Types in `data.ts` are already close to what's needed — reuse/extend them for API response typing rather than redefining.
4. **Real-time data.** Listener counts (2.4, 3.4) and notifications (1.2) are called out in the TRD as needing to feel "live" — worth confirming with backend whether these are polled REST endpoints or a WebSocket/SSE channel per TRD §11 (Redis for hot data, horizontal scaling for AI services).
5. **Image placeholders.** Every card (music, video, events, presenters, schedule) currently uses a CSS gradient (`style={{ background: linear-gradient(...) }}`) instead of a real image, specifically so no placeholder/stock photography needed swapping later. Once real `imageUrl`/`coverUrl`/`thumbnailUrl`/`avatarUrl` fields exist, swap the gradient `div` for an `<img>` (or Next's `<Image>`) in each component.
