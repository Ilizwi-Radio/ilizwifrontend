import React, { useState, useEffect } from 'react';
import { ActiveTab, Presenter } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { getPresenters } from '@/lib/api';
import {
  Mic,
  Radio,
  Calendar,
  Music,
  User,
  BarChart3,
  Volume2,
  ChevronRight,
  RadioTower,
  Headphones,
  Sliders,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBroadcasting?: boolean;
  showsCount?: number;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isBroadcasting = false,
  showsCount = 0,
  mobileOpen = false,
  setMobileOpen,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const { user } = useAuth();
  const [allPresenters, setAllPresenters] = useState<Presenter[]>([]);
  const [showPresenterDropdown, setShowPresenterDropdown] = useState(false);

  useEffect(() => {
    getPresenters().then(setAllPresenters);
  }, []);

  const navItems = [
    {
      id: 'studio' as ActiveTab,
      label: 'Presenter Studio',
      subtitle: 'Live On-Air & Mic Waves',
      icon: Mic,
      badge: isBroadcasting ? 'LIVE' : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'shows' as ActiveTab,
      label: 'My Shows',
      subtitle: 'Schedule & Slots',
      icon: Calendar,
      badge: showsCount > 0 ? `${showsCount}` : undefined,
      badgeColor: 'bg-emerald-800 text-emerald-200',
    },
    {
      id: 'music' as ActiveTab,
      label: 'Music & Soundboard',
      subtitle: 'Tracks, SFX & Audio Bed',
      icon: Music,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'My Profile',
      subtitle: 'Presenter Bio & Gear',
      icon: User,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Show Analytics',
      subtitle: 'Listeners & Engagement',
      icon: BarChart3,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 ${collapsed ? 'lg:w-20' : 'lg:w-72'} bg-stone-950 border-r border-stone-800 flex flex-col justify-between transition-[width,transform] duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className={`border-b border-stone-800/80 flex items-center justify-between ${collapsed ? 'p-3 lg:justify-center' : 'p-6'}`}>
            <div className="flex items-center gap-3">
              <div className={`shrink-0 rounded-xl bg-gradient-to-br from-emerald-600 to-green-900 flex items-center justify-center shadow-lg shadow-emerald-950 ${collapsed ? 'h-10 w-10' : 'w-10 h-10'}`}>
                <RadioTower className="w-5 h-5 text-emerald-200" />
              </div>
              <div className={collapsed ? 'lg:hidden' : ''}>
                <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                  ILIZWI RADIO <span className="text-emerald-400 font-mono text-xs">R</span>
                </h1>
                <p className="text-[11px] text-stone-400 font-medium">Presenter Broadcast Hub</p>
              </div>
            </div>

            {onToggleCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="hidden lg:inline-flex rounded-lg p-2 text-stone-400 hover:bg-stone-900 hover:text-white"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
              </button>
            )}

            {/* Mobile close button */}
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* On-Air Status Pill */}
          <div className={`pt-5 ${collapsed ? 'px-2 lg:px-3' : 'px-6'}`}>
            <div
              title={collapsed ? (isBroadcasting ? 'Studio live on air' : 'Studio standby') : undefined}
              className={`${collapsed ? 'p-3 lg:justify-center lg:p-2' : 'p-3'} rounded-xl border flex items-center justify-between ${
                isBroadcasting
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isBroadcasting ? 'bg-red-500 animate-ping' : 'bg-stone-600'
                  }`}
                />
                <span className={`text-xs font-mono font-bold uppercase ${collapsed ? 'lg:hidden' : ''}`}>
                  {isBroadcasting ? 'STUDIO LIVE ON AIR' : 'STUDIO STANDBY'}
                </span>
              </div>
              <span className={`text-[10px] font-mono opacity-70 ${collapsed ? 'lg:hidden' : ''}`}>
                {isBroadcasting ? 'STREAMING' : 'READY'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`space-y-1.5 ${collapsed ? 'p-2 lg:p-2' : 'p-4'}`}>
            <p className={`px-3 text-[10px] font-mono uppercase tracking-wider text-stone-300 font-semibold mb-2 ${collapsed ? 'lg:hidden' : ''}`}>
              Studio Navigation
            </p>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={`relative w-full flex items-center justify-between rounded-xl text-left transition group cursor-pointer ${
                    collapsed ? 'px-2 py-2.5 lg:justify-center lg:px-0' : 'px-3.5 py-3'
                  } ${
                    isActive
                      ? 'bg-emerald-900 text-white font-bold shadow-md shadow-emerald-950 border border-emerald-700/50'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900 border border-transparent'
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${collapsed ? 'gap-3 lg:gap-0' : 'gap-3'}`}>
                    <div
                      className={`p-2 rounded-lg transition ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-stone-900 text-stone-400 group-hover:text-stone-200'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                      <div className="text-sm font-semibold truncate flex items-center gap-2">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-stone-300 font-medium truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`${collapsed ? 'lg:absolute lg:right-0.5 lg:top-0.5 lg:px-1 lg:text-[8px]' : ''} text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Presenter Account Info & Switcher */}
        <div className={`border-t border-stone-800/80 bg-stone-950/90 ${collapsed ? 'p-2 lg:flex lg:justify-center' : 'p-4'}`}>
          <div className="relative">
            <button
              onClick={() => setShowPresenterDropdown(!showPresenterDropdown)}
              title={collapsed ? user?.full_name || 'Presenter account' : undefined}
              className={`flex items-center justify-between rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-left transition ${collapsed ? 'w-full p-2.5 lg:w-auto' : 'w-full p-2.5'}`}
            >
              <div className={`flex items-center min-w-0 ${collapsed ? 'gap-2.5 lg:gap-0' : 'gap-2.5'}`}>
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs text-white"
                  style={{
                    // background: `linear-gradient(135deg, ${currentPresenter?.from || '#15803d'}, ${
                    //   currentPresenter?.to || '#0f172a'
                    // })`,
                  }}
                >
                  {user?.full_name?.charAt(0) || 'P'}
                </div>
                <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                  <p className="text-xs font-bold text-white truncate">
                    { user?.full_name}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono truncate">
                    {user?.role ? 'On Duty Presenter' : 'Presenter'}
                  </p>
                </div>
              </div>
              {!collapsed && <ChevronRight className="w-4 h-4 text-stone-500" />}
            </button>

            {/* Switcher Dropdown */}
            {showPresenterDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-stone-900 border border-stone-800 rounded-xl p-2 shadow-2xl space-y-1 z-30">
                <p className="text-[10px] font-mono text-stone-300 font-semibold px-2 py-1 uppercase">
                  Switch Presenter Account
                </p>
                {allPresenters.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      // switchUser(p.id);
                      // setShowPresenterDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs text-left transition ${
                      user?.id === p.id
                        ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
