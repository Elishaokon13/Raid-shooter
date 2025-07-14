'use client';

import { useRef, useCallback, useEffect } from 'react';

// Import JSFXR
let jsfxr: any;
if (typeof window !== 'undefined') {
  jsfxr = require('jsfxr');
}

// Audio definitions from the original game
const audioDefinitions = {
  'shoot': {
    count: 10,
    params: [
      [2,,0.2,,0.1753,0.64,,-0.5261,,,,,,0.5522,-0.564,,,,1,,,,,0.25]
    ]
  },
  'shootAlt': {
    count: 10,
    params: [
      [0,,0.16,0.18,0.18,0.47,0.0084,-0.26,,,,,,0.74,-1,,-0.76,,1,,,,,0.15]
    ]
  },
  'hit': {
    count: 10,
    params: [
      [3,,0.0138,,0.2701,0.4935,,-0.6881,,,,,,,,,,,1,,,,,0.25],
      [0,,0.0639,,0.2425,0.7582,,-0.6217,,,,,,0.4039,,,,,1,,,,,0.25],
      [3,,0.0948,,0.2116,0.7188,,-0.6372,,,,,,,,,,,1,,,0.2236,,0.25]
    ]
  },
  'explosion': {
    count: 5,
    params: [
      [3,,0.1164,0.88,0.37,0.06,,0.1599,,,,-0.0846,0.6485,,,,0.3963,-0.0946,1,,,,,0.25],
      [3,,0.2958,0.3173,0.3093,0.0665,,0.1334,,,,,,,,,,,1,,,,,0.25]
    ]
  },
  'explosionAlt': {
    count: 5,
    params: [
      [3,,0.15,0.7523,0.398,0.15,,-0.18,,0.39,0.53,-0.3428,0.6918,,,0.5792,0.6,0.56,1,,,,,0.25]
    ]
  },
  'takingDamage': {
    count: 5,
    params: [
      [3,,0.1606,0.5988,0.2957,0.1157,,-0.3921,,,,,,,,,0.3225,-0.2522,1,,,,,0.25],
      [3,,0.1726,0.2496,0.2116,0.0623,,-0.2096,,,,,,,,,0.2665,-0.1459,1,,,,,0.25],
      [3,,0.1645,0.7236,0.3402,0.0317,,,,,,,,,,,,,1,,,,,0.25]
    ]
  },
  'death': {
    count: 1,
    params: [
      [3,,0.51,,1,0.1372,,0.02,0.1,,,,0.89,0.7751,,,-0.16,0.32,1,0.3999,0.81,,0.1999,0.15]
    ]
  },
  'powerup': {
    count: 3,
    params: [
      [0,,0.01,,0.4384,0.2,,0.12,0.28,1,0.65,,,0.0419,,,,,1,,,,,0.4]
    ]
  },
  'levelup': {
    count: 2,
    params: [
      [2,1,0.01,,0.84,0.19,,,,0.62,0.7,,,-0.7248,0.8522,,,,1,,,,,0.45]
    ]
  },
  'hover': {
    count: 10,
    params: [
      [0,0.08,0.18,,,0.65,,1,1,,,0.94,1,,,,-0.3,1,1,,,0.3,0.5,0.35]
    ]
  },
  'click': {
    count: 5,
    params: [
      [3,,0.18,,,1,,-1,-1,,,,,,,,,,1,,,0.64,,0.35]
    ]
  }
};

interface AudioPool {
  tick: number;
  count: number;
  pool: HTMLAudioElement[];
}

interface AudioManager {
  sounds: { [key: string]: AudioPool[] };
  references: HTMLAudioElement[];
  muted: boolean;
}

export const useAudio = () => {
  const audioManagerRef = useRef<AudioManager>({
    sounds: {},
    references: [],
    muted: false
  });
  const initializedRef = useRef(false);

  // Initialize audio system
  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current || !jsfxr) return;

    const audioManager = audioManagerRef.current;
    
    // Create audio pools for each sound type
    for (const soundName in audioDefinitions) {
      audioManager.sounds[soundName] = [];
      const soundDef = audioDefinitions[soundName as keyof typeof audioDefinitions];

      soundDef.params.forEach((params, index) => {
        audioManager.sounds[soundName].push({
          tick: 0,
          count: soundDef.count,
          pool: []
        });

        // Create audio pool for this variation
        for (let i = 0; i < soundDef.count; i++) {
          try {
            const audio = new Audio();
            const audioData = jsfxr(params);
            audio.src = audioData;
            audio.volume = 0.5; // Default volume
            
            audioManager.references.push(audio);
            audioManager.sounds[soundName][index].pool.push(audio);
          } catch (error) {
            console.warn(`Failed to create audio for ${soundName}:`, error);
          }
        }
      });
    }

    initializedRef.current = true;
  }, []);

  // Play sound function
  const playSound = useCallback((soundName: string) => {
    if (typeof window === 'undefined' || !initializedRef.current) return;
    
    const audioManager = audioManagerRef.current;
    if (audioManager.muted || !audioManager.sounds[soundName]) return;

    const soundPool = audioManager.sounds[soundName];
    let audioToPlay: AudioPool;

    // Select audio variation (random if multiple)
    if (soundPool.length > 1) {
      const randomIndex = Math.floor(Math.random() * soundPool.length);
      audioToPlay = soundPool[randomIndex];
    } else {
      audioToPlay = soundPool[0];
    }

    // Play from pool using round-robin
    try {
      const audio = audioToPlay.pool[audioToPlay.tick];
      audio.currentTime = 0; // Reset to beginning
      audio.play().catch(e => {
        // Ignore play errors (common in browsers with autoplay restrictions)
        console.debug('Audio play failed:', e);
      });

      // Advance tick for round-robin
      if (audioToPlay.tick < audioToPlay.count - 1) {
        audioToPlay.tick++;
      } else {
        audioToPlay.tick = 0;
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const audioManager = audioManagerRef.current;
    audioManager.muted = !audioManager.muted;
    
    // Update volume for all audio references
    audioManager.references.forEach(audio => {
      audio.volume = audioManager.muted ? 0 : 0.5;
    });
    
    return audioManager.muted;
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const audioManager = audioManagerRef.current;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    audioManager.references.forEach(audio => {
      audio.volume = audioManager.muted ? 0 : clampedVolume;
    });
  }, []);

  return {
    playSound,
    toggleMute,
    setVolume,
    isMuted: audioManagerRef.current.muted,
    isInitialized: initializedRef.current
  };
};

export default useAudio; 