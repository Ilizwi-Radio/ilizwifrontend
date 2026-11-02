import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import { videoFields } from "./adminConfig";
import { visibilityActions } from "./visibility";
import { editVideo, removeVideo, saveVideo } from "@/services/video.service";

export default function VideosManagement({ videos, refreshVideos }: { videos: any[]; refreshVideos: () => Promise<void> }) {
  return (
    <AdminCollectionEditor
      title="Video Hub"
      description="Upload videos to the official iLIZWI Radio YouTube channel, then add their YouTube links here. YouTube handles video storage and playback."
      items={videos}
      fields={videoFields}
      idPrefix="video"
      columns={["title", "category_name"]}
      rowActions={visibilityActions(editVideo, refreshVideos)}
      onAdd={async (item) => { await saveVideo(item); await refreshVideos(); }}
      onUpdate={async (id, patch) => { await editVideo(id, patch); await refreshVideos(); }}
      onDelete={async (id) => { await removeVideo(id); await refreshVideos(); }}
    />
  );
}
