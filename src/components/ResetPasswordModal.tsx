"use client";

import { useState } from "react";

type ResetPasswordModalProps = {
  presenterName: string;
  /**
   * Called when the admin submits the form. Return value shape matches what
   * the backend's reset-password endpoint responds with:
   * - If the admin typed a specific password, temporaryPassword will be
   *   undefined (we never echo back an admin-chosen password).
   * - If left blank, the backend generates one and returns it here — shown
   *   to the admin exactly once.
   *
   * This is a stub for now (no real API call), wired in a later step.
   */
  onSubmit: (newPassword: string | null) => Promise<{ temporaryPassword?: string }>;
  onClose: () => void;
};

export default function ResetPasswordModal({
  presenterName,
  onSubmit,
  onClose,
}: ResetPasswordModalProps) {
  const [mode, setMode] = useState<"generate" | "custom">("generate");
  const [customPassword, setCustomPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ temporaryPassword?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "custom") {
      if (customPassword.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit(mode === "custom" ? customPassword : null);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {
      /* clipboard access denied — the admin can still select/copy manually */
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {!result ? (
          <>
            <h3 className="font-bold text-lg text-green-900 mb-1">Reset Password</h3>
            <p className="text-stone-500 text-sm mb-5">
              For presenter: <span className="font-semibold text-stone-700">{presenterName}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="reset-mode"
                    checked={mode === "generate"}
                    onChange={() => setMode("generate")}
                  />
                  Generate a random temporary password
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="reset-mode"
                    checked={mode === "custom"}
                    onChange={() => setMode("custom")}
                  />
                  Set a specific password
                </label>
              </div>

              {mode === "custom" && (
                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                  autoFocus
                />
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-5 py-2.5"
                >
                  {isSubmitting ? "Resetting…" : "Reset Password"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="border border-stone-300 hover:bg-stone-100 text-sm font-semibold rounded-lg px-5 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg text-green-900 mb-1">Password Reset</h3>
            <p className="text-stone-500 text-sm mb-4">
              The password for <span className="font-semibold text-stone-700">{presenterName}</span> has been updated.
            </p>

            {result.temporaryPassword ? (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-stone-500 mb-2">
                  Temporary password — shown once. Copy it now and share it with the presenter securely:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono">
                    {result.temporaryPassword}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.temporaryPassword!)}
                    className="text-xs font-semibold text-green-800 hover:text-green-900 shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-600 mb-4">
                The password was set to the value you specified.
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}