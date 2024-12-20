import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sovdvote",
  description: "Give your vote | SOVDWAER",
  icons: {
    icon: "/images/SOVDWAER_128.png",
    apple: "/images/SOVDWAER_128.png",
    shortcut: "/images/SOVDWAER_128.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
