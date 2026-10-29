import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming Radio Shows and Events",
  description:
    "See upcoming iLizwi Radio shows, live sessions, and community events celebrating African music and culture.",
  alternates: {
    canonical: "/activities",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "iLizwi Radio",
    title: "Upcoming Radio Shows and Events",
    description:
      "See upcoming iLizwi Radio shows, live sessions, and community events celebrating African music and culture.",
    url: "/activities",
    images: [
      {
        url: "/og-image.jpg",
        width: 1376,
        height: 768,
        alt: "iLizwi Radio — Where Africa Speaks",
      },
    ],
  },
};

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
