"use client";

import { useState } from "react";
import Icon from "./Icon";

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "checkbox" | "select" | "color";
  options?: string[];
  placeholder?: string;
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
}: {
  title: string;
  description?: string;
  items: T[];
  fields: FieldConfig[];
  idPrefix: string;
  onAdd: (item: T) => void;
  onUpdate: (id: string, patch: Partial<T>) => void;
  onDelete: (id: string) => void;
  /** which field(s) to show as the row's primary label in the list */
  columns?: string[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});

  const blankForm = () => {
    const blank: Record<string, string | boolean> = {};
    fields.forEach((f) => {
      blank[f.key] = f.type === "checkbox" ? false : "";
    });
    return blank;
  };

  const startAdd = () => {
    setEditingId(null);
    setFormData(blankForm());
    setShowForm(true);
  };

  const startEdit = (item: T) => {
    setEditingId(item.id);
    const data: Record<string, string | boolean> = {};
    fields.forEach((f) => {
      const v = item[f.key];
      data[f.key] = typeof v === "boolean" ? v : (v as string) ?? "";
    });
    setFormData(data);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData as Partial<T>);
    } else {
      const id = `${idPrefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      onAdd({ id, ...formData } as unknown as T);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const label = (item: T) => columns.map((c) => item[c]).filter(Boolean).join(" — ") || item.id;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-lg text-green-900">{title}</h3>
          {description && <p className="text-stone-500 text-sm mt-0.5">{description}</p>}
        </div>
        {!showForm && (
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
                  value={(formData[f.key] as string) ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                >
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  value={(formData[f.key] as string) ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {f.type === "color" && (
                    <span
                      className="w-8 h-8 rounded-md border border-stone-300 shrink-0"
                      style={{ background: (formData[f.key] as string) || "#ccc" }}
                    />
                  )}
                  <input
                    type="text"
                    value={(formData[f.key] as string) ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
                  />
                </div>
              )}
            </div>
          ))}
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg px-5 py-2.5">
              {editingId ? "Save Changes" : "Create"}
            </button>
            <button type="button" onClick={cancel} className="border border-stone-300 hover:bg-stone-100 text-sm font-semibold rounded-lg px-5 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
        {items.length === 0 && <div className="p-5 text-stone-400 text-sm">No items yet.</div>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-stone-50">
            <span className="text-sm text-stone-700 truncate">{label(item)}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => startEdit(item)} className="text-xs font-semibold text-green-800 hover:text-green-900 flex items-center gap-1">
                <Icon name="chevron" className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this item? This can't be undone.")) onDelete(item.id);
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
