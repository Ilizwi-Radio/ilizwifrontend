type IconName =
  | "search"
  | "bell"
  | "user"
  | "play"
  | "heart"
  | "mic"
  | "video"
  | "bookmark"
  | "download"
  | "calendar"
  | "ticket"
  | "briefcase"
  | "cap"
  | "gift"
  | "chat"
  | "award"
  | "star"
  | "send"
  | "pin"
  | "mail"
  | "globe"
  | "arrow"
  | "chevron"
  | "vol"
  | "radio"
  | "trend"
  | "people"
  | "book";

const paths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  bell: <><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M13.7 21a2 2 0 01-3.4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  user: <><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  play: <polygon points="6,4 20,12 6,20" fill="currentColor" />,
  heart: <path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.4 5 6 5c2.2 0 3.7 1.2 6 3.4C14.3 6.2 15.8 5 18 5c3.6 0 5.4 3.4 4 6.7C19.5 16.4 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" /><path d="M5 11a7 7 0 0014 0M12 18v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  video: <><rect x="2" y="6" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><polygon points="22,7 16,12 22,17" fill="currentColor" /></>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  download: <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  ticket: <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 000 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 000-4V9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  briefcase: <><rect x="2" y="7" width="20" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  cap: <><path d="M12 3l10 5-10 5L2 8l10-5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  gift: <path d="M20 12v9H4v-9M2 7h20v5H2zM12 7v14M12 7c-1.5-4-6-4-6 0M12 7c1.5-4 6-4 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  chat: <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  award: <><circle cx="12" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 13l-2 8 6-3 6 3-2-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></>,
  star: <polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,17 5.5,21 7.5,13.5 2,9 9,9" fill="currentColor" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  pin: <><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M2 6l10 7 10-7" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  globe: <><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  chevron: <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  vol: <><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M17 8a5 5 0 010 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  radio: <><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M8 12a4 4 0 018 0M5 12a7 7 0 0114 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  people: <><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6M14 14.5c2.8.4 5 2.4 5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  book: <><path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 16.5v-12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M4 16.5A2.5 2.5 0 006.5 19H20v3H6.5A2.5 2.5 0 014 19.5v-3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></>,
};

export default function Icon({ name, className = "w-4 h-4" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {paths[name]}
    </svg>
  );
}
