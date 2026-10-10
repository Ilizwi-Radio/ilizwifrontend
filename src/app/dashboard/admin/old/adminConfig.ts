import { FieldConfig } from "@/components/AdminCollectionEditor";

export const TABS = [
  { key: "schedule", label: "Live Sessions" },
  { key: "languages", label: "Languages" },
  { key: "music", label: "Music" },
  { key: "videos", label: "Videos" },
  { key: "events", label: "Events" },
  { key: "careers", label: "Careers" },
  { key: "presenters", label: "Presenters" },
  { key: "genres", label: "Genres" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export const scheduleFields: FieldConfig[] = [
  { key: "title", label: "Show Title", placeholder: "Morning Heritage Show" },
  { key: "host", label: "Host Name", placeholder: "AI Presenter Nala" },
  { key: "type", label: "Host Type", type: "select", options: ["AI PRESENTER", "LIVE HOST", "VIDEO SHOW"] },
  { key: "icon", label: "Icon", type: "select", options: ["mic", "video", "briefcase"] },
  { key: "tag", label: "Time / Tag", placeholder: "e.g. 10:00 or LIVE" },
  { key: "tagColor", label: "Tag Color Class", placeholder: "bg-black/60 or bg-red-600" },
  { key: "lang", label: "Language", placeholder: "isiZulu" },
  { key: "listeners", label: "Listener Count (leave blank if not live)", placeholder: "12,847" },
  { key: "cta", label: "Button Label", type: "select", options: ["Join Live", "Set Reminder"] },
  { key: "imgFrom", label: "Gradient Start", type: "color", placeholder: "#ea6a10" },
  { key: "imgTo", label: "Gradient End", type: "color", placeholder: "#7a2e0f" },
  { key: "presenterId", label: "Presenter Account ID (optional)", placeholder: "presenter-sipho" },
];

export const languageFields: FieldConfig[] = [
  { key: "name", label: "Language Name", placeholder: "isiZulu" },
  { key: "code", label: "Country Code", placeholder: "ZA" },
  { key: "region", label: "Region", placeholder: "South Africa" },
  { key: "speakers", label: "Speaker Count", placeholder: "12M speakers" },
  { key: "phrase", label: "Sample Phrase", placeholder: "Sawubona" },
  { key: "translation", label: "Translation", placeholder: "Hello (I see you)" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#1c8a4e" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#0b3a20" },
];

export const musicFields: FieldConfig[] = [
  { key: "title", label: "Track Title", placeholder: "Soweto Sunrise" },
  { key: "artist", label: "Artist", placeholder: "Thandi Khumalo" },
  { key: "tag", label: "Genre", placeholder: "Amapiano" },
  { key: "plays", label: "Play Count", placeholder: "2.4M" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#8a6d1a" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#3a2c08" },
];

export const videoFields: FieldConfig[] = [
  { key: "title", label: "Video Title", placeholder: "Heritage Day Celebration 2025" },
  { key: "tag", label: "Category", placeholder: "CULTURAL" },
  { key: "views", label: "Views", placeholder: "142K views" },
  { key: "dur", label: "Duration", placeholder: "24:18" },
  { key: "big", label: "Feature as large card", type: "checkbox" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#c9762f" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#7a3a17" },
];

export const eventFields: FieldConfig[] = [
  { key: "title", label: "Event Title", placeholder: "AfroFest 2026" },
  { key: "date", label: "Day", placeholder: "12" },
  { key: "mon", label: "Month (3-letter)", placeholder: "JUN" },
  { key: "tag", label: "Category", placeholder: "FESTIVAL" },
  { key: "loc", label: "Location", placeholder: "Johannesburg, ZA" },
  { key: "from", label: "Gradient Start", type: "color", placeholder: "#c9762f" },
  { key: "to", label: "Gradient End", type: "color", placeholder: "#3a1508" },
];

export const presenterFields: FieldConfig[] = [
  { key: "display_name", label: "Display Name" },
  { key: "presenter_type", label: "Presenter Type" },
  { key: "bio", label: "Bio" },
  { key: "status", label: "Status" },
];

export const careerFields: FieldConfig[] = [
  { key: "title", label: "Role Title", placeholder: "Cultural Content Writer" },
  { key: "dept", label: "Department", placeholder: "Heritage Team" },
  { key: "tag", label: "Type", type: "select", options: ["INTERNSHIP", "FULL-TIME", "VOLUNTEER", "SCHOLARSHIP", "CONTRACT"] },
  { key: "deadline", label: "Deadline", placeholder: "20 Jun" },
  { key: "icon", label: "Icon", type: "select", options: ["mic", "briefcase", "heart", "cap"] },
  { key: "iconBg", label: "Icon Background Classes", placeholder: "bg-green-100 text-green-700" },
  { key: "tagStyle", label: "Tag Style Classes", placeholder: "bg-green-900 text-white" },
];
