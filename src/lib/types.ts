export interface Show {
  id: string;
  presenter_id: string;
  display_name?: string;
  cohost_presenter_id?: string | null;
  cohost_display_name?: string | null;
  title: string;
  description?: string;

  show_type: string;
  language_code: string;

  scheduled_start: string;
  scheduled_end: string;
  tag_label?: string | null;
  tag_color?: string | null;
  gradient_start?: string | null;
  gradient_end?: string | null;

  status: string;

  stream_url?: string;
}


export interface Presenter {
  id: string;
  user_id: string | null;
  display_name?: string;
  name: string;
  full_name?: string;
  role: string;
  presenter_type?: string;
  followers: string;
  bio?: string;
  from: string; // gradient start color
  to: string; // gradient end color
  avatar?: string;
  showsCount?: number;
  email?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    mixcloud?: string;
  };
  microphonePreference?: string;
  onAirStatus?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  bpm?: number;
  genre: string;
  coverGradient: string;
  audioUrl?: string;
  synthPreset?: 'lofi' | 'house' | 'ambient' | 'jazz' | 'synthwave' | 'news' | 'custom';
  fileData?: string; // base64 or object URL
  isPreset?: boolean;
  addedAt: string;
}

export interface StationSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  language_code: string;
  duration_seconds: number;
}

export interface SongArtist {
  id: string;
  name: string;
  country: string;
}

export type BroadcastQueueItemType = "song" | "jingle" | "advert";

export interface BroadcastQueueItem extends StationSong {
  queueItemId: string;
  showId: string;
  songId: string;
  itemType: BroadcastQueueItemType;
  status: "queued" | "playing";
  position: number;
}

export interface SoundEffect {
  id: string;
  name: string;
  iconName: string;
  type: 'applause' | 'airhorn' | 'chime' | 'drumroll' | 'scratch' | 'station_id' | 'laser' | 'censor';
  color: string;
  hotkey?: string;
}

export interface LiveMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSongRequest?: boolean;
  songTitle?: string;
}

export type ActiveTab = 'studio' | 'shows' | 'music' | 'profile' | 'analytics';
