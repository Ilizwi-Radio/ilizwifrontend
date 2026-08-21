import Icon from "./Icon";

export default function BadgePromo() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div
        className="rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-white"
        style={{ background: "linear-gradient(90deg,#7a3a17,#16522f)" }}
      >
        <div className="flex items-center gap-4">
          <span className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
            <Icon name="award" className="w-5 h-5 text-green-900" />
          </span>
          <div>
            <div className="font-bold">Earn Cultural Badges</div>
            <div className="text-white/70 text-sm">Complete lessons, unlock achievements, share your journey.</div>
          </div>
        </div>
        <button className="btn-pill bg-yellow-400 hover:bg-yellow-300 text-green-900 font-semibold px-5 py-2.5">
          Sign Up to Track Progress
        </button>
      </div>
    </section>
  );
}
