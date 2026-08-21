import React from 'react';
import { useAuth } from '@/lib/auth';
import { Menu, Radio, Mic, Headphones } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  isBroadcasting?: boolean;
}

export default function DashboardHeader({
  title,
  subtitle,
  onOpenMobileMenu,
  isBroadcasting = false,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {title}
              </h1>
              {isBroadcasting && (
                <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> ON AIR
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right side Presenter badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-stone-800">
              { user?.full_name || 'Presenter'}
            </span>
            <span className="text-[11px] text-stone-500 font-mono">
              {user?.role || 'Presenter'}
            </span>
          </div>

          <div
            className="w-10 h-10 rounded-xl shadow-xs flex items-center justify-center font-bold text-sm text-white"
            style={{
              background: `linear-gradient(135deg, #15803d '#0f172a)`,
            }}
          >
            {user?.full_name?.charAt(0) || 'P'}
          </div>
        </div>
      </div>
    </header>
  );
}
