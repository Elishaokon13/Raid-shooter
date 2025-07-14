'use client';

import { useEffect, useRef, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface GameProps {
  className?: string;
}

export default function Game({ className = '' }: GameProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const { context } = useMiniKit();

  useEffect(() => {
    const loadGame = async () => {
      try {
        // Set up the game container with the required structure
        if (!gameContainerRef.current) return;

        const container = gameContainerRef.current;
        container.innerHTML = `
          <div id="left-joystick" class="joystick"></div>
          <div id="right-joystick" class="joystick"></div>
          <div id="wrap">
            <div id="wrap-inner">
              <canvas id="cbg1"></canvas>
              <canvas id="cbg2"></canvas>
              <canvas id="cbg3"></canvas>
              <canvas id="cbg4"></canvas>
              <canvas id="cmg"></canvas>
              <canvas id="cfg"></canvas>
            </div>
          </div>
        `;

        // Initialize the global game object
        (window as any).$ = {};

        // Load game scripts in the correct order
        const scripts = [
          'touch-compat.js',
          'jsfxr.js',
          'util.js',
          'storage.js',
          'definitions.js',
          'audio.js',
          'text.js',
          'hero.js',
          'enemy.js',
          'bullet.js',
          'explosion.js',
          'powerup.js',
          'particle.js',
          'particleemitter.js',
          'textpop.js',
          'levelpop.js',
          'button.js',
          'game.js'
        ];

        // Load each script sequentially
        for (const scriptName of scripts) {
          await loadScript(`/game/${scriptName}`);
        }

        // Initialize the game
        if ((window as any).$ && (window as any).$.init) {
          (window as any).$.init();
          setGameLoaded(true);
        }

      } catch (error) {
        console.error('Failed to load game:', error);
        setGameError('Failed to load game. Please try again.');
      }
    };

    loadGame();

    // Cleanup on unmount
    return () => {
      if ((window as any).$ && (window as any).$.cleanup) {
        (window as any).$.cleanup();
      }
    };
  }, []);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  if (gameError) {
    return (
      <div className={`flex items-center justify-center h-screen bg-black text-white ${className}`}>
        <div className="text-center">
          <h2 className="text-xl mb-4">Game Error</h2>
          <p>{gameError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Game
          </button>
        </div>
      </div>
    );
  }

  if (!gameLoaded) {
    return (
      <div className={`flex items-center justify-center h-screen bg-black text-white ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading Raid Shooter...</p>
          {context?.user?.username && (
            <p className="mt-2 text-sm text-gray-300">Welcome, @{context.user.username}!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={gameContainerRef}>
      {/* Game content will be injected here */}
    </div>
  );
} 