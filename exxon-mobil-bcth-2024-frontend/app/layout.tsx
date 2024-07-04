import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const google_font = IBM_Plex_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Exxon AI by Exxy <3",
  description: "Exxon Assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={google_font.className}>{children}</body>
    </html>
  );
}
