"use client";

import { useState } from "react";
import AdminCollectionEditor, { RowAction } from "@/components/AdminCollectionEditor";
import {
  assignPrimaryPresenterToShow,
  createShow,
  updateShow,
  updateShowVisibility,
} from "@/lib/api";
import { scheduleFields } from "./adminConfig";
import { isVisible } from "./visibility";

export default function ShowsManagement({ shows, presenters, refreshShows }: { shows: any[]; presenters: any[]; refreshShows: () => Promise<void> }) {
  const [assigningShow, setAssigningShow] = useState<any | null>(null);
  const [selectedPresenterId, setSelectedPresenterId] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const archiveShow = async (show: any) => {
    if (!confirm(`Archive "${show.title}"? Broadcast history will be preserved, and the show can be restored later.`)) return;
    await updateShowVisibility(show.id, false);
    await refreshShows();
  };
  const restoreShow = async (show: any) => {
    await updateShowVisibility(show.id, true);
    await refreshShows();
  };

  const rowActions: RowAction<any>[] = [
    {
      label: "Archive",
      variant: "danger",
      onClick: archiveShow,
      hidden: (show) => !isVisible(show),
    },
    {
      label: "Restore",
      onClick: restoreShow,
      hidden: (show) => isVisible(show),
    },
    {
      label: "Set Primary Host",
      onClick: (show) => {
        setAssigningShow(show);
        setSelectedPresenterId(show.presenter_id || "");
        setAssignmentError("");
      },
    },
  ];

  const refreshAfterMutation = async (resultLabel: string) => {
    try {
      await refreshShows();
    } catch (error) {
      const detail = error instanceof Error ? ` ${error.message}` : "";
      throw new Error(`${resultLabel}, but the show list could not be refreshed.${detail}`);
    }
  };
  const fields = scheduleFields.map((field) => field.key === "presenter_id"
    ? {
        ...field,
        required: false,
        options: presenters.map((presenter) => ({
          label: `${presenter.display_name || presenter.name || presenter.id}${presenter.user_id ? "" : " (login not linked)"}`,
          value: presenter.id,
        })),
      }
    : field);

  return (
    <>
      <AdminCollectionEditor
        title="Live Sessions & Schedule"
        description="A primary presenter is optional when creating a show and can be assigned later. Presenters need a linked login to broadcast."
        items={shows}
        fields={fields}
        idPrefix="sched"
        columns={["title", "display_name", "scheduled_start"]}
        rowActions={rowActions}
        hideDelete
        onAdd={async (item) => { await createShow(item); await refreshAfterMutation("Show created"); }}
        onUpdate={async (id, patch) => { await updateShow(id, patch); await refreshAfterMutation("Show updated"); }}
      />

      {assigningShow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!selectedPresenterId) return;
              setIsAssigning(true);
              setAssignmentError("");
              try {
                await assignPrimaryPresenterToShow(assigningShow.id, selectedPresenterId);
                await refreshShows();
                setAssigningShow(null);
              } catch (error) {
                setAssignmentError(error instanceof Error ? error.message : "Could not assign the presenter.");
              } finally {
                setIsAssigning(false);
              }
            }}
          >
            <div>
              <h3 className="font-bold text-lg text-green-900">Set primary host</h3>
              <p className="text-stone-500 text-sm mt-1">Choose the presenter who will host “{assigningShow.title}”. Only the primary host can start this station broadcast.</p>
            </div>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-600 mb-1.5">Presenter account</span>
              <select
                required
                value={selectedPresenterId}
                onChange={(event) => setSelectedPresenterId(event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
              >
                <option value="">Choose a presenter…</option>
                {presenters.map((presenter) => (
                  <option key={presenter.id} value={presenter.id}>
                    {presenter.display_name || presenter.name || presenter.id}{presenter.user_id ? "" : " (login not linked)"}
                  </option>
                ))}
              </select>
            </label>
            {presenters.length === 0 && (
              <p className="text-amber-700 text-sm">
                No presenter profiles are available yet. You can still create this show and assign a presenter later.
              </p>
            )}
            {selectedPresenterId && !presenters.find((presenter) => presenter.id === selectedPresenterId)?.user_id && (
              <p className="text-amber-700 text-sm">
                This presenter has no linked login yet and cannot start a broadcast until an account is linked.
              </p>
            )}
            {assignmentError && <p role="alert" className="text-red-600 text-sm">{assignmentError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isAssigning || !selectedPresenterId}
                className="bg-green-900 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-5 py-2.5"
              >
                {isAssigning ? "Saving…" : "Set primary host"}
              </button>
              <button
                type="button"
                onClick={() => setAssigningShow(null)}
                disabled={isAssigning}
                className="border border-stone-300 hover:bg-stone-100 text-sm font-semibold rounded-lg px-5 py-2.5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
