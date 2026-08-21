import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/auth";
import { DataStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "iLizwi Radio — Where Africa Speaks",
  description:
    "A digital media platform celebrating African culture through music, storytelling, and AI-powered broadcasting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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