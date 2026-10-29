import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/auth";
import { DataStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ilizwiradio.co.za"),
  title: {
    default: "iLizwi Radio | African Music, Culture & Live Radio",
    template: "%s | iLizwi Radio",
  },
  description:
    "Listen live to iLizwi Radio, an online South African radio station celebrating African music, languages, culture, and community.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "/",
    siteName: "iLizwi Radio",
    title: "iLizwi Radio | African Music, Culture & Live Radio",
    description:
      "Listen live to iLizwi Radio, celebrating African music, languages, culture, and community.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1376,
        height: 768,
        alt: "iLizwi Radio — Where Africa Speaks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iLizwi Radio | African Music, Culture & Live Radio",
    description:
      "Listen live to iLizwi Radio, celebrating African music, languages, culture, and community.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/logo-192.jpg",
    apple: "/logo-192.jpg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const stationStructuredData = {
  "@context": "https://schema.org",
  "@type": "RadioStation",
  name: "iLizwi Radio",
  alternateName: "iLizwi Radio — Where Africa Speaks",
  url: "https://www.ilizwiradio.co.za/",
  logo: "https://www.ilizwiradio.co.za/logo-192.jpg",
  image: "https://www.ilizwiradio.co.za/og-image.jpg",
  description:
    "An online South African radio station celebrating African music, languages, culture, and community.",
  areaServed: {
    "@type": "Country",
    name: "South Africa",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-white text-stone-800 ">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(stationStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        <AuthProvider>
          <DataStoreProvider>
            {children}
          </DataStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
