import { useState } from "react";
import AdminCollectionEditor, { RowAction } from "@/components/AdminCollectionEditor";
import ResetPasswordModal from "@/components/ResetPasswordModal";
import { createPresenter, updatePresenter, deletePresenter } from "@/lib/api";
import { presenterFields } from "./adminConfig";

export default function PresentersManagement({
  presenters,
  refreshPresenters,
}: {
  presenters: any[];
  refreshPresenters: () => Promise<void>;
}) {
  const [resetPasswordTarget, setResetPasswordTarget] = useState<any | null>(null);

  const handleResetPassword = async (
    newPassword: string | null
  ): Promise<{ temporaryPassword?: string }> => {
    // --- STUB: replace with real API call ---
    // const res = await resetPresenterPassword(resetPasswordTarget.id, newPassword);
    // return res;

    await new Promise((resolve) => setTimeout(resolve, 600)); // simulate network delay

    if (newPassword) {
      return {}; // admin set a specific password — nothing to show back
    }
    // simulate the backend generating one
    return { temporaryPassword: "K7M2-QX9P" };
    // --- end stub ---
  };

  const presenterRowActions: RowAction<any>[] = [
    {
      label: "Reset Password",
      onClick: (presenter) => setResetPasswordTarget(presenter),
      hidden: (presenter) => !presenter.user_id,
    },
  ];

  return (
    <>
      <AdminCollectionEditor
        title="Presenters"
        description="Adding a presenter here does not create their login — that's provisioned separately (see BACKEND_INTEGRATION_MAP.md, Auth service)."
        items={presenters}
        fields={presenterFields}
        idPrefix="presenter"
        columns={["display_name", "presenter_type"]}
        rowActions={presenterRowActions}
        onAdd={async (item) => { await createPresenter(item); await refreshPresenters(); }}
        onUpdate={async (id, patch) => { await updatePresenter(id, patch); await refreshPresenters(); }}
        onDelete={async (id) => { await deletePresenter(id); await refreshPresenters(); }}
      />

      {resetPasswordTarget && (
        <ResetPasswordModal
          presenterName={resetPasswordTarget.display_name}
          onSubmit={handleResetPassword}
          onClose={() => setResetPasswordTarget(null)}
        />
      )}
    </>
  );
}
