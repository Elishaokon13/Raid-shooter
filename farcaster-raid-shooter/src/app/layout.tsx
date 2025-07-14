import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raid Shooter - Farcaster Miniapp",
  description: "Space-themed shoot 'em up game on Farcaster",
  // Frame specification
  openGraph: {
    title: "Raid Shooter - Farcaster Miniapp",
    description: "Space-themed shoot 'em up game on Farcaster",
    images: [
      {
        url: "https://your-domain.com/og-image.png", // TODO: Update with actual domain
        width: 1200,
        height: 630,
        alt: "Raid Shooter Game",
      },
    ],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://your-domain.com/og-image.png", // TODO: Update with actual domain
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:button:1": "Play Game",
    "fc:frame:post_url": "https://your-domain.com", // TODO: Update with actual domain
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
      </body>
    </html>
  );
}
