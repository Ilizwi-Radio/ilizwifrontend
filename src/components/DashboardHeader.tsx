"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { useAuth } from "@/lib/auth";

export default function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="bg-nav-gradient text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shrink-0">
            <Icon name="radio" className="w-4 h-4 text-white" />
          </span>
          <div>
            <div className="font-bold leading-tight">{title}</div>
            <div className="text-white/60 text-xs leading-tight">{subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-white/80">Signed in as {user?.full_name}</span>
          <Link href="/" className="text-sm bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 font-semibold">
            View Site
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm bg-orange-500 hover:bg-orange-600 rounded-full px-4 py-2 font-semibold"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
