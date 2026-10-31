import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/auth";
import { DataStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ilizwiradio.co.za"),

  title: {
    default: "iLIZWI Radio",
    template: "%s | iLIZWI Radio",
  },

  description:
    "Listen live to iLIZWI Radio. Discover African music, culture, storytelling, language learning, and AI-powered broadcasting from anywhere in the world.",

  keywords: [
    "iLIZWI Radio",
    "African Radio",
    "Online Radio",
    "South Africa Radio",
    "Zulu Radio",
    "Live Radio Streaming",
    "African Music",
    "African Culture",
    "Language Learning",
  ],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "iLIZWI Radio",
    description:
      "Where Africa Speaks & The World Learns.",
    url: "https://www.ilizwiradio.co.za",
    siteName: "iLIZWI Radio",
    type: "website",
    locale: "en_ZA",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "iLIZWI Radio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "iLIZWI Radio",
    description:
      "African music, storytelling, language learning and AI-powered broadcasting.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://www.ilizwiradio.co.za",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-white text-stone-800">
        <AuthProvider>
          <DataStoreProvider>
            {children}
          </DataStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
