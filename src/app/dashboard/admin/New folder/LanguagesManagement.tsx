import AdminCollectionEditor from "@/components/AdminCollectionEditor";
import { createCourse, updateCourse, deleteCourse } from "@/lib/api";
import { languageFields } from "./adminConfig";
import { visibilityActions } from "./visibility";

export default function LanguagesManagement({ courses, refreshCourses }: { courses: any[]; refreshCourses: () => Promise<void> }) {
  return (
    <AdminCollectionEditor
      title="Language Hub"
      description="Cards shown on the Learn African Languages section."
      items={courses}
      fields={languageFields}
      idPrefix="lang"
      columns={["name", "region"]}
      rowActions={visibilityActions(updateCourse, refreshCourses)}
      onAdd={async (item) => { await createCourse(item); await refreshCourses(); }}
      onUpdate={async (id, patch) => { await updateCourse(id, patch); await refreshCourses(); }}
      onDelete={async (id) => { await deleteCourse(id); await refreshCourses(); }}
    />
  );
}
