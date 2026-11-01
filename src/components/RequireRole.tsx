"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth";

export default function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const hasRoleAccess = user.role === role || (role === "presenter" && user.role === "admin");
    if (!hasRoleAccess) {
      router.replace(["admin", "presenter", "moderator"].includes(user.role) ? `/dashboard/${user.role}` : "/");
    }
  }, [loading, user, role, router]);

  const hasRoleAccess = user?.role === role || (role === "presenter" && user?.role === "admin");
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stone-500">
        Checking access…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-stone-700">Sign in to access this dashboard.</p>
        <a href="/auth" className="rounded-lg bg-green-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
          Sign in
        </a>
      </div>
    );
  }

  if (!hasRoleAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stone-500">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
