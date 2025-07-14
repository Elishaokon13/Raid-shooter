'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAddFrame, useNotification, usePrimaryButton } from '@coinbase/onchainkit';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import { GameState, GameStats } from '@/types/game';

export default function RaidShooterGame() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    kills: 0,
    bulletsFired: 0,
    powerupsCollected: 0,
    time: 0,
    bestScore: 0,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autofire, setAutofire] = useState(false);

  const gameRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // MiniKit hooks
  const { addFrame } = useAddFrame();
  const { showNotification } = useNotification();
  const { setPrimaryButton } = usePrimaryButton();

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    if (gameState === 'play' && !isPaused) {
      // Update game logic here
      setStats(prev => ({
        ...prev,
        time: prev.time + deltaTime / 1000,
      }));
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, isPaused]);

  // Initialize game
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // MiniKit integration
  useEffect(() => {
    if (gameState === 'play') {
      setPrimaryButton({
        text: isPaused ? 'Resume' : 'Pause',
        loading: false,
        disabled: false,
      });
    } else if (gameState === 'menu') {
      setPrimaryButton({
        text: 'Play Game',
        loading: false,
        disabled: false,
      });
    }
  }, [gameState, isPaused, setPrimaryButton]);

  const handleGameStart = () => {
    setGameState('play');
    setIsPaused(false);
    setStats(prev => ({ ...prev, score: 0, level: 1, kills: 0, bulletsFired: 0, powerupsCollected: 0, time: 0 }));
    showNotification('Game started! Good luck!');
  };

  const handleGamePause = () => {
    setIsPaused(!isPaused);
  };

  const handleGameOver = () => {
    setGameState('gameover');
    if (stats.score > stats.bestScore) {
      setStats(prev => ({ ...prev, bestScore: stats.score }));
      showNotification(`New high score: ${stats.score}!`);
    }
  };

  const handleRestart = () => {
    setGameState('menu');
  };

  return (
    <div 
      ref={gameRef}
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      <GameCanvas 
        gameState={gameState}
        stats={stats}
        isPaused={isPaused}
        isMuted={isMuted}
        autofire={autofire}
        onGameStart={handleGameStart}
        onGamePause={handleGamePause}
        onGameOver={handleGameOver}
        onStatsUpdate={setStats}
      />
      
      <GameUI 
        gameState={gameState}
        stats={stats}
        isPaused={isPaused}
        isMuted={isMuted}
        autofire={autofire}
        onGameStart={handleGameStart}
        onGamePause={handleGamePause}
        onRestart={handleRestart}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onAutofireToggle={() => setAutofire(!autofire)}
      />
    </div>
  );
} 