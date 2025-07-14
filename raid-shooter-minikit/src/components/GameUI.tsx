'use client';

import { GameState, GameStats } from '@/types/game';

interface GameUIProps {
  gameState: GameState;
  stats: GameStats;
  isPaused: boolean;
  isMuted: boolean;
  autofire: boolean;
  onGameStart: () => void;
  onGamePause: () => void;
  onRestart: () => void;
  onMuteToggle: () => void;
  onAutofireToggle: () => void;
}

export default function GameUI({
  gameState,
  stats,
  isPaused,
  isMuted,
  autofire,
  onGameStart,
  onGamePause,
  onRestart,
  onMuteToggle,
  onAutofireToggle,
}: GameUIProps) {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            RAID SHOOTER
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Survive the enemy waves!
          </p>
          
          <div className="space-y-4">
            <button
              onClick={onGameStart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 text-xl rounded-lg transition-colors duration-200"
            >
              PLAY GAME
            </button>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onMuteToggle}
                className={`${isMuted ? 'bg-red-600' : 'bg-green-600'} hover:opacity-80 text-white font-bold py-2 px-4 rounded transition-colors duration-200`}
              >
                {isMuted ? 'UNMUTE' : 'MUTE'}
              </button>
              
              <button
                onClick={onAutofireToggle}
                className={`${autofire ? 'bg-green-600' : 'bg-gray-600'} hover:opacity-80 text-white font-bold py-2 px-4 rounded transition-colors duration-200`}
              >
                AUTOFIRE: {autofire ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="text-lg text-gray-300">
              <p>Best Score: {formatScore(stats.bestScore)}</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-400 mt-8">
            <p>Move: WASD or Arrow Keys</p>
            <p>Aim/Fire: Mouse or Touch</p>
            <p>Pause: P or ESC</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'play') {
    return (
      <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-white">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <div>
              <span className="text-gray-300">Score: </span>
              <span className="text-white font-bold">{formatScore(stats.score)}</span>
            </div>
            <div>
              <span className="text-gray-300">Level: </span>
              <span className="text-white font-bold">{stats.level}</span>
            </div>
            <div>
              <span className="text-gray-300">Kills: </span>
              <span className="text-white font-bold">{stats.kills}</span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div>
              <span className="text-gray-300">Time: </span>
              <span className="text-white font-mono">{formatTime(stats.time)}</span>
            </div>
            <div>
              <span className="text-gray-300">Best: </span>
              <span className="text-white font-bold">{formatScore(stats.bestScore)}</span>
            </div>
          </div>
        </div>
        
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">PAUSED</h2>
              <button
                onClick={onGamePause}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                RESUME
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 text-white">
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold text-red-500 mb-4">GAME OVER</h2>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-gray-300">Final Score:</p>
                <p className="text-white font-bold text-xl">{formatScore(stats.score)}</p>
              </div>
              <div>
                <p className="text-gray-300">Level Reached:</p>
                <p className="text-white font-bold text-xl">{stats.level}</p>
              </div>
              <div>
                <p className="text-gray-300">Enemies Killed:</p>
                <p className="text-white font-bold text-xl">{stats.kills}</p>
              </div>
              <div>
                <p className="text-gray-300">Time Survived:</p>
                <p className="text-white font-bold text-xl">{formatTime(stats.time)}</p>
              </div>
              <div>
                <p className="text-gray-300">Bullets Fired:</p>
                <p className="text-white font-bold text-xl">{stats.bulletsFired}</p>
              </div>
              <div>
                <p className="text-gray-300">Powerups:</p>
                <p className="text-white font-bold text-xl">{stats.powerupsCollected}</p>
              </div>
            </div>
          </div>
          
          {stats.score > stats.bestScore && (
            <div className="text-center">
              <p className="text-yellow-400 font-bold text-xl">NEW HIGH SCORE!</p>
            </div>
          )}
          
          <div className="space-y-4 mt-8">
            <button
              onClick={onGameStart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 text-lg rounded-lg transition-colors duration-200"
            >
              PLAY AGAIN
            </button>
            
            <button
              onClick={onRestart}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 