"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteManagedUser,
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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<ManagedUser["role"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deactivated">("all");
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { user: currentUser } = useAuth();

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return users.filter((account) => {
      const matchesSearch = !term || [
        account.full_name,
        account.email || "",
        account.phone || "",
        account.id,
      ].some((value) => value.toLocaleLowerCase().includes(term));
      const matchesRole = roleFilter === "all" || account.role === roleFilter;
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" ? account.is_active : !account.is_active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

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

  const permanentlyDeleteUser = async () => {
    if (!deleteTarget || deleteConfirmation !== "DELETE") return;
    setSavingId(deleteTarget.id);
    setError("");
    try {
      await deleteManagedUser(deleteTarget.id);
      setUsers((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteConfirmation("");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not permanently delete this account.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-bold text-lg text-green-900">User accounts</h2>
        <p className="text-sm text-stone-500 mt-1">
          Search and filter all accounts, assign roles, or deactivate an account reversibly. Permanent deletion may also delete related records.
        </p>
      </div>
      {error && !deleteTarget && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="py-8 text-center text-stone-500">Loading accounts…</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-stone-500">No accounts found.</p>
      ) : (
        <>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <label className="relative block">
            <span className="sr-only">Search users</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone, or ID"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
            />
          </label>
          <label>
            <span className="sr-only">Filter by role</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as ManagedUser["role"] | "all")}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="all">All roles</option>
              {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by account status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </label>
        </div>
        <div className="mb-3 text-sm text-stone-500" aria-live="polite">
          Showing {filteredUsers.length} of {users.length} accounts
        </div>
        {filteredUsers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 py-8 text-center text-stone-500">
            No accounts match your search and filters.
          </p>
        ) : <div className="overflow-x-auto">
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
              {filteredUsers.map((account) => (
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
                    <div className="flex items-center gap-2">
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
                      <button
                        type="button"
                        disabled={savingId === account.id || account.id === currentUser?.id}
                        onClick={() => {
                          setDeleteTarget(account);
                          setDeleteConfirmation("");
                          setError("");
                        }}
                        className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
        </>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div>
              <h3 id="delete-user-title" className="text-lg font-bold text-red-800">Permanently delete account?</h3>
              <p className="mt-2 text-sm text-stone-700">
                This will permanently delete <strong>{deleteTarget.full_name}</strong>
                {deleteTarget.email ? ` (${deleteTarget.email})` : ""}. Associated data may also be deleted, and this action cannot be undone.
              </p>
              <p className="mt-2 text-sm text-stone-500">
                To preserve this person&apos;s records, cancel and use Deactivate instead.
              </p>
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <label className="block text-sm font-medium text-stone-700">
              Type DELETE to confirm
              <input
                autoComplete="off"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={savingId === deleteTarget.id}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmation("");
                }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingId === deleteTarget.id || deleteConfirmation !== "DELETE"}
                onClick={permanentlyDeleteUser}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingId === deleteTarget.id ? "Deleting…" : "Permanently delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
