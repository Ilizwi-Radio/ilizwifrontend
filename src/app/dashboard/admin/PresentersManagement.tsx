import { useState } from "react";
import AdminCollectionEditor, { RowAction } from "@/components/AdminCollectionEditor";
import ResetPasswordModal from "@/components/ResetPasswordModal";
import {
  createPresenter,
  updatePresenter,
  deletePresenter,
  resetPresenterPassword,
  linkPresenterAccount,
  setPresenterPhotoUrl,
  uploadPresenterPhoto,
} from "@/lib/api";
import { presenterFields } from "./adminConfig";

export default function PresentersManagement({
  presenters,
  refreshPresenters,
  allowAccountActions = true,
}: {
  presenters: any[];
  refreshPresenters: () => Promise<void>;
  allowAccountActions?: boolean;
}) {
  const [resetPasswordTarget, setResetPasswordTarget] = useState<any | null>(null);
  const [linkTarget, setLinkTarget] = useState<any | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<any | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const handleResetPassword = async (
    newPassword: string | null
  ): Promise<{ temporaryPassword?: string }> => {
    return resetPresenterPassword(resetPasswordTarget.id, newPassword);
  };

  const presenterRowActions: RowAction<any>[] = [
    {
      label: "Photo",
      onClick: (presenter) => {
        setPhotoTarget(presenter);
        setPhotoUrl(presenter.photo_url || "");
        setPhotoError("");
      },
    },
    {
      label: "Link Login",
      onClick: (presenter) => { setLinkTarget(presenter); setLinkError(""); setAccountEmail(""); },
      hidden: (presenter) => !allowAccountActions || Boolean(presenter.user_id),
    },
    {
      label: "Reset Password",
      onClick: (presenter) => setResetPasswordTarget(presenter),
      hidden: (presenter) => !allowAccountActions || !presenter.user_id,
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
        hideDelete={!allowAccountActions}
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
      {photoTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSavingPhoto(true);
              setPhotoError("");
              try {
                await setPresenterPhotoUrl(photoTarget.id, photoUrl);
                await refreshPresenters();
                setPhotoTarget(null);
              } catch (error) {
                setPhotoError(error instanceof Error ? error.message : "Could not save the photo URL.");
              } finally {
                setIsSavingPhoto(false);
              }
            }}
          >
            <div>
              <h3 className="font-bold text-lg text-green-900">Presenter photo</h3>
              <p className="text-stone-500 text-sm mt-1">
                Add an HTTP(S) image URL or upload a JPEG, PNG, or WebP (maximum 1.4 MB). Uploaded photos are stored in PostgreSQL.
              </p>
            </div>
            <label className="block text-sm font-medium text-stone-700">
              Photo URL
              <input
                type="url"
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                placeholder="https://example.com/presenter.jpg"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="border-t border-stone-200 pt-4">
              <label className="block text-sm font-medium text-stone-700">
                Or upload an image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-1 block w-full text-sm"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1_400_000) {
                      setPhotoError("Choose an image no larger than 1.4 MB.");
                      event.target.value = "";
                      return;
                    }
                    setIsSavingPhoto(true);
                    setPhotoError("");
                    try {
                      await uploadPresenterPhoto(photoTarget.id, file);
                      await refreshPresenters();
                      setPhotoTarget(null);
                    } catch (error) {
                      setPhotoError(error instanceof Error ? error.message : "Could not upload this image.");
                    } finally {
                      setIsSavingPhoto(false);
                    }
                  }}
                />
              </label>
            </div>
            {photoError && <p role="alert" className="text-red-600 text-sm">{photoError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={isSavingPhoto} className="bg-green-900 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-5 py-2.5">
                {isSavingPhoto ? "Saving…" : "Save photo URL"}
              </button>
              <button type="button" onClick={() => setPhotoTarget(null)} disabled={isSavingPhoto} className="border border-stone-300 hover:bg-stone-100 text-sm font-semibold rounded-lg px-5 py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {linkTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsLinking(true);
              setLinkError("");
              try {
                await linkPresenterAccount(linkTarget.id, accountEmail);
                await refreshPresenters();
                setLinkTarget(null);
              } catch (error) {
                setLinkError(error instanceof Error ? error.message : "Could not link this account.");
              } finally {
                setIsLinking(false);
              }
            }}
          >
            <div>
              <h3 className="font-bold text-lg text-green-900">Link presenter login</h3>
              <p className="text-stone-500 text-sm mt-1">Connect {linkTarget.display_name} to an existing login. Admin accounts keep admin access and also gain presenter access.</p>
            </div>
            <input
              type="email"
              required
              value={accountEmail}
              onChange={(event) => setAccountEmail(event.target.value)}
              placeholder="Account email address"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
            />
            {linkError && <p role="alert" className="text-red-600 text-sm">{linkError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={isLinking} className="bg-green-900 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-5 py-2.5">
                {isLinking ? "Linking…" : "Link account"}
              </button>
              <button type="button" onClick={() => setLinkTarget(null)} disabled={isLinking} className="border border-stone-300 hover:bg-stone-100 text-sm font-semibold rounded-lg px-5 py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
