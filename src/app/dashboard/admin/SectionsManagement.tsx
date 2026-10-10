import { HOMEPAGE_SECTIONS } from "./adminConfig";

export default function SectionsManagement({
  settings,
  onToggle,
}: {
  settings: Record<string, boolean>;
  onToggle: (key: string, visible: boolean) => Promise<void>;
}) {
  return (
    <div>
      <h3 className="font-bold text-lg text-green-900 mb-1">Homepage Sections</h3>
      <p className="text-stone-500 text-sm mb-5">
        Turn a whole section off to remove it from the public homepage. Hide single items from each content tab.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {HOMEPAGE_SECTIONS.map((s) => {
          const on = settings[s.key] !== false; // missing = visible
          return (
            <div
              key={s.key}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                on ? "bg-white border-stone-200" : "bg-stone-50 border-stone-200"
              }`}
            >
              <div>
                <p className={`font-semibold ${on ? "text-green-900" : "text-stone-400"}`}>{s.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{s.description}</p>
              </div>

              <button
                role="switch"
                aria-checked={on}
                onClick={() =>  onToggle(s.key, !on)} 
                className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
                  on ? "bg-green-700" : "bg-stone-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    on ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
