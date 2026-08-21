import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-white pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <div>
          <a href="#top" className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
              <Icon name="radio" />
            </span>
            <span className="leading-tight">
              <span className="block font-extrabold text-lg">
                iLIZWI <span className="text-orange-400">RADIO</span>
              </span>
              <span className="block text-[10px] tracking-[0.2em] text-white/60 -mt-0.5">WHERE AFRICA SPEAKS</span>
            </span>
          </a>
          <p className="text-white/60 text-sm mb-4">
            A modern African digital media platform celebrating culture, language, music and storytelling — powered by
            AI and community.
          </p>
          <div className="flex gap-3">
            {["f", "𝕏", "ig", "yt"].map((s) => (
              <a key={s} href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold">
                {s}
              </a>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="mail" /> hello@ilizwiradio.africa
            </div>
            <div className="flex items-center gap-2">
              <Icon name="pin" /> Pan-African • Broadcasting Worldwide
            </div>
          </div>
        </div>

        <FooterCol
          title="PLATFORM"
          links={[
            ["Live Radio", "#live"],
            ["Music Library", "#music"],
            ["Video Hub", "#videos"],
            ["Languages", "#languages"],
            ["Events", "#events"],
            ["Podcasts", "#"],
          ]}
        />
        <FooterCol
          title="COMMUNITY"
          links={[
            ["Become a Presenter", "#"],
            ["Artist Submission", "#"],
            ["Careers", "#careers"],
            ["Volunteer", "#"],
            ["Ambassadors", "#"],
            ["Support", "#"],
          ]}
        />
        <FooterCol
          title="ABOUT"
          links={[
            ["Our Story", "#"],
            ["Mission", "#"],
            ["Press", "#"],
            ["Partners", "#"],
            ["Privacy", "#"],
            ["Terms", "#"],
          ]}
        />
      </div>
      <div className="border-t border-white/10 pt-5 max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-2 text-white/50 text-xs">
        <span>© 2026 iLizwi Radio. All rights reserved. Made with ❤ across Africa.</span>
        <span className="italic text-yellow-400/90">&quot;Where Africa Speaks and the World Learns&quot;</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="font-bold text-yellow-400 text-sm tracking-wide mb-4">{title}</div>
      <ul className="space-y-2.5 text-white/70 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="hover:text-white">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
