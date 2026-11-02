import { createVideo, deleteVideo, getVideos, updateVideo } from "@/lib/api";

export type VideoItem = {
  id: string;
  title: string;
  description?: string | null;
  video_file_url: string;
  youtube_video_id: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  language_code?: string | null;
  category_name?: string | null;
  view_count?: number | null;
  is_visible?: boolean;
  is_featured?: boolean;
};

function assertSuccessfulResponse(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const message = (data as { error?: unknown }).error;
    throw new Error(typeof message === "string" ? message : fallback);
  }
  return data;
}

export async function listVideos(includeHidden = false): Promise<VideoItem[]> {
  const data = await getVideos(includeHidden);
  if (!Array.isArray(data)) {
    throw new Error("The video service returned an invalid response.");
  }
  return data as VideoItem[];
}

export async function saveVideo(video: Partial<VideoItem>) {
  const data = await createVideo(video);
  return assertSuccessfulResponse(data, "Failed to create video.");
}

export async function editVideo(id: string, patch: Partial<VideoItem>) {
  const data = await updateVideo(id, patch);
  return assertSuccessfulResponse(data, "Failed to update video.");
}

export async function removeVideo(id: string) {
  const data = await deleteVideo(id);
  return assertSuccessfulResponse(data, "Failed to delete video.");
}