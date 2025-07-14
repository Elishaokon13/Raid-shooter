# Raid-shooter Codebase Analysis

## Background and Motivation
The user wants to understand the Raid-shooter codebase - a space-themed shoot 'em up game built with HTML5 Canvas and JavaScript. The game features:
- 13 enemy types
- 5 powerups  
- Parallax backgrounds
- Retro sound effects
- Local storage for stats
- Final size: 13,278 bytes

## Key Challenges and Analysis
- Understanding the game architecture and component relationships
- Analyzing the JavaScript modules and their interdependencies
- Documenting the game loop and rendering system
- Understanding the entity system (hero, enemies, bullets, powerups)
- Analyzing the audio system and local storage implementation

## High-level Task Breakdown
- [x] **Task 1:** Analyze main game entry point and initialization
  - Success criteria: Understand game.js structure and startup flow ✅ COMPLETED
- [x] **Task 2:** Examine entity system components (hero, enemies, bullets, powerups)
  - Success criteria: Document entity classes and their relationships ✅ COMPLETED
- [x] **Task 3:** Analyze game mechanics and physics
  - Success criteria: Understand collision detection, movement, and game rules ✅ COMPLETED
- [ ] **Task 4:** Review audio system and effects
  - Success criteria: Document audio.js and jsfxr integration
- [ ] **Task 5:** Examine UI and interaction systems
  - Success criteria: Understand button handling, text rendering, and touch compatibility
- [ ] **Task 6:** Analyze data persistence and storage
  - Success criteria: Document storage.js implementation

## Project Status Board
- [x] Analyze main game architecture ✅ COMPLETED
- [x] Document entity system ✅ COMPLETED
- [x] Review game mechanics ✅ COMPLETED
- [ ] Examine audio system
- [ ] Document UI/interaction systems
- [ ] Review data persistence

## Current Status / Progress Tracking
✅ **Task 1 COMPLETED** - Analyzed main game entry point and initialization

**Key Findings:**
- **Entry Point**: Game initializes via `window.addEventListener('load', $.init)` in game.js
- **Architecture**: Uses a global `$` object as the main namespace containing all game systems
- **Canvas System**: Multi-layered rendering with 6 canvases:
  - `cbg1-cbg4`: Background layers for parallax effects (different sizes for depth)
  - `cmg`: Main game canvas (midground) - 800x600px
  - `cfg`: Foreground overlay canvas
- **Main Game Loop**: `$.loop()` function using `requestAnimationFrame` for 60fps rendering
- **State Management**: Game state system with states: 'menu', 'play', 'pause', 'gameover', 'stats', 'credits'
- **Entity System**: Array-based entity management for enemies, bullets, explosions, powerups, particles, textPops, etc.
- **Input System**: Keyboard (WASD/Arrow keys, F, P, M) and mouse handling with pressed/state tracking
- **Audio System**: Integration with jsfxr for procedural sound effects
- **Storage System**: localStorage wrapper for persistent game data (scores, settings, stats)

**Core Initialization Flow:**
1. `$.init()` → Setup DOM elements, canvases, storage, input handling
2. `$.reset()` → Initialize game state variables and create hero
3. `$.bindEvents()` → Attach keyboard/mouse event handlers  
4. `$.setupStates()` → Define game state functions
5. `$.renderBackground1-4()` → Pre-render static background layers
6. `$.setState('menu')` → Set initial game state
7. `$.loop()` → Start main game loop

---

✅ **Task 2 COMPLETED** - Examined entity system components

**Entity Architecture:**
- **Common Pattern**: All entities follow constructor → update() → render() lifecycle
- **Composition-Based**: Uses object composition rather than inheritance
- **Array Management**: Entities stored in global arrays ($.enemies, $.bullets, etc.)
- **Collision Detection**: Distance-based collision using `$.util.distance()` and `$.util.arcInRect()`
- **Viewport Culling**: Entities track `inView` state to optimize rendering

**Core Entity Types:**

1. **Hero** (player):
   - Position: Center of game world ($.ww/2, $.wh/2)
   - Movement: WASD input with acceleration/deceleration physics
   - Weapon System: Configurable fire rate, spread, bullet count, damage
   - Health: Life value with damage feedback visual effects
   - Collision: Takes damage from enemy contact

2. **Enemy** (13 types):
   - **Behavior-Driven**: Each type has unique behavior function
   - **Spawning**: Spawn from screen edges with different patterns
   - **AI Types**: Straight movement, diagonal, homing, splitters, wanderers, stealthy, etc.
   - **Scaling**: Difficulty increases with level progression
   - **Health Bar**: Visual health indicator when damaged
   - **Death Effects**: Explosions, particles, score popups on destruction

3. **Bullet** (projectiles):
   - **Physics**: Direction-based movement with trail rendering
   - **Damage System**: Configurable damage, piercing capabilities
   - **Collision**: Tracks hit enemies to prevent multi-hit
   - **Visual Effects**: Particle trails and hit effects

4. **Powerup** (5 types):
   - **Types**: Health Pack, Slow Enemies, Fast Shot, Triple Shot, Pierce Shot
   - **Collection**: Proximity-based collection with particle effects
   - **Timers**: Time-limited effects tracked in $.powerupTimers array
   - **Visual**: Text-based UI with colored backgrounds

5. **Explosion** (death effects):
   - **Lifecycle**: Tick-based animation with expanding radius
   - **Rendering**: Stroke circles with particle effects
   - **Audio**: Different sounds for normal vs slow-motion explosions

6. **Particle System**:
   - **ParticleEmitter**: Spawns particles in patterns (circular, directional)
   - **Particle**: Individual physics-based particles with friction
   - **Effects**: Used for bullets, explosions, damage, collection feedback

**Entity Relationships:**
- Hero shoots Bullets → Bullets hit Enemies → Enemies spawn Explosions & Particles
- Enemies drop Powerups → Hero collects Powerups → Powerups modify Hero weapon
- All entities interact through collision detection and shared game state

---

✅ **Task 3 COMPLETED** - Analyzed game mechanics and physics

**Physics System:**
- **Delta Time**: Frame-rate independent physics using `$.dt` (delta time)
- **Movement**: Velocity-based movement with `x += vx * $.dt, y += vy * $.dt`
- **Acceleration**: Hero uses acceleration/deceleration with friction (0.9 multiplier)
- **Friction**: Particles and bullets use friction to slow down over time
- **Bounds**: Entities constrained to world boundaries ($.ww x $.wh = 1600x1200)

**Collision Detection:**
- **Distance-based**: `$.util.distance()` for circle-circle collisions (hero vs enemies, bullets vs enemies)
- **Rectangle collision**: `$.util.rectInRect()` for powerup collection
- **Point-in-rectangle**: `$.util.pointInRect()` for UI and bounds checking
- **Arc-in-rectangle**: `$.util.arcInRect()` for viewport culling optimization
- **Precision**: All collision detection accounts for entity radii and boundaries

**Enemy Spawning & AI:**
- **Spawn System**: Time-based spawning using `Math.floor($.tick) % timeCheck === 0`
- **Spawn Points**: Enemies spawn from 4 screen edges (top, right, bottom, left)
- **Behavior Functions**: Each enemy type has unique behavior() function defining movement patterns
- **AI Types**: Straight line, diagonal, homing, circling, wandering, growing, splitting
- **Slow Motion**: Global `$.slow` flag divides enemy speeds by `$.slowEnemyDivider` (3)

**Level Progression:**
- **Kill Requirements**: Each level needs specific kill count (10 + (level+1) * 7)
- **Enemy Distribution**: Time intervals for spawning each enemy type
- **Difficulty Scaling**: `$.levelDiffOffset` increases enemy life (+0.25), speed (+0.25), value (+5)
- **Dynamic Levels**: After predefined levels, difficulty continues scaling automatically

**Powerup System:**
- **Timer-based**: All powerups last 300 ticks (5 seconds at 60fps)
- **Health Pack**: Gradual health regeneration (+0.001/tick)
- **Slow Enemies**: Divides enemy speeds by 3
- **Fast Shot**: Increases fire rate (5→2) and bullet speed (10→14)
- **Triple Shot**: Changes bullet count (1→3) with spread pattern
- **Pierce Shot**: Enables bullet piercing through multiple enemies
- **Spawn Rate**: 10% chance on enemy death, health pack only spawns when health < 90%

**Game Rules:**
- **Health System**: Hero starts with 1.0 life, loses 0.0075 per enemy contact
- **Scoring**: Points based on enemy values (5-65 points per enemy type)
- **Game Over**: Triggered when hero.life <= 0 with 200-tick death animation
- **Weapon System**: Configurable fire rate, spread, damage, speed, piercing
- **Mouse Aiming**: Hero direction follows mouse position with `Math.atan2(dy, dx)`

**Screen & Camera:**
- **Viewport**: 800x600 visible area in 1600x1200 world
- **Camera Following**: Smooth camera tracking with easing (division by 30)
- **Parallax Scrolling**: 4 background layers move at different speeds
- **Screen Shake**: Rumble system with decay (0.4) for impact feedback

**Physics Constants:**
- **Hero**: acceleration=0.5, vmax=6, friction=0.9, radius=10
- **Bullets**: speed=10-14, friction=0.75, damage=1, size=15
- **Enemies**: Various speeds (0.25-6), radii (5-80), health (1-10)
- **Particles**: friction=0.85, speeds=2-25, viewport culling for performance

## Executor's Feedback or Assistance Requests
Task 3 completed successfully. The game mechanics and physics are well-designed with excellent performance optimizations:

**Key Technical Insights:**
- Delta-time physics ensures frame-rate independence
- Multi-layered collision detection system optimized for different entity types
- Behavior-driven AI provides diverse enemy patterns without complex state machines
- Level progression system with dynamic difficulty scaling
- Powerup system uses timers to temporarily modify game mechanics
- Camera system includes smooth following, parallax, and screen shake

**Game Balance Observations:**
- Health regeneration is gradual (0.001/tick) preventing instant healing
- Powerup spawn rate (10%) provides balanced power distribution
- Enemy difficulty scaling maintains challenging progression
- Physics constants are well-tuned for responsive gameplay

**Next Steps Available:**
- Task 4: Audio system examination
- Task 5: UI/interaction systems documentation
- Task 6: Data persistence review

Ready to proceed with any of these tasks.

## Lessons
- Read the file before trying to edit it
- Include info useful for debugging in program output
- If vulnerabilities appear in terminal, run npm audit before proceeding
- Always ask before using -force git command
- Entity systems can be implemented effectively using composition and arrays rather than complex inheritance hierarchies
- Viewport culling with `inView` flags significantly improves performance for off-screen entities
- Delta-time based physics ensures consistent gameplay across different frame rates
- Behavior functions provide flexible AI patterns without complex state machines
- Time-based spawning with modulo operations creates predictable enemy waves
- Collision detection optimization is crucial for performance in entity-heavy games 