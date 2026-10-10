"use client";

import RequireRole from "@/components/RequireRole";
import App from "./App";

export default function AdminDashboardPage() {
  return (
    <RequireRole role="admin">
      <App />
    </RequireRole>
  );
}
