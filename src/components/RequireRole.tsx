"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth";

export default function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (loading) return;
    if (!user) {
      console.log("NO USER FOUND");
      return;
    }
    if (user.role !== role) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [loading, user, role, router]);

  if (loading || !user || user.role !== role) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stone-500">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
