import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import { createSong, updateSong, deleteSong } from "@/lib/api";
import { musicFields } from "./adminConfig";
import GenresManagement from "./GenresManagement";

export default function MusicManagement({
  songs,
  refreshSongs,
  genres,
  setGenres,
}: {
  songs: any[];
  refreshSongs: () => Promise<void>;
  genres: string[];
  setGenres: (g: string[]) => void;
}) {
  return (
    <div className="space-y-8">
      <GenresManagement genres={genres} setGenres={setGenres} editable />

      <AdminCollectionEditor
        title="Tracks"
        items={songs}
        fields={musicFields}
        idPrefix="music"
        columns={["title", "artist"]}
        onAdd={async (item) => { await createSong(item); await refreshSongs(); }}
        onUpdate={async (id, patch) => { await updateSong(id, patch); await refreshSongs(); }}
        onDelete={async (id) => { await deleteSong(id); await refreshSongs(); }}
      />
    </div>
  );
}
