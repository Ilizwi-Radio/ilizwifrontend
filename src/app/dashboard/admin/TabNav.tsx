import { TABS, TabKey } from "./adminConfig";

export default function TabNav({
  tab,
  setTab,
  showAdminTabs = true,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  showAdminTabs?: boolean;
}) {
  const tabs = TABS.filter((item) =>
    showAdminTabs || (item.key !== "sections" && item.key !== "users")
  );

  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-200 pb-4">
      {tabs.map((t) => (
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
