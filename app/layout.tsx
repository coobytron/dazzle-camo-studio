import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dazzle Camo Studio",
  description:
    "A dynamic, period-constrained WWI dazzle camouflage generator with linked 2D and 3D WebGL studies.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
