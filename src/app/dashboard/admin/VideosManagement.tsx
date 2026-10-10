import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import { createVideo, updateVideo, deleteVideo } from "@/lib/api";
import { videoFields } from "./adminConfig";
import { visibilityActions } from "./visibility";

export default function VideosManagement({ videos, refreshVideos }: { videos: any[]; refreshVideos: () => Promise<void> }) {
  return (
    <AdminCollectionEditor
      title="Video Hub"
      items={videos}
      fields={videoFields}
      idPrefix="video"
      columns={["title"]}
      rowActions={visibilityActions(updateVideo, refreshVideos)}
      onAdd={async (item) => { await createVideo(item); await refreshVideos(); }}
      onUpdate={async (id, patch) => { await updateVideo(id, patch); await refreshVideos(); }}
      onDelete={async (id) => { await deleteVideo(id); await refreshVideos(); }}
    />
  );
}
