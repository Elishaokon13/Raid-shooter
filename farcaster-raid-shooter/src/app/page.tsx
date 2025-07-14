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
      {/* Header with social context */}
      <div className="bg-gray-900 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">🚀 Raid Shooter</h1>
        {context?.user?.username && (
          <p className="text-sm text-gray-300 mt-1">
            Playing as @{context.user.username}
          </p>
        )}
      </div>

      {/* Game container */}
      <div className="flex items-center justify-center">
        <GameSimple className="w-full max-w-5xl" />
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-4 text-center text-sm">
        <p>WASD/Arrows: Move | Mouse: Aim/Fire | F: Autofire | P: Pause | M: Mute</p>
      </div>
    </div>
  );
}
