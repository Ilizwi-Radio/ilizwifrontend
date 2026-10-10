import { useState } from "react";

// Genres are still local state (same as before). Shared by the Music tab (editable) and the Genres tab (read-only).
export default function GenresManagement({
  genres,
  setGenres,
  editable = false,
}: {
  genres: string[];
  setGenres: (g: string[]) => void;
  editable?: boolean;
}) {
  const [genreInput, setGenreInput] = useState("");

  if (!editable) {
    return (
      <div>
        <h3 className="font-bold text-lg text-green-900 mb-3">Genres</h3>
        <p className="text-stone-500 text-sm mb-3">Also editable from the Music tab.</p>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <span key={g} className="bg-stone-100 rounded-full px-3 py-1.5 text-sm">
              {g}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold text-lg text-green-900 mb-3">Genres</h3>
      <p className="text-stone-500 text-sm mb-3">Powers the filter pills on the Music Library.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {genres.map((g) => (
          <span key={g} className="inline-flex items-center gap-2 bg-stone-100 rounded-full px-3 py-1.5 text-sm">
            {g}
            {g !== "All" && (
              <button
                onClick={() => setGenres(genres.filter((x) => x !== g))}
                className="text-stone-400 hover:text-red-600"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (genreInput.trim() && !genres.includes(genreInput.trim())) {
            setGenres([...genres, genreInput.trim()]);
          }
          setGenreInput("");
        }}
        className="flex gap-2"
      >
        <input
          value={genreInput}
          onChange={(e) => setGenreInput(e.target.value)}
          placeholder="Add a genre…"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
        />
        <button type="submit" className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2">
          Add
        </button>
      </form>
    </div>
  );
}
