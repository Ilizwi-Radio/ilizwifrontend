"use client";

import { useState } from "react";
import Icon from "./Icon";

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "checkbox" | "select" | "color" | "datetime-local";
  options?: Array<string | { label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | boolean;
};

export type RowAction<T> = {
  label: string;
  onClick: (item: T) => void | Promise<void>;
  variant?: "default" | "danger";
  /** Hide this action for a given row — e.g. hide "Reset Password" when the
   * presenter has no linked login yet. */
  hidden?: (item: T) => boolean;
};

type Row = Record<string, string | boolean | null | undefined> & { id: string };

export default function AdminCollectionEditor<T extends Row>({
  title,
  description,
  items,
  fields,
  idPrefix,
  onAdd,
  onUpdate,
  onDelete,
  columns = ["title", "name"],
  rowActions,
  hideDelete = false,
  hideAdd = false,
}: {
  title: string;
  description?: string;
  items: T[];
  fields: FieldConfig[];
  idPrefix: string;
  onAdd: (item: T) => void | Promise<void>;
  onUpdate: (id: string, patch: Partial<T>) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  /** which field(s) to show as the row's primary label in the list */
  columns?: string[];
  /** Optional extra buttons per row, beyond the built-in Edit/Delete —
   * e.g. "Reset Password", "Link Account". */
  rowActions?: RowAction<T>[];
  hideDelete?: boolean;
  hideAdd?: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [operationError, setOperationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [runningRowActionId, setRunningRowActionId] = useState<string | null>(null);

  const blankForm = () => {
    const blank: Record<string, string | boolean> = {};
    fields.forEach((f) => {
      blank[f.key] = f.defaultValue ?? (f.type === "checkbox" ? false : "");
    });
    return blank;
  };

  const startAdd = () => {
    setEditingId(null);
    setFormData(blankForm());
    setOperationError("");
    setShowForm(true);
  };

  const toDateTimeInput = (value: string) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
  };

  const startEdit = (item: T) => {
    setEditingId(item.id);
    const data: Record<string, string | boolean> = {};
    fields.forEach((f) => {
      const v = item[f.key];
      data[f.key] = typeof v === "boolean"
        ? v
        : f.type === "datetime-local"
          ? toDateTimeInput((v as string) ?? "")
          : (v as string) ?? (typeof f.defaultValue === "string" ? f.defaultValue : "");
    });
    setOperationError("");
    setFormData(data);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setOperationError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setOperationError("");
    try {
      const submittedData = { ...formData };
      fields.forEach((field) => {
        if (field.type === "datetime-local") {
          const value = submittedData[field.key];
          submittedData[field.key] = typeof value === "string" && value
            ? new Date(value).toISOString()
            : "";
        }
      });

      if (editingId) {
        await onUpdate(editingId, submittedData as Partial<T>);
      } else {
        const id = `${idPrefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
        await onAdd({ id, ...submittedData } as unknown as T);
      }
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : "Could not save this item.");
    } finally {
      setIsSaving(false);
    }
  };

  const label = (item: T) => columns.map((c) => item[c]).filter(Boolean).join(" — ") || item.id;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-lg text-green-900">{title}</h3>
          {description && <p className="text-stone-500 text-sm mt-0.5">{description}</p>}
        </div>
        {!showForm && !hideAdd && (
          <button
            onClick={startAdd}
            className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2 shrink-0"
          >
            + Add New
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-6 grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">{f.label}</label>
              {f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={Boolean(formData[f.key])}
                  onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.checked }))}
                  className="w-4 h-4"
                />
              ) : f.type === "select" ? (
                <select
                  required={f.required}
                  value={(formData[f.key] as string) ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                >
                  <option value="">Select…</option>
                  {typeof formData[f.key] === "string" &&
                    formData[f.key] !== "" &&
                    !f.options?.some((option) => (typeof option === "string" ? option : option.value) === formData[f.key]) && (
                      <option value={formData[f.key] as string}>{formData[f.key]}</option>
                    )}
                  {f.options?.map((o) => (
                    <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
                      {typeof o === "string" ? o : o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  value={(formData[f.key] as string) ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  required={f.required}
                  rows={3}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {f.type === "color" && (
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test((formData[f.key] as string) || "") ? formData[f.key] as string : "#000000"}
                      onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                      aria-label={`${f.label} color picker`}
                      className="h-10 w-12 rounded border border-stone-300 bg-white p-1"
                    />
                  )}
                  <input
                    type={f.type === "color" ? "text" : f.type === "datetime-local" ? "datetime-local" : "text"}
                    value={(formData[f.key] as string) ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    required={f.required}
                    pattern={f.type === "color" ? "^#[0-9a-fA-F]{6}$" : undefined}
                    title={f.type === "color" ? "Use a 6-digit hex color, such as #EA6A10." : undefined}
                    step={f.type === "datetime-local" ? 60 : undefined}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                  />
                </div>
              )}
            </div>
          ))}
          {operationError && (
            <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {operationError}
            </p>
          )}
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-5 py-2.5">
              {isSaving ? "Saving…" : editingId ? "Save Changes" : "Create"}
            </button>
            <button type="button" onClick={cancel} disabled={isSaving} className="border border-stone-300 hover:bg-stone-100 disabled:opacity-60 text-sm font-semibold rounded-lg px-5 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
        {(!Array.isArray(items) || items.length === 0) && <div className="p-5 text-stone-400 text-sm">No items yet.</div>}
        {(Array.isArray(items) ? items : []).map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-stone-50">
            <span className="text-sm text-stone-700 truncate">{label(item)}</span>
            <div className="flex items-center gap-3 shrink-0">
              {rowActions
                ?.filter((action) => !action.hidden?.(item))
                .map((action) => (
                  <button
                    key={action.label}
                    disabled={Boolean(runningRowActionId) || isSaving || Boolean(deletingId)}
                    onClick={() => {
                      setRunningRowActionId(item.id);
                      setOperationError("");
                      void (async () => {
                        try {
                          await action.onClick(item);
                        } catch (error) {
                          setOperationError(error instanceof Error ? error.message : `Could not ${action.label.toLowerCase()} this item.`);
                        } finally {
                          setRunningRowActionId(null);
                        }
                      })();
                    }}
                    className={`text-xs font-semibold flex items-center gap-1 disabled:opacity-50 ${
                      action.variant === "danger"
                        ? "text-red-600 hover:text-red-700"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}

              <button disabled={Boolean(deletingId) || Boolean(runningRowActionId) || isSaving} onClick={() => startEdit(item)} className="text-xs font-semibold text-green-800 hover:text-green-900 flex items-center gap-1 disabled:opacity-50">
                <Icon name="chevron" className="w-3.5 h-3.5" /> Edit
              </button>
              {!hideDelete && onDelete && <button
                disabled={Boolean(deletingId) || Boolean(runningRowActionId) || isSaving}
                onClick={() => {
                  if (!confirm(`Delete "${label(item)}"? This can't be undone.`)) return;
                  setDeletingId(item.id);
                  setOperationError("");
                  void (async () => {
                    try {
                      await onDelete(item.id);
                    } catch (error) {
                      setOperationError(error instanceof Error ? error.message : "Could not delete this item.");
                    } finally {
                      setDeletingId(null);
                    }
                  })();
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deletingId === item.id ? "Deleting…" : "Delete"}
              </button>}
            </div>
          </div>
        ))}
      </div>
      {operationError && !showForm && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {operationError}
        </p>
      )}
    </div>
  );
}
