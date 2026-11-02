import {
  Show,
  Presenter,
  MusicTrack,
  SoundEffect,
  BroadcastQueueItem,
  BroadcastQueueItemType,
  SongArtist,
  StationSong,
} from './types';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  // Keep legacy localStorage bearer tokens out of normal API requests.
  headers.delete("Authorization");
  const request = globalThis.fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
  return request.then((response) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (
      response.status === 401 &&
      !url.includes("/api/auth/login") &&
      !url.includes("/api/auth/register")
    ) {
      clearExpiredSession();
    }
    return response;
  });
}

function clearExpiredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("storage"));
}

async function parseShowResponse(response: Response, fallbackMessage: string) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) clearExpiredSession();
    throw new Error(data?.error || fallbackMessage);
  }
  return data;
}

// console.log("API_URL =", API_URL);
//=== Videos===//
export async function createVideo(
  video: any
) {
  const response = await apiFetch(
    `${API_URL}/api/videos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
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
  const response = await apiFetch(
    `${API_URL}/api/videos/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(video)
    }
  );

  return response.json();
}
export async function deleteVideo(
  id: string
) {
  const response = await apiFetch(
    `${API_URL}/api/videos/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return response.json();
}

export async function getVideos(
  includeHidden = false
) {
  const response = await apiFetch(
    `${API_URL}/api/videos${includeHidden ? "/admin" : ""}`,
    includeHidden
      ? { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      : undefined
  );

  return response.json();
}
//=== Songs ===//
export async function createSong(
  song: any
) {
  const response = await apiFetch(
    `${API_URL}/api/songs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
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
  const response = await apiFetch(
    `${API_URL}/api/songs/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(song)
    }
  );

  return response.json();
}

export async function deleteSong(
  id: string
) {
  const response = await apiFetch(
    `${API_URL}/api/songs/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return response.json();
}

export async function getSongs(
  includeHidden = false
) {
  const response = await apiFetch(
    `${API_URL}/api/songs${includeHidden ? "?includeHidden=true" : ""}`,
    includeHidden
      ? { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      : undefined
  );

  return response.json();
}

export async function searchStationSongs(search: string): Promise<StationSong[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  params.set("hasAudio", "true");
  const response = await apiFetch(`${API_URL}/api/songs?${params.toString()}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Failed to search the station library.");
  return data;
}

export async function getSongArtists(): Promise<SongArtist[]> {
  const response = await apiFetch(`${API_URL}/api/songs/artists`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Failed to load artists.");
  return data;
}

export async function createSongArtist(input: {
  name: string;
  country: string;
}): Promise<SongArtist> {
  const response = await apiFetch(`${API_URL}/api/songs/artists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not create this artist.");
  return data;
}

export async function createSongAudioUploadUrl(file: File): Promise<{
  objectKey: string;
  uploadUrl: string;
  contentType: string;
  expiresIn: number;
}> {
  const response = await apiFetch(`${API_URL}/api/songs/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, fileSize: file.size }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not prepare the audio upload.");

  const uploadResponse = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": data.contentType },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Cloud audio upload failed (HTTP ${uploadResponse.status}). Check the R2 bucket CORS settings.`);
  }
  return data;
}

export async function createStationSong(song: Record<string, unknown>): Promise<void> {
  const response = await apiFetch(`${API_URL}/api/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(song),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not save song metadata.");
}

export async function getSongAudioUrl(songId: string): Promise<string> {
  const response = await apiFetch(`${API_URL}/api/songs/${songId}/audio-url`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not load song audio.");
  return data.audioUrl;
}

function mapBroadcastQueueItem(item: any): BroadcastQueueItem {
  return {
    queueItemId: item.id,
    showId: item.show_id,
    songId: item.song_id,
    itemType: item.item_type,
    status: item.status,
    position: Number(item.position),
    id: item.song_id,
    title: item.title,
    artist: item.artist,
    genre: item.genre,
    language_code: item.language_code,
    duration_seconds: Number(item.duration_seconds),
  };
}

export async function getBroadcastQueue(showId: string): Promise<BroadcastQueueItem[]> {
  const response = await apiFetch(`${API_URL}/api/broadcast/queue/${showId}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not load the broadcast queue.");
  return data.map(mapBroadcastQueueItem);
}

export async function addBroadcastQueueItem(
  showId: string,
  songId: string,
  itemType: BroadcastQueueItemType
): Promise<void> {
  const response = await apiFetch(`${API_URL}/api/broadcast/queue/${showId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId, itemType }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not add this song to the queue.");
}

export async function removeBroadcastQueueItem(showId: string, queueItemId: string): Promise<void> {
  const response = await apiFetch(
    `${API_URL}/api/broadcast/queue/${showId}/items/${queueItemId}`,
    { method: "DELETE" }
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not remove this queue item.");
}

export async function playNextBroadcastQueueItem(showId: string): Promise<{
  item: BroadcastQueueItem | null;
  audioUrl?: string;
}> {
  const response = await apiFetch(`${API_URL}/api/broadcast/queue/${showId}/next`, {
    method: "POST",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not start the next queue item.");
  return {
    item: data.item ? mapBroadcastQueueItem(data.item) : null,
    audioUrl: data.audioUrl,
  };
}

export async function playStationSongNow(
  showId: string,
  songId: string,
  itemType: BroadcastQueueItemType
): Promise<{ item: BroadcastQueueItem; audioUrl: string }> {
  const response = await apiFetch(`${API_URL}/api/broadcast/queue/${showId}/play-now`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId, itemType }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not play this song now.");
  if (!data?.item || typeof data.audioUrl !== "string") {
    throw new Error("The server returned an invalid response for this song.");
  }
  return {
    item: mapBroadcastQueueItem(data.item),
    audioUrl: data.audioUrl,
  };
}

export async function completeBroadcastQueueItem(showId: string, queueItemId: string): Promise<void> {
  const response = await apiFetch(
    `${API_URL}/api/broadcast/queue/${showId}/items/${queueItemId}/complete`,
    { method: "POST" }
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not complete the queue item.");
}

export async function failBroadcastQueueItem(showId: string, queueItemId: string): Promise<void> {
  const response = await apiFetch(
    `${API_URL}/api/broadcast/queue/${showId}/items/${queueItemId}/fail`,
    { method: "POST" }
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not update the failed queue item.");
}

// === Events ===//
export async function createEvent(
  event: any
) {
  const response = await apiFetch(
    `${API_URL}/api/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
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
  const response = await apiFetch(
    `${API_URL}/api/events/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(event)
    }
  );

  return response.json();
}
export async function deleteEvent(
  id: string
) {
  const response = await apiFetch(
    `${API_URL}/api/events/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return response.json();
}

export async function getEvents(
  includeHidden = false
) {
  const response = await apiFetch(
    `${API_URL}/api/events${includeHidden ? "?includeHidden=true" : ""}`,
    includeHidden
      ? { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      : undefined
  );

  return response.json();
}

export async function getCareers() {
  const response = await apiFetch(
    `${API_URL}/api/careers`
  );

  return response.json();
}

export async function getPresenters() {
  const response = await apiFetch(
    `${API_URL}/api/presenters`
  );

  return response.json();
}

export function getUploadedPresenterPhotoUrl(id: string) {
  return `${API_URL}/api/presenters/${encodeURIComponent(id)}/photo`;
}

export async function setPresenterPhotoUrl(id: string, photoUrl: string) {
  const response = await apiFetch(`${API_URL}/api/presenters/${encodeURIComponent(id)}/photo-url`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ photo_url: photoUrl }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to save presenter photo URL.");
  return data;
}

export async function uploadPresenterPhoto(id: string, file: File) {
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read the selected image."));
        return;
      }
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });

  const response = await apiFetch(`${API_URL}/api/presenters/${encodeURIComponent(id)}/photo`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ mime_type: file.type, data_base64: dataBase64 }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to upload presenter photo.");
  return data;
}

export async function assignPrimaryPresenterToShow(showId: string, presenterId: string) {
  const response = await apiFetch(`${API_URL}/api/admin/shows/${encodeURIComponent(showId)}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ presenterId }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Failed to assign the primary presenter.");
  return data?.show;
}

export async function getMyPresenterProfile() {
  const response = await apiFetch(`${API_URL}/api/presenters/me/profile`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await response.json();
  if (response.status === 401) {
    clearExpiredSession();
    throw new Error("Your session expired. Please sign in again.");
  }
  if (!response.ok) throw new Error(data.error || "Failed to load presenter profile.");
  return data;
}

export async function updateMyPresenterProfile(profile: { presenter_type: string; bio: string }) {
  const response = await apiFetch(`${API_URL}/api/presenters/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(profile),
  });
  const data = await response.json();
  if (response.status === 401) {
    clearExpiredSession();
    throw new Error("Your session expired. Please sign in again.");
  }
  if (!response.ok) throw new Error(data.error || "Failed to update presenter profile.");
  return data;
}
//=== COurses ===//
export async function createCourse(
  course: any
) {
  const response = await apiFetch(
    `${API_URL}/api/language/courses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
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
  const response = await apiFetch(
    `${API_URL}/api/language/courses/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(course)
    }
  );

  return response.json();
}
export async function deleteCourse(
  id: string
) {
  const response = await apiFetch(
    `${API_URL}/api/language/courses/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return response.json();
}
export async function getCourses(
  includeHidden = false
) {
  const response = await apiFetch(
    `${API_URL}/api/language/courses${includeHidden ? "?includeHidden=true" : ""}`,
    includeHidden
      ? { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      : undefined
  );

  return response.json();
}

//=== Shows ===//
export async function createShow(
  show: any
) {
  const response = await apiFetch(
    `${API_URL}/api/shows`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(show)
    }
  );

  return parseShowResponse(response, "Failed to create show.");
}

export async function updateShow(
  id: string,
  show: any
) {
  const response = await apiFetch(
    `${API_URL}/api/shows/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(show)
    }
  );

  return parseShowResponse(response, "Failed to update show.");
}

export async function setShowCohost(showId: string, presenterId: string | null) {
  const response = await apiFetch(`${API_URL}/api/shows/${showId}/cohost`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ presenterId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to update the co-host.");
  return data;
}

export async function getCohostConnectionToken(showId: string) {
  const response = await apiFetch(`${API_URL}/api/shows/${showId}/cohost-token`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
  const data = await response.json();
  if (!response.ok || typeof data.token !== "string") {
    throw new Error(data.error || "Could not authorize the co-host connection.");
  }
  return data as {
    token: string;
    participantRole: "host" | "cohost";
    expiresIn: number;
    iceServers: RTCIceServer[];
  };
}

export async function deleteShow(
  id: string
) {
  const response = await apiFetch(
    `${API_URL}/api/shows/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return parseShowResponse(response, "Failed to delete show.");
}

export async function updateShowVisibility(id: string, isVisible: boolean) {
  const response = await apiFetch(`${API_URL}/api/shows/${encodeURIComponent(id)}/visibility`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isVisible }),
  });
  return parseShowResponse(response, "Failed to update show visibility.");
}

export async function getShows(
  includeHidden = false
) {
  const response = await apiFetch(
    `${API_URL}/api/shows${includeHidden ? "?includeHidden=true" : ""}`,
    includeHidden
      ? { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      : undefined
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Failed to load shows.");
  }
  if (!Array.isArray(data)) {
    throw new Error("The shows service returned an invalid response.");
  }
  return data;
}

export async function login(
  email: string,
  password: string
) {
  const response = await apiFetch(
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

export async function getCurrentUser() {
  const legacyToken = localStorage.getItem("token");
  const response = await globalThis.fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
    headers: legacyToken ? { Authorization: `Bearer ${legacyToken}` } : undefined,
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const error = new Error(data?.error || "Authentication required.");
    error.name = "AuthenticationError";
    throw error;
  }
  if (!response.ok || !data?.user) {
    throw new Error(data?.error || "Could not verify the current session.");
  }
  localStorage.removeItem("token");
  return data.user;
}

export async function logoutSession() {
  const response = await apiFetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Could not end the session.");
  }
  return data;
}
export async function register(
  userData: any
) {
  const response = await apiFetch(
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
    await apiFetch(
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

  const response = await apiFetch(
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

  const response = await apiFetch(
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

  const response = await apiFetch(
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
  const response = await apiFetch(
    `${API_URL}/api/opportunities`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
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
  const response = await apiFetch(
    `${API_URL}/api/opportunities/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(opportunity)
    }
  );

  return response.json();
}

export async function deleteOpportunity(
  id: string
) {
  const response = await apiFetch(
    `${API_URL}/api/opportunities/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return response.json();
}
export async function getOpportunities(
  includeHidden = false
) {
  const response = await apiFetch(
    `${API_URL}/api/opportunities${includeHidden ? "?includeHidden=true" : ""}`,
    includeHidden
      ? { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      : undefined
  );

  return response.json();
}

//=== Site Settings ===//
export async function getSiteSettings() {
  const response = await apiFetch(
    `${API_URL}/api/site-settings`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to load homepage settings.");
  }

  return response.json();
}

export async function updateSiteSettings(
  settings: any
) {
  const response = await apiFetch(
    `${API_URL}/api/site-settings`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(settings),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save homepage settings.");
  }

  return response.json();
}

//=== Applications ===//
export async function getApplications() {
  const response = await apiFetch(
    `${API_URL}/api/applications`
  );

  return response.json();
}

export async function getNotifications() {

  const token =
    localStorage.getItem("token");

  const response = await apiFetch(
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

  const response = await apiFetch(
    `${API_URL}/api/playlists`
  );

  return response.json();

}

export async function getAIPresenters() {

  const response = await apiFetch(
    `${API_URL}/api/ai-presenters`
  );

  return response.json();

}

export async function createPresenter(
  presenter: any
) {
  const response =
    await apiFetch(
      `${API_URL}/api/presenters`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    await apiFetch(
      `${API_URL}/api/presenters/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
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
    await apiFetch(
      `${API_URL}/api/presenters/${id}`,
      {
        method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
      }
    );

  return response.json();
}

export async function resetPresenterPassword(
  id: string,
  newPassword: string | null
): Promise<{ temporaryPassword?: string }> {
  const response = await apiFetch(`${API_URL}/api/admin/presenters/${id}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(newPassword ? { newPassword } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to reset password.");
  return data;
}

export async function linkPresenterAccount(id: string, email: string) {
  const response = await apiFetch(`${API_URL}/api/admin/presenters/${id}/link-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to link presenter account.");
  return data.presenter;
}

export async function getAdminUsers() {
  const response = await apiFetch(`${API_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to load users.");
  return data;
}

export async function updateManagedUserRole(id: string, role: string) {
  const response = await apiFetch(`${API_URL}/api/admin/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to update user role.");
  return data;
}

export async function setManagedUserActive(id: string, isActive: boolean) {
  const response = await apiFetch(`${API_URL}/api/admin/users/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ is_active: isActive }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to update account status.");
  return data;
}

export async function deleteManagedUser(id: string) {
  const response = await apiFetch(`${API_URL}/api/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to permanently delete user.");
  return data;
}



// === LIVE BROADCASTING ====//

export async function startBroadcast(
  showId: string,
  streamUrl: string 
) {
  const response = await apiFetch(
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

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Failed to start the broadcast.");
  if (!data?.id) throw new Error("The broadcast service returned no broadcast ID.");
  return data;
}

export async function stopBroadcast(
  broadcastId: string
) {
  const response = await apiFetch(
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
  const response = await apiFetch(
    `${API_URL}/api/broadcast/status`,
    { cache: "no-store" }
  );

  const text = await response.text();

  // console.log("Broadcast Status Response:", text);

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

export async function getBroadcastRelayToken(showId: string): Promise<string> {
  const response = await apiFetch(`${API_URL}/api/broadcast/relay-token?showId=${encodeURIComponent(showId)}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
  const data = await response.json();
  if (!response.ok || typeof data.token !== "string") {
    throw new Error(data.error || "Could not authorize the broadcast relay.");
  }
  return data.token;
}

export async function updateListenerCount(
  broadcastId: string,
  listenerCount: number
) {
  const response = await apiFetch(
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

  return response.json()}

export async function playBroadcastContent(
  broadcastId: string,
  contentId: string
) {
  const response = await apiFetch(
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
  const response = await apiFetch(
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
  const response = await apiFetch(
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

  const response = await apiFetch(
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
  const response = await apiFetch(
    `${API_URL}/api/music-tracks/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return response.ok;
}

//==== Getting Number of Listeners ====///
export async function getIcecastStatus() {
  const response = await apiFetch(
    `${API_URL}/api/icecast/status`
  );

  return response.json();
}
