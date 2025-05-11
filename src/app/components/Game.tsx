import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    player,
    enemies,
    bullets,
    powerups,
    score,
    level,
    isGameOver,
    isPaused,
  } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Game loop
    let animationFrameId: number;
    const gameLoop = () => {
      if (!isPaused && !isGameOver) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw game objects
        // TODO: Implement drawing logic for player, enemies, bullets, and powerups

        // Request next frame
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, isGameOver]);

  return (
    <div className="relative w-full h-screen bg-black">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="absolute top-4 left-4 text-white">
        <div>Score: {score}</div>
        <div>Level: {level}</div>
      </div>
      {isGameOver && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl">
          Game Over
        </div>
      )}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl">
          Paused
        </div>
      )}
    </div>
  );
} 