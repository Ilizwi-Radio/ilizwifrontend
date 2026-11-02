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
  { key: "sections", label: "Homepage Sections" },
  { key: "users", label: "Users" },
] as const;

// Sections the admin can switch on/off on the public homepage.
// Keys are stored in site settings; a missing key means visible.
export const HOMEPAGE_SECTIONS = [
  { key: "schedule", label: "Live Broadcasts", description: "Homepage show schedule" },
  { key: "communityStats", label: "Community stats", description: "Daily conversations, badges earned, and community rating" },
  { key: "badgePromo", label: "Cultural badges banner", description: "Earn Cultural Badges sign-up banner" },
  { key: "languages", label: "Language Hub", description: "Learn African Languages section" },
  { key: "music", label: "Music Library", description: "Tracks and genre filter pills" },
  { key: "videos", label: "Video Hub", description: "Featured and recent videos" },
  { key: "events", label: "Events & Festivals", description: "Upcoming events cards" },
  { key: "careers", label: "Careers & Empowerment", description: "Opportunities listing" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export const scheduleFields: FieldConfig[] = [
  { key: "title", label: "Show title", placeholder: "Morning Heritage Show", required: true },
  { key: "description", label: "Description", type: "textarea", placeholder: "What listeners can expect from this show" },
  { key: "presenter_id", label: "Primary presenter", type: "select", required: true },
  {
    key: "show_type",
    label: "Show format",
    type: "select",
    options: [
      { label: "Audio", value: "audio" },
      { label: "Video", value: "video" },
    ],
    required: true,
    defaultValue: "audio",
  },
  {
    key: "language_code",
    label: "Broadcast language",
    type: "select",
    options: [
      { label: "English", value: "en" },
      { label: "isiZulu", value: "zu" },
      { label: "isiXhosa", value: "xh" },
      { label: "Sesotho", value: "st" },
      { label: "Setswana", value: "tn" },
      { label: "itsonga", value: "ts" },
      { label: "Tshivenda", value: "ve" },
      { label: "isiNdebele", value: "nr" },
    ],
    required: true,
    defaultValue: "en",
  },
  { key: "scheduled_start", label: "Start date and time (local)", type: "datetime-local", required: true },
  { key: "scheduled_end", label: "End date and time (local)", type: "datetime-local" },
  { key: "tag_label", label: "Schedule badge (optional)", placeholder: "e.g. Special episode; blank shows the start time" },
  { key: "tag_color", label: "Schedule badge color", type: "color", defaultValue: "#000000" },
  { key: "gradient_start", label: "Card gradient - start", type: "color", defaultValue: "#ea6a10" },
  { key: "gradient_end", label: "Card gradient - end", type: "color", defaultValue: "#7a2e0f" },
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
  { key: "title", label: "Video Title", placeholder: "Heritage Day Celebration 2025", required: true },
  { key: "video_file_url", label: "YouTube video link", placeholder: "https://youtu.be/...", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "category_name", label: "Category", placeholder: "Cultural" },
  { key: "thumbnail_url", label: "Thumbnail URL (optional)", placeholder: "Uses the YouTube thumbnail by default" },
  { key: "duration_seconds", label: "Duration in seconds", placeholder: "1458" },
  { key: "language_code", label: "Language code", placeholder: "en", defaultValue: "en" },
  { key: "is_featured", label: "Feature on the Video Hub", type: "checkbox" },
  { key: "is_visible", label: "Visible to visitors", type: "checkbox", defaultValue: true },
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
