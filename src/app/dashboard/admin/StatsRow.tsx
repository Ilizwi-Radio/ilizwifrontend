type Stat = {
  label: string;
  value: number;
  accent: string; // Tailwind classes for the top accent bar
  text: string;   // Tailwind class for the number colour
};

export default function StatsRow({
  presentersCount,
  showsCount,
  eventsCount,
  opportunitiesCount,
  songsCount,
  videosCount,
}: {
  presentersCount: number;
  showsCount: number;
  eventsCount: number;
  opportunitiesCount: number;
  songsCount: number;
  videosCount: number;
}) {
  const stats: Stat[] = [
    { label: "Presenters", value: presentersCount, accent: "bg-green-700", text: "text-green-900" },
    { label: "Shows", value: showsCount, accent: "bg-orange-500", text: "text-orange-600" },
    { label: "Events", value: eventsCount, accent: "bg-amber-500", text: "text-amber-600" },
    { label: "Opportunities", value: opportunitiesCount, accent: "bg-emerald-500", text: "text-emerald-700" },
    { label: "Songs", value: songsCount, accent: "bg-yellow-600", text: "text-yellow-700" },
    { label: "Videos", value: videosCount, accent: "bg-red-600", text: "text-red-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border overflow-hidden">
          <div className={`h-1 ${s.accent}`} />
          <div className="p-5">
            <p className="text-sm text-stone-500">{s.label}</p>
            <h2 className={`text-3xl font-bold ${s.text}`}>{s.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}
