"use client";

import RequireRole from "@/components/RequireRole";
import App from "../admin/App";

export default function ModeratorDashboardPage() {
  return (
    <RequireRole role="moderator">
      <App moderatorMode />
    </RequireRole>
  );
}
