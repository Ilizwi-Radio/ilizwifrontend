export type ScheduleItem = {
  tag: string;
  tagColor: string;
  icon: string;
  imgFrom: string;
  imgTo: string;
  type: string;
  title: string;
  host: string;
  lang: string;
  listeners: string | null;
  cta: string;
};

export const schedule: ScheduleItem[] = [
  { tag: "LIVE", tagColor: "bg-red-600", icon: "briefcase", imgFrom: "#ea6a10", imgTo: "#7a2e0f", type: "AI PRESENTER", title: "Morning Heritage Show", host: "AI Presenter Nala", lang: "isiZulu", listeners: "12,847", cta: "Join Live" },
  { tag: "10:00", tagColor: "bg-black/60", icon: "mic", imgFrom: "#a3268c", imgTo: "#5c1350", type: "LIVE HOST", title: "Amapiano Vibes", host: "DJ Sipho Mbeki", lang: "English", listeners: null, cta: "Set Reminder" },
  { tag: "12:00", tagColor: "bg-black/60", icon: "mic", imgFrom: "#1c8a4e", imgTo: "#0b3a20", type: "LIVE HOST", title: "Cultural Stories Hour", host: "Mama Ayanda", lang: "isiXhosa", listeners: null, cta: "Set Reminder" },
  { tag: "14:00", tagColor: "bg-black/60", icon: "briefcase", imgFrom: "#1c6ea3", imgTo: "#0b2e4a", type: "AI PRESENTER", title: "Learn Swahili Live", host: "AI Presenter Zuri", lang: "Swahili", listeners: null, cta: "Set Reminder" },
  { tag: "16:00", tagColor: "bg-black/60", icon: "video", imgFrom: "#c98a12", imgTo: "#6b4308", type: "VIDEO SHOW", title: "Diaspora Diaries", host: "Guest Panel", lang: "English", listeners: null, cta: "Set Reminder" },
  { tag: "18:00", tagColor: "bg-black/60", icon: "mic", imgFrom: "#c23a1f", imgTo: "#5c150a", type: "LIVE HOST", title: "Naija Beats Drive", host: "DJ Ade", lang: "English", listeners: null, cta: "Set Reminder" },
  { tag: "20:00", tagColor: "bg-black/60", icon: "mic", imgFrom: "#6a2fa3", imgTo: "#2f1350", type: "LIVE HOST", title: "Late Night Jazz Lounge", host: "Kofi Mensah", lang: "English", listeners: null, cta: "Set Reminder" },
  { tag: "22:00", tagColor: "bg-black/60", icon: "briefcase", imgFrom: "#12463a", imgTo: "#08211b", type: "AI PRESENTER", title: "Night Owl Stories", host: "AI Presenter Themba", lang: "Shona", listeners: null, cta: "Set Reminder" },
];

export const genres = ["All", "Afrobeat", "Amapiano", "Gospel", "Traditional", "Hip-Hop", "Jazz"];

export type MusicItem = { tag: string; from: string; to: string; title: string; artist: string; plays: string };

export const musicItems: MusicItem[] = [
  { tag: "Amapiano", from: "#8a6d1a", to: "#3a2c08", title: "Soweto Sunrise", artist: "Thandi Khumalo", plays: "2.4M" },
  { tag: "Afrobeat", from: "#7a2e0f", to: "#2e1006", title: "Calabash Rhythm", artist: "Kwame Asante", plays: "1.8M" },
  { tag: "Gospel", from: "#5c1a24", to: "#22090d", title: "Sacred Voices", artist: "Joy Chorale", plays: "950K" },
  { tag: "Traditional", from: "#12463a", to: "#08211b", title: "Mbira Dreams", artist: "Chiedza Moyo", plays: "720K" },
  { tag: "Afrobeat", from: "#3a1c4d", to: "#160a1f", title: "Lagos Nights", artist: "Femi Okonkwo", plays: "3.1M" },
  { tag: "Amapiano", from: "#124d6e", to: "#082133", title: "Jozi Groove", artist: "DJ Mandla", plays: "4.2M" },
  { tag: "Traditional", from: "#154d2e", to: "#082114", title: "Kente Beats", artist: "Akosua Mensah", plays: "610K" },
  { tag: "Jazz", from: "#4d1a5c", to: "#210925", title: "Savanna Soul", artist: "Naledi Band", plays: "480K" },
];

export type VideoItem = { tag: string; from: string; to: string; title: string; views: string; dur: string; big?: boolean };

export const videos: VideoItem[] = [
  { tag: "CULTURAL", from: "#c9762f", to: "#7a3a17", title: "Heritage Day Celebration 2025", views: "142K views", dur: "24:18", big: true },
  { tag: "HISTORY", from: "#154d2e", to: "#08211b", title: "The Story of Mansa Musa", views: "89K views", dur: "18:42" },
  { tag: "EDUCATION", from: "#4d3a12", to: "#211908", title: "Traditional Drum Workshop", views: "67K views", dur: "32:05" },
  { tag: "INTERVIEW", from: "#124d3a", to: "#082117", title: "Youth Voices: Future of Africa", views: "203K views", dur: "45:11" },
  { tag: "CULTURAL", from: "#7a4d17", to: "#3a2308", title: "Sangoma Healing Traditions", views: "54K views", dur: "21:33" },
  { tag: "LIFESTYLE", from: "#3a1c4d", to: "#160a1f", title: "Lagos Fashion Week Highlights", views: "178K views", dur: "12:20" },
];

export type EventItem = { date: string; mon: string; tag: string; from: string; to: string; title: string; loc: string };

export const events: EventItem[] = [
  { date: "12", mon: "JUN", tag: "FESTIVAL", from: "#c9762f", to: "#3a1508", title: "AfroFest 2026 — Music & Culture", loc: "Johannesburg, ZA" },
  { date: "24", mon: "JUN", tag: "WORKSHOP", from: "#5c4a2e", to: "#211908", title: "Swahili Language Workshop", loc: "Online + Nairobi" },
  { date: "03", mon: "JUL", tag: "SUMMIT", from: "#3a3a3a", to: "#141414", title: "Youth Empowerment Summit", loc: "Lagos, Nigeria" },
  { date: "18", mon: "JUL", tag: "CULTURAL", from: "#12463a", to: "#08211b", title: "Women in Media Roundtable", loc: "Cape Town, ZA" },
  { date: "02", mon: "AUG", tag: "CONCERT", from: "#7a2e0f", to: "#2e1006", title: "Sunset Concert Series", loc: "Accra, Ghana" },
  { date: "15", mon: "AUG", tag: "SCREENING", from: "#154d5c", to: "#082126", title: "African Film Screening Night", loc: "Nairobi, Kenya" },
];

export type Presenter = { ai: boolean; from: string; to: string; name: string; role: string; followers: string };

export const presenters: Presenter[] = [
  { ai: true, from: "#5c1a3a", to: "#22091a", name: "Nala (AI)", role: "Heritage Show Host", followers: "24.5K" },
  { ai: false, from: "#7a5a2e", to: "#3a2b13", name: "Sipho Mbeki", role: "Amapiano Vibes DJ", followers: "18.2K" },
  { ai: false, from: "#4d4d4d", to: "#1c1c1c", name: "Mama Ayanda", role: "Cultural Storyteller", followers: "32.1K" },
  { ai: true, from: "#7a1a2e", to: "#2e0912", name: "Zuri (AI)", role: "Swahili Language Coach", followers: "15.8K" },
];

export type LanguageItem = {
  code: string;
  from: string;
  to: string;
  name: string;
  region: string;
  speakers: string;
  phrase: string;
  translation: string;
};

export const languages: LanguageItem[] = [
  { code: "ZA", from: "#1c8a4e", to: "#0b3a20", name: "isiZulu", region: "South Africa", speakers: "12M speakers", phrase: "Sawubona", translation: "Hello (I see you)" },
  { code: "ZA", from: "#ea6a10", to: "#7a2e0f", name: "isiXhosa", region: "South Africa", speakers: "8M speakers", phrase: "Molo", translation: "Hello" },
  { code: "KE", from: "#c9223a", to: "#5c0f1a", name: "Swahili", region: "East Africa", speakers: "200M speakers", phrase: "Jambo", translation: "Hello" },
  { code: "NG", from: "#c9820f", to: "#5c3a08", name: "Yoruba", region: "Nigeria", speakers: "45M speakers", phrase: "Bawo ni", translation: "How are you?" },
  { code: "LS", from: "#1c4da3", to: "#0b2050", name: "Sesotho", region: "Lesotho", speakers: "7M speakers", phrase: "Lumela", translation: "Hello" },
  { code: "ZW", from: "#7a1ea3", to: "#3a0e50", name: "Shona", region: "Zimbabwe", speakers: "14M speakers", phrase: "Mhoro", translation: "Hello" },
  { code: "BW", from: "#12868a", to: "#083c3e", name: "Tswana", region: "Botswana", speakers: "8M speakers", phrase: "Dumela", translation: "Hello" },
  { code: "ET", from: "#0f6b3a", to: "#082e1a", name: "Amharic", region: "Ethiopia", speakers: "32M speakers", phrase: "Selam", translation: "Hello" },
];

export type CareerItem = { icon: string; iconBg: string; tag: string; tagStyle: string; deadline: string; title: string; dept: string };

export const careers: CareerItem[] = [
  { icon: "mic", iconBg: "bg-orange-100 text-orange-600", tag: "INTERNSHIP", tagStyle: "bg-green-900 text-white", deadline: "15 Jun", title: "AI Voice Presenter Training", dept: "iLizwi Radio" },
  { icon: "briefcase", iconBg: "bg-green-100 text-green-700", tag: "FULL-TIME", tagStyle: "bg-green-900 text-white", deadline: "20 Jun", title: "Cultural Content Writer", dept: "Heritage Team" },
  { icon: "heart", iconBg: "bg-pink-100 text-pink-600", tag: "VOLUNTEER", tagStyle: "bg-stone-700 text-white", deadline: "01 Jul", title: "Youth Ambassador Program", dept: "Pan-African" },
  { icon: "cap", iconBg: "bg-yellow-100 text-yellow-700", tag: "SCHOLARSHIP", tagStyle: "bg-green-900 text-white", deadline: "10 Jul", title: "Mandela Rhodes Scholarship", dept: "Partner Org" },
  { icon: "briefcase", iconBg: "bg-blue-100 text-blue-700", tag: "FULL-TIME", tagStyle: "bg-green-900 text-white", deadline: "12 Jul", title: "Live Radio Producer", dept: "iLizwi Radio" },
  { icon: "mic", iconBg: "bg-purple-100 text-purple-700", tag: "CONTRACT", tagStyle: "bg-stone-700 text-white", deadline: "25 Jul", title: "Artist Collaboration Lead", dept: "Music Dept" },
];
