"use client";

import { useEffect, useState } from "react";
import {
  getAdminUsers,
  setManagedUserActive,
  updateManagedUserRole,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

type ManagedUser = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: "registered" | "presenter" | "moderator" | "admin";
  is_active: boolean;
  created_at: string;
};

const ROLES: ManagedUser["role"][] = ["registered", "presenter", "moderator", "admin"];

export default function UsersManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { user: currentUser } = useAuth();

  const refreshUsers = async () => {
    setUsers(await getAdminUsers());
  };

  useEffect(() => {
    refreshUsers()
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load accounts."))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (target: ManagedUser, role: ManagedUser["role"]) => {
    setSavingId(target.id);
    setError("");
    try {
      const updated = await updateManagedUserRole(target.id, role);
      setUsers((current) => current.map((item) => item.id === target.id ? updated : item));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update account role.");
    } finally {
      setSavingId(null);
    }
  };

  const changeStatus = async (target: ManagedUser) => {
    const isActive = !target.is_active;
    if (!isActive && !window.confirm(`Deactivate ${target.full_name}'s account? Their records will be preserved and the account can be restored later.`)) {
      return;
    }

    setSavingId(target.id);
    setError("");
    try {
      const updated = await setManagedUserActive(target.id, isActive);
      setUsers((current) => current.map((item) => item.id === target.id ? updated : item));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update account status.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-bold text-lg text-green-900">User accounts</h2>
        <p className="text-sm text-stone-500 mt-1">
          Assign listener, presenter, moderator, or admin roles. Deactivation is reversible and preserves account data.
        </p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="py-8 text-center text-stone-500">Loading accounts…</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-stone-500">No accounts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                <th className="px-3 py-3">Person</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-3 py-3">Account action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr key={account.id} className="border-b border-stone-100">
                  <td className="px-3 py-4">
                    <div className="font-semibold text-stone-900">{account.full_name}</div>
                    <div className="text-stone-500">{account.email}</div>
                    {account.phone && <div className="text-xs text-stone-400">{account.phone}</div>}
                  </td>
                  <td className="px-3 py-4">
                    <select
                      value={account.role}
                      disabled={savingId === account.id || account.id === currentUser?.id}
                      onChange={(event) => {
                        if (ROLES.includes(event.target.value as ManagedUser["role"])) {
                          changeRole(account, event.target.value as ManagedUser["role"]);
                        }
                      }}
                      aria-label={`Role for ${account.full_name}`}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 disabled:opacity-50"
                    >
                      {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-4">
                    <span className={account.is_active ? "text-green-700" : "text-red-700"}>
                      {account.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-stone-500">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      disabled={savingId === account.id || account.id === currentUser?.id}
                      onClick={() => changeStatus(account)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                        account.is_active
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-800 hover:bg-green-100"
                      }`}
                    >
                      {account.is_active ? "Deactivate" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
