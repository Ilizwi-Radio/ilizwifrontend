# iLIZWI Radio

iLIZWI Radio is a Next.js website and Express API for an online radio station. The site includes public radio and culture pages, listener accounts, presenter and admin dashboards, and a live broadcast studio.

## Features

- Public radio player connected to the station's Zeno stream, with current song metadata and active show details when available.
- Single sign-in flow that routes admins and presenters to their dashboards; listener and registered-user accounts remain on the public site.
- Admin tools for managing station content and presenters.
- YouTube-hosted Video Hub: content managers add YouTube links and metadata; visitors search and filter the catalog, then watch videos embedded from YouTube. Video files are not uploaded to the iLIZWI VPS.
- Presenter tools for profiles, shows, music, live broadcasting, and recording audio locally in the browser for download.
- PostgreSQL song metadata with audio files stored in private Cloudflare R2 storage; presenters can search and queue songs, jingles, and adverts for a show.
- Live presenter audio is sent to the relay in 100 ms MediaRecorder chunks; the public player checks for live-source changes every 2 seconds while playing.
- If a presenter unexpectedly disconnects, the backend can continue the active broadcast queue through FFmpeg and Icecast. This is queue failover, not yet a full 24/7 Auto-DJ.
- Remote co-hosting lets one assigned co-host join a show's live audio from another location; the primary presenter remains the only station-stream host.
- Express API backed by PostgreSQL when configured.

## Requirements

- Node.js 20.9 or newer.
- npm.
- PostgreSQL for persistent application data.
- FFmpeg on the backend host for live presenter streaming.

## Run locally

The frontend and backend run separately. Choose an unused port for the API; these instructions use `5001` so it does not conflict with Next.js on `3000`.

### 1. Configure the backend

Create `Backend/.env` with the required values:

```dotenv
PORT=5001
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/ilizwi_radio
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:3000
```

The API is maintained in a [separate backend repository](https://github.com/MsiziKunene/ilizwi-backend); see its README for database, Icecast, relay, and Docker notes. Do not commit `.env` files or put real secrets in source control.

Install and start the backend:

```bash
cd Backend
npm install
npm run dev
```

The API health endpoint is `http://localhost:5001/api/health`.

### 2. Configure the frontend

Create `.env.local` in the repository root:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_STREAM_URL=http://localhost:8000
NEXT_PUBLIC_RELAY_URL=ws://localhost:5001/broadcast
```

The backend issues a short-lived relay token to signed-in presenters when they go live. Configure HTTPS/WSS URLs for a deployed site.

For production, deploy the frontend and backend together: the browser sends the essential session cookie to the API with credentialed requests, and the backend only accepts the configured `CORS_ORIGINS`.

Install and start the frontend from the repository root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL for the Express API, without a trailing `/api`. |
| `NEXT_PUBLIC_STREAM_URL` | Frontend | Icecast base URL used by presenter studio status/preview; the studio appends `/live`. |
| `NEXT_PUBLIC_RELAY_URL` | Frontend | WebSocket URL for the presenter audio relay, normally ending in `/broadcast`. |
| `PORT` | Backend | Express API port; defaults to `3000`. |
| `DATABASE_URL` | Backend | PostgreSQL connection string. |
| `JWT_SECRET` | Backend | Private secret used to sign login and short-lived relay tokens. Production requires at least 32 characters. |
| `CORS_ORIGINS` | Backend | Comma-separated exact site origins allowed to call the API. |
| `ICECAST_HOST`, `ICECAST_PORT`, `ICECAST_MOUNT`, `ICECAST_SOURCE_PASSWORD`, `ICECAST_BITRATE` | Backend | Icecast source connection used for presenter broadcasts. |
| `ICECAST_PUBLIC_URL` | Backend | Public Icecast server URL used by the status endpoint. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Backend | Private Cloudflare R2 S3-compatible access for station audio uploads and playback. Never expose R2 credentials to the frontend. |
| `TURN_URLS` | Backend, optional | TURN server URLs for remote co-host connections when direct peer connections are blocked. |
| `TURN_SHARED_SECRET` | Backend, optional | Private coturn REST secret used to issue temporary TURN credentials. |
| `GEMINI_API_KEY` | Backend | Optional key for AI presenter features. |

## Authentication and cookies

- Successful sign-in stores the seven-day JWT in an `HttpOnly`, `SameSite=Lax` cookie scoped to the API host and `/api` path. The cookie is `Secure` in production. Browser API requests use credentialed CORS from the exact origins in `CORS_ORIGINS`.
- Existing bearer-token sessions are exchanged for the cookie on the next session check, then the frontend removes the legacy token from localStorage.
- The site displays a notice for this essential sign-in cookie. It does not use advertising or analytics cookies; YouTube embeds may use YouTube's own technologies when played.
- Unsafe browser requests with an `Origin` header are restricted to the configured site origins.

## Video Hub

1. Upload and publish the video to the official iLIZWI Radio YouTube channel.
2. In the admin dashboard's Video Hub, add the YouTube link, title, description, category, language, and optional thumbnail/duration. Choose whether it is featured and visible.
3. Visitors can search and filter visible videos on the homepage. Playback opens an embedded player hosted by YouTube.

The API extracts and validates the YouTube video ID. Categories use the existing `video_categories` table; videos remain in the existing `videos` table. No YouTube API key or VPS video upload is required. Apply `Backend/migrations/005_youtube_hosted_videos.sql` to the existing PostgreSQL database before deploying the matching backend. Legacy non-YouTube video records remain manageable in the admin catalog but are not shown publicly until given a valid YouTube link.

## Music storage and broadcast queue

Song, artist, genre, language, and duration metadata remain in the existing PostgreSQL `songs` and `artists` tables. Audio bytes are uploaded directly to a private Cloudflare R2 bucket using short-lived signed URLs; the backend creates signed playback URLs and FFmpeg reads the same private objects during queue failover. Configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` in `Backend/.env`. R2 credentials are backend-only.

The presenter studio searches the catalog by title, artist, genre, or language and queues each selected item as a song, jingle, or advert. Apply `Backend/migrations/006_broadcast_music_queue.sql` after the existing station schema is provisioned. The queue is scoped to a show and persisted in PostgreSQL. If the presenter relay disconnects unexpectedly, the backend resumes the current item from its beginning and continues queued items on the Icecast mount. Reconnecting a presenter hands the mount back to the normal live relay. Explicitly stopping the broadcast or ending the queue stops fallback playback; an empty queue is not an always-on Auto-DJ.

The R2 bucket must remain private and allow browser CORS requests from the deployed site origins: `GET` and `PUT` methods with the `Content-Type` request header. The upload form accepts audio files up to 100 MB. Verify the migration, R2 credentials, and bucket CORS policy before enabling the presenter queue in production.

## Site icons and sharing

- Browser and PWA icons use `/favicon.ico`, `/icon.png`, and `/apple-touch-icon.png`; the manifest is `/site.webmanifest`.
- Social previews, including WhatsApp link previews, use `/og-image-v3.webp`. This sharing image is separate from the browser and device icons.

## Project layout

```text
src/       Next.js app, pages, components, client API, and audio engine
Backend/   Local checkout of the separate Express API repository (optional)
```

## Notes

- Without `DATABASE_URL`, the backend falls back to a small in-memory mock. It is for previews only; data is temporary and the mock does not implement the complete production schema.
- This project does not include a full database schema bootstrap. Use the PostgreSQL schema configured for your deployment before relying on persistent admin or presenter data.
- Apply `Backend/migrations/001_show_cohosts.sql` to the existing database before using co-host assignment. Configure a backend TURN service for presenter networks that cannot connect directly.
- The presenter relay requires FFmpeg and a reachable Icecast source endpoint. The default backend relay uses the native Icecast source connection.
- For lower Icecast listener startup buffering, configure the active global `<limits>` in `icecast.xml` with `<burst-on-connect>0</burst-on-connect>` and `<burst-size>8192</burst-size>`. Keep `<queue-size>` larger than the burst size. These settings reduce the initial burst; they do not by themselves establish or eliminate steady-state end-to-end latency. See the backend README for deployment steps.
- Admins can search and filter accounts, manage roles, reversibly deactivate accounts, or permanently delete accounts and associated records; moderators can manage station content without access to users or roles. Presenter portraits support either a photo URL or an image upload stored in PostgreSQL. Apply `Backend/migrations/002_user_management_and_presenter_photos.sql` before enabling these features.
- The public website player and current-song display use the station's Zeno stream and metadata feed. Zeno may not provide a title for every stream segment.
