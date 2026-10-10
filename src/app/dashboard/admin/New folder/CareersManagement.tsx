import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import { createOpportunity, updateOpportunity, deleteOpportunity } from "@/lib/api";
import { careerFields } from "./adminConfig";
import { visibilityActions } from "./visibility";

export default function CareersManagement({
  opportunities,
  refreshOpportunities,
}: {
  opportunities: any[];
  refreshOpportunities: () => Promise<void>;
}) {
  return (
    <AdminCollectionEditor
      title="Careers & Empowerment"
      items={opportunities}
      fields={careerFields}
      idPrefix="career"
      columns={["title", "category"]}
      rowActions={visibilityActions(updateOpportunity, refreshOpportunities)}
      onAdd={async (item) => { await createOpportunity(item); await refreshOpportunities(); }}
      onUpdate={async (id, patch) => { await updateOpportunity(id, patch); await refreshOpportunities(); }}
      onDelete={async (id) => { await deleteOpportunity(id); await refreshOpportunities(); }}
    />
  );
}
