# iLIZWI Radio

iLIZWI Radio is a Next.js website and Express API for an online radio station. The site includes public radio and culture pages, listener accounts, presenter and admin dashboards, and a live broadcast studio.

## Features

- Public radio player connected to the station's Zeno stream, with current song metadata and active show details when available.
- Single sign-in flow that routes admins and presenters to their dashboards; listener and registered-user accounts remain on the public site.
- Admin tools for managing station content and presenters.
- Presenter tools for profiles, shows, music, live broadcasting, and recording audio locally in the browser for download.
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
| `TURN_URLS` | Backend, optional | TURN server URLs for remote co-host connections when direct peer connections are blocked. |
| `TURN_SHARED_SECRET` | Backend, optional | Private coturn REST secret used to issue temporary TURN credentials. |
| `GEMINI_API_KEY` | Backend | Optional key for AI presenter features. |

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
- The public website player and current-song display use the station's Zeno stream and metadata feed. Zeno may not provide a title for every stream segment.
