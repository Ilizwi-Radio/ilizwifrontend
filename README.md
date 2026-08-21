# iLizwi Radio — Frontend

A Next.js 14 / React / TypeScript / Tailwind CSS replica of the iLizwi Radio marketing site, built per the project's Technical Requirements Document (frontend stack: Next.js, React, TypeScript).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Structure

```
src/
  app/
    layout.tsx      root layout + metadata
    page.tsx         homepage, composes all sections
    globals.css      Tailwind + custom effects (triangle bg pattern, waveform animation, etc.)
  components/
    Navbar.tsx
    Hero.tsx              (live player card + animated waveform)
    LiveBroadcasts.tsx    (today's schedule grid)
    MusicLibrary.tsx      (genre filter is interactive/client-side)
    BadgePromo.tsx
    VideoHub.tsx
    LanguageHub.tsx        (language cards + pronunciation/lesson CTAs)
    Events.tsx
    Community.tsx         (presenter cards + stats)
    Careers.tsx
    Newsletter.tsx        (client-side form state)
    Footer.tsx
    Icon.tsx              shared SVG icon set
    FadeIn.tsx            scroll-reveal wrapper (IntersectionObserver)
  lib/
    data.ts          typed mock content for schedule, music, videos, events, presenters, careers
```

## Notes

- All imagery is CSS-gradient placeholders (no external/copyrighted photos) — swap in your own licensed assets in each component where you see the gradient `style={{ background: ... }}` blocks.
- Colors and the "kente stripe" / triangle background pattern are defined in `tailwind.config.ts` and `globals.css` to match the brand.
- Next step per the TRD: wire these components up to the real backend (Node/Express APIs) for live schedule, music catalog, events, etc., replacing `src/lib/data.ts` with API calls.
