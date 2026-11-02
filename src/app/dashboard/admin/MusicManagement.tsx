"use client";

import { useEffect, useMemo, useState } from "react";
import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import {
  createSongArtist,
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

type UploadStatus = "pending" | "uploading" | "uploaded" | "failed";

type SongDraft = {
  id: string;
  file: File;
  title: string;
  artistId: string;
  genre: string;
  languageCode: string;
  durationSeconds: string;
  status: UploadStatus;
  error?: string;
};

function updateDraft(
  drafts: SongDraft[],
  id: string,
  patch: Partial<SongDraft>
): SongDraft[] {
  return drafts.map((draft) => draft.id === id ? { ...draft, ...patch } : draft);
}

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
  const [artistName, setArtistName] = useState("");
  const [artistCountry, setArtistCountry] = useState("");
  const [artistError, setArtistError] = useState("");
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [drafts, setDrafts] = useState<SongDraft[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

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

  const handleCreateArtist = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingArtist(true);
    setArtistError("");
    try {
      const artist = await createSongArtist({
        name: artistName.trim(),
        country: artistCountry.trim(),
      });
      setArtists((current) => [...current, artist].sort((a, b) => a.name.localeCompare(b.name)));
      setDrafts((current) => current.map((draft) => draft.artistId
        ? draft
        : { ...draft, artistId: artist.id }));
      setArtistName("");
      setArtistCountry("");
      setUploadMessage(`Artist "${artist.name}" added.`);
    } catch (error) {
      console.error("Failed to create a song artist:", error);
      setArtistError(error instanceof Error ? error.message : "Could not create this artist.");
    } finally {
      setIsCreatingArtist(false);
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setDrafts((current) => [
      ...current,
      ...files.map((file): SongDraft => ({
        id: crypto.randomUUID(),
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artistId: "",
        genre: "",
        languageCode: "",
        durationSeconds: "",
        status: "pending",
      })),
    ]);
    setUploadMessage("");
    event.target.value = "";
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pendingDrafts = drafts.filter((draft) => draft.status !== "uploaded");
    if (!pendingDrafts.length) return;

    setIsUploading(true);
    setUploadMessage("");
    let uploadedCount = 0;
    let failedCount = 0;

    for (const draft of pendingDrafts) {
      setDrafts((current) => updateDraft(current, draft.id, { status: "uploading", error: undefined }));
      try {
        const upload = await createSongAudioUploadUrl(draft.file);
        await createStationSong({
          title: draft.title.trim(),
          artist_id: draft.artistId,
          language_code: draft.languageCode.trim(),
          genre: draft.genre.trim(),
          duration_seconds: Number(draft.durationSeconds),
          audio_file_url: `r2://${upload.objectKey}`,
          is_downloadable: false,
        });
        uploadedCount += 1;
        setDrafts((current) => updateDraft(current, draft.id, { status: "uploaded" }));
      } catch (error) {
        failedCount += 1;
        console.error(`Failed to upload "${draft.file.name}":`, error);
        setDrafts((current) => updateDraft(current, draft.id, {
          status: "failed",
          error: error instanceof Error ? error.message : "Could not upload this song.",
        }));
      }
    }

    if (uploadedCount) {
      try {
        await refreshSongs();
      } catch (error) {
        console.error("Songs uploaded, but the library could not be refreshed:", error);
        setUploadMessage(`${uploadedCount} song(s) uploaded, but the library refresh failed. Reload the page to see them.`);
        setIsUploading(false);
        return;
      }
    }

    setUploadMessage(
      `${uploadedCount} song(s) uploaded${failedCount ? `; ${failedCount} failed. Failed songs can be retried.` : "."}`
    );
    setIsUploading(false);
  };

  return (
    <div className="space-y-8">
      <GenresManagement genres={genres} setGenres={setGenres} editable />

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-stone-50 p-5">
        <div>
          <h3 className="font-bold text-lg text-green-900">Add an artist</h3>
          <p className="mt-1 text-sm text-stone-600">Create an artist record before assigning songs to them.</p>
        </div>
        <form onSubmit={handleCreateArtist} className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-semibold text-stone-700">
            Artist name
            <input
              required
              maxLength={150}
              value={artistName}
              onChange={(event) => setArtistName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Country
            <input
              required
              maxLength={60}
              value={artistCountry}
              onChange={(event) => setArtistCountry(event.target.value)}
              placeholder="South Africa"
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreatingArtist}
              className="rounded-lg border border-green-900 px-4 py-2 text-sm font-semibold text-green-900 disabled:opacity-50"
            >
              {isCreatingArtist ? "Adding artist…" : "Add artist"}
            </button>
          </div>
        </form>
        {artistError && <p role="alert" className="text-sm text-red-700">{artistError}</p>}
        {artistLoadError && <p role="alert" className="text-sm text-red-700">{artistLoadError}</p>}
      </section>

      <form onSubmit={handleUpload} className="space-y-5 rounded-2xl border border-stone-200 bg-stone-50 p-5">
        <div>
          <h3 className="font-bold text-lg text-green-900">Add audio to the station library</h3>
          <p className="mt-1 text-sm text-stone-600">
            Select multiple files and enter metadata for each track. Audio uploads directly to private Cloudflare R2 storage;
            song metadata stays in PostgreSQL. Maximum file size: 100 MB per file.
          </p>
        </div>
        {!artists.length && !artistLoadError && (
          <p className="text-sm text-amber-800">Add an artist before uploading songs.</p>
        )}
        <label className="block text-xs font-semibold text-stone-700">
          Audio files
          <input
            type="file"
            multiple
            accept="audio/*,.m4a,.flac"
            onChange={handleFilesSelected}
            className="mt-1 block w-full text-sm"
            disabled={isUploading}
          />
        </label>

        {drafts.length > 0 && (
          <div className="space-y-4">
            {drafts.map((draft, index) => (
              <fieldset key={draft.id} className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
                <legend className="px-2 text-sm font-semibold text-green-900">Track {index + 1}</legend>
                <p className="sm:col-span-2 lg:col-span-3 truncate text-xs text-stone-500">
                  {draft.file.name} · {(draft.file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
                <label className="text-xs font-semibold text-stone-700">
                  Title
                  <input
                    required
                    value={draft.title}
                    onChange={(event) => setDrafts((current) => updateDraft(current, draft.id, { title: event.target.value }))}
                    disabled={isUploading || draft.status === "uploaded"}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-stone-700">
                  Artist
                  <select
                    required
                    value={draft.artistId}
                    onChange={(event) => setDrafts((current) => updateDraft(current, draft.id, { artistId: event.target.value }))}
                    disabled={isUploading || draft.status === "uploaded" || !artists.length}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select an artist</option>
                    {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-stone-700">
                  Genre
                  <input
                    required
                    value={draft.genre}
                    onChange={(event) => setDrafts((current) => updateDraft(current, draft.id, { genre: event.target.value }))}
                    disabled={isUploading || draft.status === "uploaded"}
                    placeholder="Amapiano"
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-stone-700">
                  Language code
                  <input
                    required
                    value={draft.languageCode}
                    onChange={(event) => setDrafts((current) => updateDraft(current, draft.id, { languageCode: event.target.value }))}
                    disabled={isUploading || draft.status === "uploaded"}
                    placeholder="zu"
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-stone-700">
                  Duration (seconds)
                  <input
                    required
                    type="number"
                    min="1"
                    value={draft.durationSeconds}
                    onChange={(event) => setDrafts((current) => updateDraft(current, draft.id, { durationSeconds: event.target.value }))}
                    disabled={isUploading || draft.status === "uploaded"}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex items-end justify-between gap-2">
                  <span className={`text-xs font-semibold ${draft.status === "failed" ? "text-red-700" : "text-stone-600"}`}>
                    {draft.status === "pending" && "Ready"}
                    {draft.status === "uploading" && "Uploading…"}
                    {draft.status === "uploaded" && "Uploaded"}
                    {draft.status === "failed" && "Upload failed"}
                  </span>
                  {draft.status !== "uploaded" && !isUploading && (
                    <button
                      type="button"
                      onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}
                      className="text-xs text-red-700 underline"
                    >
                      Remove
                    </button>
                  )}
                  {draft.error && <span role="alert" className="text-xs text-red-700">{draft.error}</span>}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        {uploadMessage && <p role="status" className="text-sm text-green-900">{uploadMessage}</p>}
        <button
          type="submit"
          disabled={isUploading || !artists.length || !drafts.some((draft) => draft.status !== "uploaded")}
          className="rounded-lg bg-green-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Uploading songs…" : `Upload ${drafts.filter((draft) => draft.status !== "uploaded").length || ""} song(s)`}
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
