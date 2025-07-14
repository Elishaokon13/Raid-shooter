'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface VirtualControlsState {
  movement: {
    x: number; // -1 to 1
    y: number; // -1 to 1
    active: boolean;
  };
  aiming: {
    x: number; // screen coordinates
    y: number; // screen coordinates
    angle: number; // radians
    active: boolean;
    firing: boolean;
  };
}

interface TouchData {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const useVirtualControls = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsRef = useRef<VirtualControlsState>({
    movement: { x: 0, y: 0, active: false },
    aiming: { x: 0, y: 0, angle: 0, active: false, firing: false }
  });
  
  const touchesRef = useRef<Map<number, TouchData>>(new Map());
  const leftZoneRef = useRef<HTMLDivElement>(null);
  const rightZoneRef = useRef<HTMLDivElement>(null);

  // Detect touch device
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
    setShowControls(hasTouch);
  }, []);

  // Virtual joystick calculations
  const calculateMovement = useCallback((touch: TouchData, zoneElement: HTMLElement) => {
    const rect = zoneElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 3; // Reduced radius for better control

    const deltaX = touch.currentX - centerX;
    const deltaY = touch.currentY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clamp to circle
    const clampedDistance = Math.min(distance, radius);
    const angle = Math.atan2(deltaY, deltaX);
    
    const x = clampedDistance * Math.cos(angle) / radius;
    const y = clampedDistance * Math.sin(angle) / radius;

    return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  }, []);

  const calculateAiming = useCallback((touch: TouchData, canvasElement: HTMLCanvasElement) => {
    const rect = canvasElement.getBoundingClientRect();
    const x = touch.currentX - rect.left;
    const y = touch.currentY - rect.top;
    
    // Convert to canvas coordinates (accounting for canvas scaling)
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;
    
    return {
      x: x * scaleX,
      y: y * scaleY,
      angle: Math.atan2(y - canvasElement.height / 2, x - canvasElement.width / 2)
    };
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const leftZone = leftZoneRef.current;
    const rightZone = rightZoneRef.current;
    
    if (!canvas || !leftZone || !rightZone) return;

    Array.from(e.changedTouches).forEach(touch => {
      const touchData: TouchData = {
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY
      };

      const leftRect = leftZone.getBoundingClientRect();
      const rightRect = rightZone.getBoundingClientRect();
      
      // Determine which zone was touched
      if (touch.clientX >= leftRect.left && touch.clientX <= leftRect.right &&
          touch.clientY >= leftRect.top && touch.clientY <= leftRect.bottom) {
        // Left zone - movement control
        touchesRef.current.set(touch.identifier, { ...touchData, type: 'movement' } as any);
        controlsRef.current.movement.active = true;
        
        const movement = calculateMovement(touchData, leftZone);
        controlsRef.current.movement.x = movement.x;
        controlsRef.current.movement.y = movement.y;
      } else if (touch.clientX >= rightRect.left && touch.clientX <= rightRect.right &&
                 touch.clientY >= rightRect.top && touch.clientY <= rightRect.bottom) {
        // Right zone - aiming/firing control
        touchesRef.current.set(touch.identifier, { ...touchData, type: 'aiming' } as any);
        controlsRef.current.aiming.active = true;
        controlsRef.current.aiming.firing = true;
        
        const aiming = calculateAiming(touchData, canvas);
        controlsRef.current.aiming.x = aiming.x;
        controlsRef.current.aiming.y = aiming.y;
        controlsRef.current.aiming.angle = aiming.angle;
      }
    });
  }, [calculateMovement, calculateAiming]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const leftZone = leftZoneRef.current;
    const rightZone = rightZoneRef.current;
    
    if (!canvas || !leftZone || !rightZone) return;

    Array.from(e.changedTouches).forEach(touch => {
      const touchData = touchesRef.current.get(touch.identifier);
      if (!touchData) return;

      const updatedTouch = {
        ...touchData,
        currentX: touch.clientX,
        currentY: touch.clientY
      };
      touchesRef.current.set(touch.identifier, updatedTouch);

      if ((touchData as any).type === 'movement') {
        const movement = calculateMovement(updatedTouch, leftZone);
        controlsRef.current.movement.x = movement.x;
        controlsRef.current.movement.y = movement.y;
      } else if ((touchData as any).type === 'aiming') {
        const aiming = calculateAiming(updatedTouch, canvas);
        controlsRef.current.aiming.x = aiming.x;
        controlsRef.current.aiming.y = aiming.y;
        controlsRef.current.aiming.angle = aiming.angle;
      }
    });
  }, [calculateMovement, calculateAiming]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      const touchData = touchesRef.current.get(touch.identifier);
      if (!touchData) return;

      if ((touchData as any).type === 'movement') {
        controlsRef.current.movement.x = 0;
        controlsRef.current.movement.y = 0;
        controlsRef.current.movement.active = false;
      } else if ((touchData as any).type === 'aiming') {
        controlsRef.current.aiming.active = false;
        controlsRef.current.aiming.firing = false;
      }

      touchesRef.current.delete(touch.identifier);
    });
  }, []);

  // Setup touch event listeners
  useEffect(() => {
    if (!isTouchDevice) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isTouchDevice, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Get current controls state
  const getControlsState = useCallback(() => {
    return { ...controlsRef.current };
  }, []);

  // Force show/hide controls
  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  // Virtual joystick components
  const VirtualJoystick = useCallback(({ position, type }: { position: 'left' | 'right', type: 'movement' | 'aiming' }) => {
    const controls = getControlsState();
    const isActive = type === 'movement' ? controls.movement.active : controls.aiming.active;
    const value = type === 'movement' 
      ? { x: controls.movement.x, y: controls.movement.y }
      : { x: 0, y: 0 }; // Aiming doesn't need visual feedback in same way

    return (
      <div
        ref={position === 'left' ? leftZoneRef : rightZoneRef}
        className={`
          fixed bottom-8 w-24 h-24 rounded-full border-2 border-white/30 
          bg-black/20 backdrop-blur-sm flex items-center justify-center
          transition-all duration-200 select-none touch-manipulation
          ${position === 'left' ? 'left-8' : 'right-8'}
          ${isActive ? 'bg-white/10 border-white/50 scale-110' : ''}
        `}
        style={{ touchAction: 'none' }}
      >
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border border-white/20 relative">
          {/* Inner knob */}
          <div
            className={`
              w-8 h-8 rounded-full bg-white/60 absolute top-1/2 left-1/2
              transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100
              ${isActive ? 'bg-white/80 scale-110' : ''}
            `}
            style={{
              transform: `translate(-50%, -50%) translate(${value.x * 24}px, ${value.y * 24}px) ${isActive ? 'scale(1.1)' : 'scale(1)'}`
            }}
          />
        </div>
        
        {/* Label */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/60 font-mono">
          {type === 'movement' ? 'MOVE' : 'AIM'}
        </div>
      </div>
    );
  }, [getControlsState]);

  return {
    isTouchDevice,
    showControls,
    getControlsState,
    toggleControls,
    VirtualJoystick
  };
};

export default useVirtualControls; 