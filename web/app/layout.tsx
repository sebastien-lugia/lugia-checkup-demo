import type { Metadata } from "next";

import { Footer } from "@/components/Footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "Lugia — Check-up préventif",
  description:
    "En moins de 30 minutes, faites le point sur votre cabinet.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
