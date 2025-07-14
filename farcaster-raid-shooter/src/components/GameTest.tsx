'use client';

import { useEffect, useRef, useState } from 'react';

export default function GameTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testGame = async () => {
      try {
        addLog('Starting game test...');

        // Test 1: Check if container exists
        if (!containerRef.current) {
          addLog('ERROR: Container ref not found');
          return;
        }
        addLog('✅ Container ref found');

        // Test 2: Set up basic HTML structure
        containerRef.current.innerHTML = `
          <div id="left-joystick" class="joystick" style="width:80px;height:80px;background:red;position:absolute;left:20px;top:20px;"></div>
          <div id="right-joystick" class="joystick" style="width:80px;height:80px;background:blue;position:absolute;right:20px;top:20px;"></div>
          <div id="wrap" style="width:800px;height:600px;background:#222;margin:20px auto;position:relative;">
            <div id="wrap-inner" style="width:100%;height:100%;background:#000;">
              <canvas id="cbg1" width="800" height="600" style="position:absolute;"></canvas>
              <canvas id="cbg2" width="800" height="600" style="position:absolute;"></canvas>
              <canvas id="cbg3" width="800" height="600" style="position:absolute;"></canvas>
              <canvas id="cbg4" width="800" height="600" style="position:absolute;"></canvas>
              <canvas id="cmg" width="800" height="600" style="position:absolute;"></canvas>
              <canvas id="cfg" width="800" height="600" style="position:absolute;"></canvas>
            </div>
          </div>
        `;
        addLog('✅ HTML structure created');

        // Test 3: Check DOM elements
        const elements = [
          'left-joystick', 'right-joystick', 'wrap', 'wrap-inner', 
          'cbg1', 'cbg2', 'cbg3', 'cbg4', 'cmg', 'cfg'
        ];
        
        for (const id of elements) {
          const el = document.getElementById(id);
          if (el) {
            addLog(`✅ Found element: ${id}`);
          } else {
            addLog(`❌ Missing element: ${id}`);
          }
        }

        // Test 4: Initialize global $ object
        if ((window as any).$) {
          addLog('⚠️ Global $ object already exists');
        }
        (window as any).$ = {};
        addLog('✅ Global $ object initialized');

        // Test 5: Load one script at a time for testing
        addLog('Loading util.js...');
        await loadScript('/game/util.js');
        addLog('✅ util.js loaded');

        addLog('Loading definitions.js...');
        await loadScript('/game/definitions.js');
        addLog('✅ definitions.js loaded');

        addLog('Loading storage.js...');
        await loadScript('/game/storage.js');
        addLog('✅ storage.js loaded');

        // Test 6: Check what's available on $
        const dollarKeys = Object.keys((window as any).$ || {});
        addLog(`Available $ properties: ${dollarKeys.join(', ')}`);

        addLog('🎉 Basic test completed successfully!');
        
      } catch (error) {
        addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    testGame();
  }, []);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl mb-4">Game Test Console</h1>
      <div className="mb-4 h-64 overflow-y-auto bg-black p-2 rounded font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : log.includes('⚠️') ? 'text-yellow-400' : 'text-white'}>
            {log}
          </div>
        ))}
      </div>
      <div ref={containerRef} className="border border-gray-600 min-h-96">
        {/* Game elements will be inserted here */}
      </div>
    </div>
  );
} 