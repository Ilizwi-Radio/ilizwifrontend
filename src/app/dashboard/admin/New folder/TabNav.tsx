import { TABS, TabKey } from "./adminConfig";

export default function TabNav({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-200 pb-4">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            tab === t.key ? "bg-green-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
