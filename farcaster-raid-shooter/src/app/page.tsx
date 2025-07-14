'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import GameSimple from '@/components/GameSimple';

export default function HomePage() {
  const { context } = useMiniKit();

  useEffect(() => {
    // Signal that the mini app is ready
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Game container - keeping original working structure */}
      <div className="flex items-center justify-center min-h-screen">
        <GameSimple className="w-full max-w-5xl" />
      </div>
    </div>
  );
}
