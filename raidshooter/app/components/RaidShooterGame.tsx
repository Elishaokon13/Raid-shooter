'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import useAudio from '../hooks/useAudio';

interface GameStats {
  score: number;
  level: number;
  kills: number;
  time: number;
  bestScore: number;
}

interface RaidShooterGameProps {
  gameState: 'menu' | 'play' | 'gameover';
  gameStats: GameStats;
  onGameStateChange: (state: 'menu' | 'play' | 'gameover') => void;
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (finalStats: GameStats) => void;
}

interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Hero extends Entity {
  life: number;
  direction: number;
}

interface Enemy extends Entity {
  value: number;
  hue: number;
}

interface Bullet extends Entity {
  damage: number;
}

export default function RaidShooterGame({
  gameState,
  gameStats,
  onGameStateChange,
  onStatsUpdate,
  onGameOver,
}: RaidShooterGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const keysRef = useRef({
    w: false, a: false, s: false, d: false,
    up: false, left: false, down: false, right: false,
    m: false
  });

  // Audio system
  const { playSound, toggleMute, isMuted } = useAudio();

  // Game entities
  const [hero, setHero] = useState<Hero>({
    id: 'hero',
    x: 200,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 10,
    color: '#ffffff',
    life: 1,
    direction: 0,
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [particles, setParticles] = useState<Entity[]>([]);

  // Game configuration
  const config = {
    canvas: { width: 400, height: 600 },
    hero: { speed: 4, fireRate: 200 },
    enemy: { spawnRate: 1000, speed: 2 },
    bullet: { speed: 8 },
  };

  const lastFire = useRef<number>(0);
  const lastEnemySpawn = useRef<number>(0);
  const gameTime = useRef<number>(0);

  // Utility functions
  const distance = (a: Entity, b: Entity) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Create enemy
  const createEnemy = useCallback((): Enemy => {
    const canvas = canvasRef.current;
    if (!canvas) return { id: '', x: 0, y: 0, vx: 0, vy: 0, radius: 0, color: '', value: 0, hue: 0 };

    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    
    switch (side) {
      case 0: // top
        x = Math.random() * canvas.width;
        y = -20;
        break;
      case 1: // right
        x = canvas.width + 20;
        y = Math.random() * canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + 20;
        break;
      case 3: // left
        x = -20;
        y = Math.random() * canvas.height;
        break;
    }

    const hue = Math.random() * 360;
    return {
      id: generateId(),
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 5 + Math.random() * 15,
      color: `hsl(${hue}, 100%, 50%)`,
      value: Math.floor(5 + Math.random() * 15),
      hue,
    };
  }, []);

  // Create bullet
  const createBullet = useCallback((fromX: number, fromY: number, direction: number): Bullet => {
    return {
      id: generateId(),
      x: fromX,
      y: fromY,
      vx: Math.cos(direction) * config.bullet.speed,
      vy: Math.sin(direction) * config.bullet.speed,
      radius: 3,
      color: '#ffff00',
      damage: 1,
    };
  }, []);

  // Create particle explosion
  const createParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Entity[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      newParticles.push({
        id: generateId(),
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        radius: 2 + Math.random() * 3,
        color,
      });
    }
    return newParticles;
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState !== 'play') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    gameTime.current += deltaTime;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 83) % canvas.width;
      const y = (i * 97 + gameTime.current * 0.1) % canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }

    // Update hero
    setHero(prev => {
      const newHero = { ...prev };
      
      // Movement
      if (keysRef.current.w || keysRef.current.up) newHero.vy = Math.max(newHero.vy - 0.5, -config.hero.speed);
      if (keysRef.current.s || keysRef.current.down) newHero.vy = Math.min(newHero.vy + 0.5, config.hero.speed);
      if (keysRef.current.a || keysRef.current.left) newHero.vx = Math.max(newHero.vx - 0.5, -config.hero.speed);
      if (keysRef.current.d || keysRef.current.right) newHero.vx = Math.min(newHero.vx + 0.5, config.hero.speed);

      // Friction
      newHero.vx *= 0.9;
      newHero.vy *= 0.9;

      // Update position
      newHero.x += newHero.vx;
      newHero.y += newHero.vy;

      // Bounds
      newHero.x = Math.max(newHero.radius, Math.min(canvas.width - newHero.radius, newHero.x));
      newHero.y = Math.max(newHero.radius, Math.min(canvas.height - newHero.radius, newHero.y));

      // Update direction to mouse
      newHero.direction = Math.atan2(mouseRef.current.y - newHero.y, mouseRef.current.x - newHero.x);

      return newHero;
    });

    // Fire bullets
    if (mouseRef.current.down && currentTime - lastFire.current > config.hero.fireRate) {
      setBullets(prev => [...prev, createBullet(hero.x, hero.y, hero.direction)]);
      lastFire.current = currentTime;
      playSound('shoot');
    }

    // Spawn enemies
    if (currentTime - lastEnemySpawn.current > config.enemy.spawnRate) {
      setEnemies(prev => [...prev, createEnemy()]);
      lastEnemySpawn.current = currentTime;
    }

    // Update bullets
    setBullets(prev => prev.filter(bullet => {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      return bullet.x > -50 && bullet.x < canvas.width + 50 && bullet.y > -50 && bullet.y < canvas.height + 50;
    }));

    // Update enemies
    setEnemies(prev => prev.map(enemy => {
      // Move towards hero
      const dx = hero.x - enemy.x;
      const dy = hero.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        enemy.vx = (dx / dist) * config.enemy.speed;
        enemy.vy = (dy / dist) * config.enemy.speed;
      }
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
      return enemy;
    }));

    // Collision detection: bullets vs enemies
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      setEnemies(prevEnemies => {
        const remainingEnemies = [...prevEnemies];
        
        for (let i = remainingBullets.length - 1; i >= 0; i--) {
          for (let j = remainingEnemies.length - 1; j >= 0; j--) {
            if (distance(remainingBullets[i], remainingEnemies[j]) < remainingBullets[i].radius + remainingEnemies[j].radius) {
              // Audio feedback
              playSound('hit');
              playSound('explosion');
              
              // Create explosion particles
              setParticles(prev => [...prev, ...createParticles(remainingEnemies[j].x, remainingEnemies[j].y, remainingEnemies[j].color)]);
              
              // Update stats
              onStatsUpdate(prevStats => ({
                ...prevStats,
                score: prevStats.score + remainingEnemies[j].value,
                kills: prevStats.kills + 1,
                time: gameTime.current / 1000,
              }));
              
              // Remove bullet and enemy
              remainingBullets.splice(i, 1);
              remainingEnemies.splice(j, 1);
              break;
            }
          }
        }
        
        return remainingEnemies;
      });
      return remainingBullets;
    });

    // Collision detection: hero vs enemies
    enemies.forEach(enemy => {
      if (distance(hero, enemy) < hero.radius + enemy.radius) {
        setHero(prev => {
          const newLife = Math.max(0, prev.life - 0.01);
          if (newLife > 0) {
            playSound('takingDamage');
          } else if (prev.life > 0) {
            // Hero just died
            playSound('death');
            onGameOver({
              ...gameStats,
              score: gameStats.score,
              time: gameTime.current / 1000,
            });
          }
          return { ...prev, life: newLife };
        });
      }
    });

    // Update particles
    setParticles(prev => prev.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.radius *= 0.98;
      return particle.radius > 0.5;
    }));

    // Render everything
    // Hero
    ctx.fillStyle = hero.color;
    ctx.beginPath();
    ctx.arc(hero.x, hero.y, hero.radius, 0, Math.PI * 2);
    ctx.fill();

    // Hero direction indicator
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hero.x, hero.y);
    ctx.lineTo(hero.x + Math.cos(hero.direction) * hero.radius * 2, hero.y + Math.sin(hero.direction) * hero.radius * 2);
    ctx.stroke();

    // Enemies
    enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bullets
    bullets.forEach(bullet => {
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${gameStats.score}`, 10, 25);
    ctx.fillText(`Kills: ${gameStats.kills}`, 10, 45);
    ctx.fillText(`Time: ${Math.floor(gameStats.time)}s`, 10, 65);

    // Health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, canvas.height - 30, 100, 10);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(10, canvas.height - 30, 100 * hero.life, 10);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, hero, enemies, bullets, particles, gameStats, createBullet, createEnemy, createParticles, onStatsUpdate, onGameOver]);

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Input handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key as keyof typeof keysRef.current] = true;
      }
      
      // Handle mute toggle
      if (key === 'm') {
        toggleMute();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key as keyof typeof keysRef.current] = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseDown = () => {
      mouseRef.current.down = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.down = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
        mouseRef.current.down = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      mouseRef.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  if (gameState === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-4">RAID SHOOTER</h1>
        <p className="text-lg mb-8">Survive the enemy waves!</p>
        <div className="text-center space-y-2">
          <p>Best Score: {gameStats.bestScore.toLocaleString()}</p>
          <div className="text-sm text-gray-400 mt-4">
            <p>Move: WASD or Arrow Keys</p>
            <p>Aim/Fire: Mouse/Touch</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h2 className="text-3xl font-bold text-red-500 mb-4">GAME OVER</h2>
        <div className="text-center space-y-2">
          <p>Final Score: {gameStats.score.toLocaleString()}</p>
          <p>Enemies Killed: {gameStats.kills}</p>
          <p>Time Survived: {Math.floor(gameStats.time)}s</p>
          {gameStats.score > gameStats.bestScore && (
            <p className="text-yellow-400 font-bold">NEW HIGH SCORE!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={config.canvas.width}
      height={config.canvas.height}
      className="border border-gray-600 mx-auto"
      style={{ touchAction: 'none' }}
    />
  );
} 