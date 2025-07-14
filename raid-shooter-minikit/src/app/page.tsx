'use client';

import { useEffect, useState } from 'react';
import RaidShooterGame from '@/components/RaidShooterGame';

export default function Home() {
  const [isMiniKitReady, setIsMiniKitReady] = useState(false);

  useEffect(() => {
    // Check if we're in a MiniKit environment
    const checkMiniKit = () => {
      if (typeof window !== 'undefined') {
        // For now, always set to true. In production, check for MiniKit context
        setIsMiniKitReady(true);
      }
    };

    checkMiniKit();
  }, []);

  if (!isMiniKitReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading Raid Shooter...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <RaidShooterGame />
    </main>
  );
}
