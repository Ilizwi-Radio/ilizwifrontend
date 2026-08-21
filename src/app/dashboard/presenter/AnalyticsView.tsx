import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Radio,
  Headphones,
  Award,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';

export default function AnalyticsView() {
  const stats = [
    { label: 'Weekly Listeners', value: '86,400', change: '+14.2%', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Airtime', value: '42.5 hrs', change: '+3.8 hrs', icon: Clock, color: 'text-sky-600 bg-sky-50' },
    { label: 'Average Retention', value: '48 mins', change: '+6 mins', icon: Headphones, color: 'text-purple-600 bg-purple-50' },
    { label: 'Peak Hour Audience', value: '34,200', change: '23:30 PM', icon: Radio, color: 'text-amber-600 bg-amber-50' },
  ];

  const recentBroadcasts = [
    { show: 'The Midnight City Groove', date: 'Yesterday, 23:00', duration: '3h 02m', peak: '18,420', status: 'Archived' },
    { show: 'Sunset Rhythm Drive', date: '18 Aug, 17:00', duration: '2h 30m', peak: '28,400', status: 'Archived' },
    { show: 'Sunday Acoustic Sessions', date: '17 Aug, 10:00', duration: '2h 00m', peak: '9,350', status: 'Archived' },
    { show: 'The Midnight City Groove', date: '16 Aug, 23:00', duration: '3h 05m', peak: '16,100', status: 'Archived' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-950">Broadcast Analytics & Reach</h2>
            <p className="text-stone-500 text-sm mt-0.5">
              Live listener trends, airtime metrics, and broadcast session archives.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-stone-900">{stat.value}</h3>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3" /> {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-stone-900">Recent Broadcast Log</h3>
        <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-sm">
          <div className="grid grid-cols-12 bg-stone-50 p-3 font-semibold text-stone-600 text-xs uppercase tracking-wider">
            <div className="col-span-5">Show Title</div>
            <div className="col-span-3">Broadcast Date</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2 text-right">Peak Listeners</div>
          </div>

          {recentBroadcasts.map((b, idx) => (
            <div key={idx} className="grid grid-cols-12 p-3.5 items-center hover:bg-stone-50/60 transition">
              <div className="col-span-5 font-bold text-green-950 truncate">{b.show}</div>
              <div className="col-span-3 text-stone-500 text-xs">{b.date}</div>
              <div className="col-span-2 font-mono text-xs text-stone-700">{b.duration}</div>
              <div className="col-span-2 text-right font-mono font-bold text-emerald-700">{b.peak}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
