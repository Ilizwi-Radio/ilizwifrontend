export interface Show {
  id: string;
  presenter_id: string;
  title: string;
  description?: string;

  show_type: string;
  language_code: string;

  scheduled_start: string;
  scheduled_end: string;

  status: string;

  stream_url?: string;
}


export interface Presenter {
  id: string;
  user_id: string;
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
