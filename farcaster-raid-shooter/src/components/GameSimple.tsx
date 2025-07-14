'use client';

import { useEffect, useRef, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface GameSimpleProps {
  className?: string;
}

export default function GameSimple({ className = '' }: GameSimpleProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const { context } = useMiniKit();

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoadingStatus('Setting up game container...');
        
        if (!gameContainerRef.current) return;

        const container = gameContainerRef.current;
        // Set up the game HTML structure with inline styles for guaranteed layout
        container.innerHTML = `
          <div id="left-joystick" class="joystick" style="width:80px;height:80px;position:absolute;left:20px;top:calc(70% - 40px);z-index:10;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);border-radius:50%;"></div>
          <div id="right-joystick" class="joystick" style="width:80px;height:80px;position:absolute;right:20px;top:calc(70% - 40px);z-index:10;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);border-radius:50%;"></div>
          <div id="wrap" style="background:#222;box-shadow:inset 0 0 0 1px #404040, 0 0 0 1px #000;padding:10px;width:800px;height:600px;margin:20px auto;position:relative;">
            <div id="wrap-inner" style="background:#000;width:100%;height:100%;position:relative;overflow:hidden;">
              <canvas id="cbg1" width="800" height="600" style="position:absolute;top:0;left:0;"></canvas>
              <canvas id="cbg2" width="800" height="600" style="position:absolute;top:0;left:0;"></canvas>
              <canvas id="cbg3" width="800" height="600" style="position:absolute;top:0;left:0;"></canvas>
              <canvas id="cbg4" width="800" height="600" style="position:absolute;top:0;left:0;"></canvas>
              <canvas id="cmg" width="800" height="600" style="position:absolute;top:0;left:0;"></canvas>
              <canvas id="cfg" width="800" height="600" style="position:absolute;top:0;left:0;cursor:crosshair;"></canvas>
            </div>
          </div>
        `;

        // Initialize the global game object
        (window as any).$ = {};
        console.log('Initialized global $ object');

        setLoadingStatus('Loading core game scripts...');

        // Load essential scripts only (skip touch-compat.js for now)
        const coreScripts = [
          'jsfxr.js',        // Audio effects
          'util.js',         // Utilities  
          'storage.js',      // Local storage
          'definitions.js',  // Game definitions
          'audio.js',        // Audio system
          'text.js',         // Text rendering
          'hero.js',         // Player
          'enemy.js',        // Enemies
          'bullet.js',       // Bullets
          'explosion.js',    // Explosions
          'powerup.js',      // Power-ups
          'particle.js',     // Particle effects
          'particleemitter.js', // Particle system
          'textpop.js',      // Text popups
          'levelpop.js',     // Level notifications
          'button.js',       // UI buttons
          'game.js'          // Main game logic
        ];

        // Load each script sequentially
        for (let i = 0; i < coreScripts.length; i++) {
          const scriptName = coreScripts[i];
          setLoadingStatus(`Loading ${scriptName} (${i + 1}/${coreScripts.length})...`);
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
        console.log('All scripts loaded, checking $ object:', Object.keys((window as any).$ || {}));

        // Verify required DOM elements exist
        const requiredElements = ['left-joystick', 'right-joystick', 'wrap', 'wrap-inner', 'cbg1', 'cbg2', 'cbg3', 'cbg4', 'cmg', 'cfg'];
        for (const id of requiredElements) {
          const element = document.getElementById(id);
          if (!element) {
            throw new Error(`Required element not found: ${id}`);
          }
        }

        // Initialize the game
        if ((window as any).$ && (window as any).$.init) {
          console.log('Found $.init, initializing game...');
          
          // Call the game initialization
          (window as any).$.init();
          
          // Add body class to trigger CSS animations
          document.body.classList.add('loaded');
          
          setGameLoaded(true);
          setLoadingStatus('Game loaded successfully!');
          console.log('Game initialized successfully!');
        } else {
          const dollarKeys = Object.keys((window as any).$ || {});
          throw new Error(`Game initialization function not found. Available $ properties: ${dollarKeys.join(', ')}`);
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
          <p className="mb-4 text-red-400 text-sm">{gameError}</p>
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
    <div className={`flex items-center justify-center w-full h-full ${className}`}>
      <div ref={gameContainerRef} />
    </div>
  );
} 