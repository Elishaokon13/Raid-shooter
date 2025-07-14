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
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const { context } = useMiniKit();

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoadingStatus('Setting up game container...');
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

        // Clear any existing global game object
        if ((window as any).$) {
          console.warn('Existing $ object found, clearing...');
        }
        
        // Initialize the global game object
        (window as any).$ = {};
        console.log('Initialized global $ object');

        setLoadingStatus('Loading game scripts...');

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
        for (let i = 0; i < scripts.length; i++) {
          const scriptName = scripts[i];
          setLoadingStatus(`Loading ${scriptName} (${i + 1}/${scripts.length})...`);
          console.log(`Loading script: ${scriptName}`);
          
          try {
            await loadScript(`/game/${scriptName}`);
            console.log(`Successfully loaded: ${scriptName}`);
          } catch (error) {
            console.error(`Failed to load script: ${scriptName}`, error);
            throw new Error(`Failed to load ${scriptName}: ${error}`);
          }
        }

        setLoadingStatus('Initializing game...');
        console.log('All scripts loaded, checking $ object:', (window as any).$);

        // Initialize the game
        if ((window as any).$ && (window as any).$.init) {
          console.log('Found $.init, initializing game...');
          (window as any).$.init();
          
          // Add body class to trigger CSS animations
          document.body.classList.add('loaded');
          
          setGameLoaded(true);
          setLoadingStatus('Game loaded successfully!');
          console.log('Game initialized successfully!');
        } else {
          throw new Error('Game initialization function not found. $ object: ' + JSON.stringify(Object.keys((window as any).$ || {})));
        }

      } catch (error) {
        console.error('Failed to load game:', error);
        setGameError(`Failed to load game: ${error instanceof Error ? error.message : String(error)}`);
        setLoadingStatus('Error loading game');
      }
    };

    loadGame();

    // Cleanup on unmount
    return () => {
      if ((window as any).$ && (window as any).$.cleanup) {
        (window as any).$.cleanup();
      }
      // Remove loaded class
      document.body.classList.remove('loaded');
    };
  }, []);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`Script ${src} already loaded`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        console.log(`Script loaded: ${src}`);
        resolve();
      };
      script.onerror = (error) => {
        console.error(`Script error: ${src}`, error);
        reject(new Error(`Failed to load script: ${src}`));
      };
      document.head.appendChild(script);
    });
  };

  if (gameError) {
    return (
      <div className={`flex items-center justify-center h-screen bg-black text-white ${className}`}>
        <div className="text-center max-w-md p-4">
          <h2 className="text-xl mb-4">Game Error</h2>
          <p className="mb-4 text-red-400">{gameError}</p>
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
          <p className="mt-2 text-sm text-gray-400">{loadingStatus}</p>
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