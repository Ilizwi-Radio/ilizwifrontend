import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/auth";
import { DataStoreProvider } from "@/lib/store";
import CookieNotice from "@/components/CookieNotice";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ilizwiradio.co.za"),

  title: {
    default:
      "iLIZWI Radio | African Music, Culture & Live Streaming Radio",
    template: "%s | iLIZWI Radio",
  },

  description:
    "Listen live to iLIZWI Radio and discover African music, storytelling, culture, language learning, and AI-powered broadcasting from South Africa to the world.",

  keywords: [
    "iLIZWI Radio",
    "African Radio",
    "Online Radio",
    "South African Radio",
    "Live Radio Streaming",
    "African Music",
    "African Culture",
    "Zulu Radio",
    "Language Learning",
    "Internet Radio",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://www.ilizwiradio.co.za",
  },

  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://www.ilizwiradio.co.za",
    siteName: "iLIZWI Radio",
    title:
      "iLIZWI Radio | African Music, Culture & Live Streaming Radio",
    description:
      "Listen live to African music, storytelling, language learning, culture and AI-powered broadcasting from anywhere in the world.",

    images: [
      {
        url: "https://www.ilizwiradio.co.za/og-image-v3.webp",
        width: 1200,
        height: 630,
        alt: "iLIZWI Radio - Where Africa Speaks & The World Learns",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "iLIZWI Radio | African Music, Culture & Live Streaming Radio",
    description:
      "Listen live to African music, storytelling, language learning and AI-powered broadcasting.",

    creator: "@ilizwiradio",
    site: "@ilizwiradio",

    images: [
      "https://www.ilizwiradio.co.za/og-image-v3.webp",
    ],
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],

  },

  manifest: "/site.webmanifest",

  other: {
    "theme-color": "#046A38",
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
        <CookieNotice />
           <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RadioStation",
              name: "iLIZWI Radio",
              url: "https://www.ilizwiradio.co.za",
              logo: "https://www.ilizwiradio.co.za/logo.png",
              image: "https://www.ilizwiradio.co.za/og-image-v3.webp",
              description:
                "African music, storytelling, culture, language learning and AI-powered broadcasting.",
              sameAs: [
                "https://www.facebook.com/ilizwiradio",
                "https://x.com/ilizwiradio",
                "https://www.instagram.com/ilizwiradio"
              ]
            }),
          }}
        />
      </body>
    </html>
  );
}
