"use client";

import { useEffect, useState } from "react";
import AdminCollectionEditor, { RowAction } from "@/components/AdminCollectionEditor";
import {
  assignPrimaryPresenterToShow,
  createShow,
  deleteShow,
  getPresenters,
  updateShow,
} from "@/lib/api";
import { scheduleFields } from "./adminConfig";
import { visibilityActions } from "./visibility";

export default function ShowsManagement({ shows, refreshShows }: { shows: any[]; refreshShows: () => Promise<void> }) {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [assigningShow, setAssigningShow] = useState<any | null>(null);
  const [selectedPresenterId, setSelectedPresenterId] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    getPresenters()
      .then((data) => setPresenters(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Failed to load presenter profiles:", error));
  }, []);

  const rowActions: RowAction<any>[] = [
    ...visibilityActions(updateShow, refreshShows),
    {
      label: "Set Primary Host",
      onClick: (show) => {
        setAssigningShow(show);
        setSelectedPresenterId(show.presenter_id || "");
        setAssignmentError("");
      },
    },
  ];

  const linkedPresenters = presenters.filter((presenter) => Boolean(presenter.user_id));

  return (
    <>
      <AdminCollectionEditor
        title="Live Sessions & Schedule"
        description="Create and manage station shows. A presenter profile must be linked to a login and assigned as primary host before it can go live."
        items={shows}
        fields={scheduleFields}
        idPrefix="sched"
        columns={["title", "display_name", "status"]}
        rowActions={rowActions}
        onAdd={async (item) => { await createShow(item); await refreshShows(); }}
        onUpdate={async (id, patch) => { await updateShow(id, patch); await refreshShows(); }}
        onDelete={async (id) => { await deleteShow(id); await refreshShows(); }}
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
                <option value="">Select a linked presenter…</option>
                {linkedPresenters.map((presenter) => (
                  <option key={presenter.id} value={presenter.id}>
                    {presenter.display_name || presenter.name || presenter.id}
                  </option>
                ))}
              </select>
            </label>
            {linkedPresenters.length === 0 && (
              <p className="text-amber-700 text-sm">
                No linked presenter accounts are available. In the Presenters tab, create a profile and use “Link Login” to connect the admin or presenter account first.
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
