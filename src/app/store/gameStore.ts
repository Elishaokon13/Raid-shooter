import { create } from 'zustand';
import { GameState, Player, Enemy, Bullet, Powerup } from '../types/game';

interface GameStore extends GameState {
  // Actions
  setPlayer: (player: Player) => void;
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;
  addPowerup: (powerup: Powerup) => void;
  removePowerup: (id: string) => void;
  updateScore: (points: number) => void;
  setLevel: (level: number) => void;
  setGameOver: (isGameOver: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  player: {
    position: { x: 0, y: 0 },
    size: { width: 50, height: 50 },
    velocity: { x: 0, y: 0 },
    health: 100,
    score: 0,
    powerups: [],
  },
  enemies: [],
  bullets: [],
  powerups: [],
  score: 0,
  level: 1,
  isGameOver: false,
  isPaused: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPlayer: (player) => set({ player }),
  
  addEnemy: (enemy) => 
    set((state) => ({ enemies: [...state.enemies, enemy] })),
  
  removeEnemy: (id) =>
    set((state) => ({
      enemies: state.enemies.filter((enemy) => enemy.id !== id),
    })),
  
  addBullet: (bullet) =>
    set((state) => ({ bullets: [...state.bullets, bullet] })),
  
  removeBullet: (id) =>
    set((state) => ({
      bullets: state.bullets.filter((bullet) => bullet.id !== id),
    })),
  
  addPowerup: (powerup) =>
    set((state) => ({ powerups: [...state.powerups, powerup] })),
  
  removePowerup: (id) =>
    set((state) => ({
      powerups: state.powerups.filter((powerup) => powerup.id !== id),
    })),
  
  updateScore: (points) =>
    set((state) => ({ score: state.score + points })),
  
  setLevel: (level) => set({ level }),
  
  setGameOver: (isGameOver) => set({ isGameOver }),
  
  setPaused: (isPaused) => set({ isPaused }),
  
  resetGame: () => set(initialState),
})); 