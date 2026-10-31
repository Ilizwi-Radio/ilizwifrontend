import Icon from "./Icon";

const socialLinks = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@ilizwiradio",
    icon: (
      <path
        fill="currentColor"
        d="M19.6 7.2a7.4 7.4 0 0 1-4.4-1.5v8.1a6.1 6.1 0 1 1-5.3-6.1v3.4a2.8 2.8 0 1 0 2 2.7V2h3.4a4.2 4.2 0 0 0 4.3 3.8v1.4Z"
      />
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@ilizwiradio",
    icon: (
      <>
        <path
          fill="currentColor"
          d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"
        />
        <path fill="#052e16" d="m9.6 15.6 6.2-3.6-6.2-3.6v7.2Z" />
      </>
    ),
  },
  {
    name: "WhatsApp Channel",
    href: null,
    icon: (
      <>
        <path
          fill="currentColor"
          d="M12 2a9.8 9.8 0 0 0-8.4 14.8L2.3 22l5.4-1.4A9.9 9.9 0 1 0 12 2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 19.8Z"
        />
        <path
          fill="currentColor"
          d="M16.4 13.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.8c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.5l.4-.4.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3a2.5 2.5 0 0 0-.8 1.8c0 1.1.8 2.2.9 2.4.1.2 1.6 2.5 3.9 3.5.5.2.8.3 1.1.4.5.2.9.1 1.2.1.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z"
        />
      </>
    ),
  },
];

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
            A modern African digital media platform celebrating culture, language, music and storytelling - powered by
            AI and community.
          </p>
          <div className="flex gap-3">
            {socialLinks.map(({ name, href, icon }) => (
              href ? (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} - iLizwi Radio`}
                  title={`${name} @ilizwiradio`}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                    {icon}
                  </svg>
                </a>
              ) : (
                <span
                  key={name}
                  aria-label={`${name} link coming soon`}
                  aria-disabled="true"
                  title="WhatsApp channel link coming soon"
                  className="w-9 h-9 rounded-full bg-white/5 text-white/40 flex items-center justify-center cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                    {icon}
                  </svg>
                </span>
              )
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="mail" /> Ilizwiradio@gmail.com
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
