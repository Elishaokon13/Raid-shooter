export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameObject {
  position: Position;
  size: Size;
  velocity: Position;
}

export interface Player extends GameObject {
  health: number;
  score: number;
  powerups: Powerup[];
}

export interface Enemy extends GameObject {
  health: number;
  type: EnemyType;
  points: number;
}

export interface Bullet extends GameObject {
  damage: number;
  owner: 'player' | 'enemy';
}

export interface Powerup extends GameObject {
  type: PowerupType;
  duration?: number;
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  BOSS = 'boss'
}

export enum PowerupType {
  SHIELD = 'shield',
  RAPID_FIRE = 'rapid_fire',
  DOUBLE_DAMAGE = 'double_damage',
  HEALTH = 'health'
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerups: Powerup[];
  score: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
} 