'use client';

import { useRef, useEffect } from 'react';

interface VirtualJoystickProps {
  position: 'left' | 'right';
  type: 'movement' | 'aiming';
  isActive: boolean;
  value: { x: number; y: number };
  onRef?: (ref: HTMLDivElement | null) => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  position,
  type,
  isActive,
  value,
  onRef
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onRef) {
      onRef(divRef.current);
    }
  }, [onRef]);

  return (
    <div
      ref={divRef}
      className={`
        fixed bottom-8 w-24 h-24 rounded-full border-2 border-white/30 
        bg-black/20 backdrop-blur-sm flex items-center justify-center
        transition-all duration-200 select-none touch-manipulation z-50
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
};

export default VirtualJoystick; 