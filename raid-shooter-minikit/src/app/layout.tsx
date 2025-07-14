import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raid Shooter",
  description: "A fast-paced space shooter game with 13 enemy types, 5 powerups, and retro graphics",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OnchainKitProvider
          chain={base}
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        >
          {children}
        </OnchainKitProvider>
      </body>
    </html>
  );
}
