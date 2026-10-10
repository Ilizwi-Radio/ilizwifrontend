import { RowAction } from "@/components/AdminCollectionEditor";

// An item is visible unless it has been explicitly hidden, so existing rows
// (which have no is_visible value yet) keep showing on the public site.
export const isVisible = (item: any) => item?.is_visible !== false;

// Adds Hide / Show buttons to a table's rows. Only one of the two shows per row.
export function visibilityActions(
  update: (id: any, patch: any) => Promise<any>,
  refresh: () => Promise<void>
): RowAction<any>[] {
  return [
    {
      label: "Hide",
      onClick: async (item) => { await update(item.id, { is_visible: false }); await refresh(); },
      hidden: (item) => !isVisible(item),
    },
    {
      label: "Show",
      onClick: async (item) => { await update(item.id, { is_visible: true }); await refresh(); },
      hidden: (item) => isVisible(item),
    },
  ];
}
