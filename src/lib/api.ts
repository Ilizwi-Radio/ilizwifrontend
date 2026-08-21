import { Show, Presenter, MusicTrack, SoundEffect } from './types';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

console.log("API_URL =", API_URL);
//=== Videos===//
export async function createVideo(
  video: any
) {
  const response = await fetch(
    `${API_URL}/api/videos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(video)
    }
  );

  return response.json();
}

export async function updateVideo(
  id: string,
  video: any
) {
  const response = await fetch(
    `${API_URL}/api/videos/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(video)
    }
  );

  return response.json();
}
export async function deleteVideo(
  id: string
) {
  const response = await fetch(
    `${API_URL}/api/videos/${id}`,
    {
      method: "DELETE"
    }
  );

  return response.json();
}

export async function getVideos() {
  const url = `${API_URL}/api/videos`;
  const response = await fetch(url);
  

  return response.json();
}
//=== Songs ===//
export async function createSong(
  song: any
) {
  const response = await fetch(
    `${API_URL}/api/songs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(song)
    }
  );

  return response.json();
}

export async function updateSong(
  id: string,
  song: any
) {
  const response = await fetch(
    `${API_URL}/api/songs/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(song)
    }
  );

  return response.json();
}

export async function deleteSong(
  id: string
) {
  const response = await fetch(
    `${API_URL}/api/songs/${id}`,
    {
      method: "DELETE"
    }
  );

  return response.json();
}

export async function getSongs() {
  const response = await fetch(
    `${API_URL}/api/songs`
  );

  return response.json();
}
// === Events ===//
export async function createEvent(
  event: any
) {
  const response = await fetch(
    `${API_URL}/api/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    }
  );

  return response.json();
}
export async function updateEvent(
  id: string,
  event: any
) {
  const response = await fetch(
    `${API_URL}/api/events/${id}`,
    {
      method: "UPDATE"}
    );
      return response.json()
    }
export async function deleteEvent(
  id: string
) {
  const response = await fetch(
    `${API_URL}/api/events/${id}`,
    {
      method: "DELETE"
    }
  );

  return response.json();
}

export async function getEvents() {
  const response = await fetch(
    `${API_URL}/api/events`
  );

  return response.json();
}

export async function getCareers() {
  const response = await fetch(
    `${API_URL}/api/careers`
  );

  return response.json();
}

export async function getPresenters() {
  const response = await fetch(
    `${API_URL}/api/presenters`
  );

  return response.json();
}
//=== COurses ===//
export async function createCourse(
  course: any
) {
  const response = await fetch(
    `${API_URL}/api/language/courses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(course)
    }
  );

  return response.json();
}

export async function updateCourse(
  id: string,
  course: any
) {
  const response = await fetch(
    `${API_URL}/api/language/courses/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(course)
    }
  );

  return response.json();
}
export async function deleteCourse(
  id: string
) {
  const response = await fetch(
    `${API_URL}/api/language/courses/${id}`,
    {
      method: "DELETE"
    }
  );

  return response.json();
}
export async function getCourses() {
  const response = await fetch(
    `${API_URL}/api/language/courses`
  );

  return response.json();
}

//=== Shows ===//
export async function createShow(
  show: any
) {
  const response = await fetch(
    `${API_URL}/api/shows`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(show)
    }
  );

  return response.json();
}

export async function updateShow(
  id: string,
  show: any
) {
  const response = await fetch(
    `${API_URL}/api/shows/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(show)
    }
  );

  return response.json();
}

export async function deleteShow(
  id: string
) {
  const response = await fetch(
    `${API_URL}/api/shows/${id}`,
    {
      method: "DELETE"
    }
  );

  return response.json();
}

export async function getShows() {
  const response = await fetch(
    `${API_URL}/api/shows`
  );

  return response.json();
}

export async function login(
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      "Login failed"
    );
  }

  return data;
}
export async function register(
  userData: any
) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  const data =
    await response.json();

  console.log(
    "REGISTER RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Registration failed"
    );
  }

  return data;
}

export async function likeSong(
  songId: string,
  unlike = false
) {

  const token =
    localStorage.getItem(
      "token"
    );

  const response =
    await fetch(
      `${API_URL}/api/songs/${songId}/like`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          unlike,
        }),
      }
    );

  return response.json();

}
export async function registerForEvent(
  eventId: string,
  ticketId?: string
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/events/${eventId}/register`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        ticketId,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      "Registration failed"
    );
  }

  return data;
}

export async function followPresenter(
  presenterId: string
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/presenters/${presenterId}/follow`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}
export async function unfollowPresenter(
  presenterId: string
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/presenters/${presenterId}/follow`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}
//=== Opportunities ===//
export async function createOpportunity(
  opportunity: any
) {
  const response = await fetch(
    `${API_URL}/api/opportunities`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(opportunity)
    }
  );

  return response.json();
}

export async function updateOpportunity(
  id: string,
  opportunity: any
) {
  const response = await fetch(
    `${API_URL}/api/opportunities/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(opportunity)
    }
  );

  return response.json();
}

export async function deleteOpportunity(
  id: string
) {
  const response = await fetch(
    `${API_URL}/api/opportunities/${id}`,
    {
      method: "DELETE"
    }
  );

  return response.json();
}
export async function getOpportunities() {
  const response = await fetch(
    `${API_URL}/api/opportunities`
  );

  return response.json();
}

//=== Applications ===//
export async function getApplications() {
  const response = await fetch(
    `${API_URL}/api/applications`
  );

  return response.json();
}

export async function getNotifications() {

  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/notifications`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  return response.json();

}

export async function getPlaylists() {

  const response = await fetch(
    `${API_URL}/api/playlists`
  );

  return response.json();

}

export async function getAIPresenters() {

  const response = await fetch(
    `${API_URL}/api/ai-presenters`
  );

  return response.json();

}

export async function createPresenter(
  presenter: any
) {
  const response =
    await fetch(
      `${API_URL}/api/presenters`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify(
            presenter
          ),
      }
    );

  return response.json();
}

export async function updatePresenter(
  id: string,
  presenter: any
) {

  const response =
    await fetch(
      `${API_URL}/api/presenters/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json"
        },
        body:
          JSON.stringify(
            presenter
          )
      }
    );

  return response.json();
}

export async function deletePresenter(
  id: string
) {

  const response =
    await fetch(
      `${API_URL}/api/presenters/${id}`,
      {
        method: "DELETE"
      }
    );

  return response.json();
}



// === LIVE BROADCASTING ====//

export async function startBroadcast(
  showId: string,
  streamUrl: string 
) {
  const response = await fetch(
    `${API_URL}/api/broadcast/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        showId,
        streamUrl,
      }),
    }
  );

  return response.json();
}

export async function stopBroadcast(
  broadcastId: string
) {
  const response = await fetch(
    `${API_URL}/api/broadcast/${broadcastId}/stop`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.json();
}


export async function getBroadcastStatus() {
  const response = await fetch(
    `${API_URL}/api/broadcast/status`
  );

  const text = await response.text();

  console.log("Broadcast Status Response:", text);

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

export async function updateListenerCount(
  broadcastId: string,
  listenerCount: number
) {
  const response = await fetch(
    `${API_URL}/api/broadcast/${broadcastId}/listeners`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        listenerCount,
      }),
    }
  );

  return response.json}

export async function playBroadcastContent(
  broadcastId: string,
  contentId: string
) {
  const response = await fetch(
    `${API_URL}/api/broadcast/${broadcastId}/content`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        contentId,
      }),
    }
  );

  return response.json();
}

export async function clearBroadcastContent(
  broadcastId: string
) {
  const response = await fetch(
    `${API_URL}/api/broadcast/${broadcastId}/content`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        contentId: null,
      }),
    }
  );

  return response.json();
}

export const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'sfx-1', name: 'Airhorn Stinger', iconName: 'Megaphone', type: 'airhorn', color: 'bg-red-500 hover:bg-red-600', hotkey: '1' },
  { id: 'sfx-2', name: 'Live Crowd Cheers', iconName: 'Users', type: 'applause', color: 'bg-emerald-500 hover:bg-emerald-600', hotkey: '2' },
  { id: 'sfx-3', name: 'Station Jingle Chime', iconName: 'Bell', type: 'chime', color: 'bg-amber-500 hover:bg-amber-600', hotkey: '3' },
  { id: 'sfx-4', name: 'Suspense Drum Roll', iconName: 'Drum', type: 'drumroll', color: 'bg-purple-500 hover:bg-purple-600', hotkey: '4' },
  { id: 'sfx-5', name: 'DJ Vinyl Scratch', iconName: 'Disc', type: 'scratch', color: 'bg-cyan-500 hover:bg-cyan-600', hotkey: '5' },
  { id: 'sfx-6', name: 'Radio Laser Zap', iconName: 'Zap', type: 'laser', color: 'bg-pink-500 hover:bg-pink-600', hotkey: '6' },
  { id: 'sfx-7', name: 'Broadcast Bleep', iconName: 'VolumeX', type: 'censor', color: 'bg-stone-700 hover:bg-stone-800', hotkey: '7' },
  { id: 'sfx-8', name: 'Station Audio ID', iconName: 'Radio', type: 'station_id', color: 'bg-green-700 hover:bg-green-800', hotkey: '8' },
];

function getStored<T>(key: string, fallback: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}


/// ==== MusicTrack Getting From Database ====== ////

export async function getMusicTracks(): Promise<MusicTrack[]> {
  const response = await fetch(
    `${API_URL}/api/music-tracks`
  );
   if (!response.ok) {
    throw new Error("Failed to fetch music tracks");
  }
  const data = await response.json();
  return data.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        duration: track.duration,
        bpm: track.bpm,
        coverGradient: track.cover_gradient,
        synthPreset: track.synth_preset,
        fileData: track.file_url,
        audioUrl: track.file_url,
        isPreset: track.is_preset,
        addedAt: track.created_at,
      }));
}

export async function addMusicTrack(
  trackData: any
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/music-tracks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(trackData),
    }
  );

  return response.json();
}

export async function deleteMusicTrack(id: string) {
  const response = await fetch(
    `${API_URL}/api/music-tracks/${id}`,
    {
      method: "DELETE",
    }
  );

  return response.ok;
}