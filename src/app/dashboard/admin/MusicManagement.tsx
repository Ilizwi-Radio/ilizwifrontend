"use client";

import { useEffect, useMemo, useState } from "react";
import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import {
  createStationSong,
  createSongAudioUploadUrl,
  deleteSong,
  getSongArtists,
  updateSong,
} from "@/lib/api";
import { musicFields } from "./adminConfig";
import { visibilityActions } from "./visibility";
import GenresManagement from "./GenresManagement";
import type { SongArtist } from "@/lib/types";

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
  const [artists, setArtists] = useState<SongArtist[]>([]);
  const [artistLoadError, setArtistLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [artistId, setArtistId] = useState("");
  const [genre, setGenre] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getSongArtists()
      .then(setArtists)
      .catch((error: unknown) => {
        console.error("Failed to load song artists:", error);
        setArtistLoadError(error instanceof Error ? error.message : "Could not load artists.");
      });
  }, []);

  const editableFields = useMemo(
    () => musicFields.map((field) => field.key === "artist_id"
      ? {
          ...field,
          options: artists.map((artist) => ({ label: artist.name, value: artist.id })),
        }
      : field),
    [artists]
  );

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!audioFile || !artistId) return;
    const form = event.currentTarget;
    setIsUploading(true);
    setUploadError("");
    try {
      const upload = await createSongAudioUploadUrl(audioFile);
      await createStationSong({
        title: title.trim(),
        artist_id: artistId,
        language_code: languageCode.trim(),
        genre: genre.trim(),
        duration_seconds: Number(durationSeconds),
        audio_file_url: `r2://${upload.objectKey}`,
        is_downloadable: false,
      });
      await refreshSongs();
      setTitle("");
      setArtistId("");
      setGenre("");
      setLanguageCode("");
      setDurationSeconds("");
      setAudioFile(null);
      form.reset();
    } catch (error) {
      console.error("Failed to add a song to the R2 library:", error);
      setUploadError(error instanceof Error ? error.message : "Could not upload this song.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <GenresManagement genres={genres} setGenres={setGenres} editable />

      <form onSubmit={handleUpload} className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-green-900">Add audio to the station library</h3>
          <p className="mt-1 text-sm text-stone-600">
            Audio files upload directly to private Cloudflare R2 storage; song metadata stays in PostgreSQL.
            Maximum file size: 100 MB.
          </p>
        </div>
        {artistLoadError && <p role="alert" className="text-sm text-red-700">{artistLoadError}</p>}
        {!artists.length && !artistLoadError && (
          <p className="text-sm text-amber-800">Add an artist to the existing artists table before uploading songs.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-stone-700">
            Title
            <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Artist
            <select required value={artistId} onChange={(event) => setArtistId(event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" disabled={!artists.length}>
              <option value="">Select an artist</option>
              {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Genre
            <input required value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Amapiano" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Language code
            <input required value={languageCode} onChange={(event) => setLanguageCode(event.target.value)} placeholder="zu" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Duration (seconds)
            <input required type="number" min="1" value={durationSeconds} onChange={(event) => setDurationSeconds(event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Audio file
            <input required type="file" accept="audio/*,.m4a,.flac" onChange={(event) => setAudioFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
          </label>
        </div>
        {uploadError && <p role="alert" className="text-sm text-red-700">{uploadError}</p>}
        <button type="submit" disabled={isUploading || !artists.length} className="rounded-lg bg-green-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {isUploading ? "Uploading audio…" : "Upload song"}
        </button>
      </form>

      <AdminCollectionEditor
        title="Tracks"
        items={songs}
        fields={editableFields}
        idPrefix="music"
        columns={["title", "artist"]}
        rowActions={visibilityActions(updateSong, refreshSongs)}
        hideAdd
        onAdd={async () => { throw new Error("Use the audio upload form to add a track."); }}
        onUpdate={async (id, patch) => {
          await updateSong(id, {
            ...patch,
            duration_seconds: Number(patch.duration_seconds),
          });
          await refreshSongs();
        }}
        onDelete={async (id) => { await deleteSong(id); await refreshSongs(); }}
      />
    </div>
  );
}
