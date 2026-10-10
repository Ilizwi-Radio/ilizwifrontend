import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import { createEvent, updateEvent, deleteEvent } from "@/lib/api";
import { eventFields } from "./adminConfig";

export default function EventsManagement({ events, refreshEvents }: { events: any[]; refreshEvents: () => Promise<void> }) {
  return (
    <AdminCollectionEditor
      title="Events & Festivals"
      description="These also appear on the public Upcoming Activities page."
      items={events}
      fields={eventFields}
      idPrefix="event"
      columns={["title", "location"]}
      onAdd={async (item) => { await createEvent(item); await refreshEvents(); }}
      onUpdate={async (id, patch) => { await updateEvent(id, patch); await refreshEvents(); }}
      onDelete={async (id) => { await deleteEvent(id); await refreshEvents(); }}
    />
  );
}
