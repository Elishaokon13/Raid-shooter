export type GameState = 'menu' | 'play' | 'pause' | 'gameover' | 'stats' | 'credits';

export interface GameStats {
  score: number;
  level: number;
  kills: number;
  bulletsFired: number;
  powerupsCollected: number;
  time: number;
  bestScore: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  lifeMax: number;
  inView: boolean;
}

export interface Hero extends Entity {
  direction: number;
  weapon: {
    fireRate: number;
    fireRateTick: number;
    spread: number;
    count: number;
    bullet: {
      size: number;
      damage: number;
      speed: number;
      piercing: boolean;
    };
  };
  takingDamage: boolean;
}

export interface Enemy extends Entity {
  hue: number;
  saturation: number;
  lightness: number;
  value: number;
  speed: number;
  hitFlag: number;
  behavior: () => void;
  death: () => void;
  type: number;
}

export interface Bullet extends Entity {
  direction: number;
  damage: number;
  speed: number;
  piercing: boolean;
  size: number;
  hitEnemies: string[];
}

export interface Powerup extends Entity {
  type: number;
  title: string;
  hue: number;
  saturation: number;
  lightness: number;
  tick: number;
  tickMax: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  tick: number;
  tickMax: number;
  hue: number;
  saturation: number;
  inView: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  friction: number;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  tick: number;
  tickMax: number;
  inView: boolean;
}

export interface ParticleEmitter {
  id: string;
  x: number;
  y: number;
  particles: Particle[];
  emitting: boolean;
}

export interface TextPop {
  id: string;
  x: number;
  y: number;
  value: number;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  vy: number;
}

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
    worldWidth: number;
    worldHeight: number;
  };
  physics: {
    friction: number;
    heroAcceleration: number;
    heroMaxSpeed: number;
    bulletSpeed: number;
    bulletFriction: number;
  };
  gameplay: {
    enemySpawnRate: number;
    powerupDropRate: number;
    levelKillsBase: number;
    levelKillsIncrement: number;
  };
} 