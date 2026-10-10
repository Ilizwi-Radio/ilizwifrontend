import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import { createShow, updateShow, deleteShow } from "@/lib/api";
import { scheduleFields } from "./adminConfig";

export default function ShowsManagement({ shows, refreshShows }: { shows: any[]; refreshShows: () => Promise<void> }) {
  return (
    <AdminCollectionEditor
      title="Live Sessions & Schedule"
      description="These power both the homepage schedule grid and the public Upcoming Activities page (linked from the notification bell)."
      items={shows}
      fields={scheduleFields}
      idPrefix="sched"
      columns={["title", "status"]}
      onAdd={async (item) => { await createShow(item); await refreshShows(); }}
      onUpdate={async (id, patch) => { await updateShow(id, patch); await refreshShows(); }}
      onDelete={async (id) => { await deleteShow(id); await refreshShows(); }}
    />
  );
}
