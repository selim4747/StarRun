import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TouchInputState, GameMode } from '../types/game';
import { Crosshair, Zap, Shield, Terminal, ArrowUpRight } from 'lucide-react';

interface TouchControlsProps {
  gameMode: GameMode;
  onInputChange: (input: TouchInputState) => void;
  isNearTerminal?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  gameMode,
  onInputChange,
  isNearTerminal = false,
}) => {
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Input state refs
  const inputRef = useRef<TouchInputState>({
    moveX: 0,
    moveY: 0,
    isMoving: false,
    isFiring: false,
    isBoosting: false,
    isCovering: false,
    isEMPTriggered: false,
    isInteracting: false,
  });

  const notifyChange = useCallback(() => {
    onInputChange({ ...inputRef.current });
  }, [onInputChange]);

  // Touch joystick handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startPosRef.current = { x: centerX, y: centerY };
    setJoystickActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - startPosRef.current.x;
        const dy = touch.clientY - startPosRef.current.y;
        const maxRadius = 45;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(distance, maxRadius);
        const angle = Math.atan2(dy, dx);

        const clampedX = Math.cos(angle) * clampedDist;
        const clampedY = Math.sin(angle) * clampedDist;

        setStickPos({ x: clampedX, y: clampedY });

        // Normalized input (-1 to 1)
        inputRef.current.moveX = clampedX / maxRadius;
        inputRef.current.moveY = clampedY / maxRadius;
        inputRef.current.isMoving = clampedDist > 5;
        notifyChange();
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystickActive(false);
        setStickPos({ x: 0, y: 0 });
        inputRef.current.moveX = 0;
        inputRef.current.moveY = 0;
        inputRef.current.isMoving = false;
        notifyChange();
        break;
      }
    }
  };

  // Keyboard controls for desktop convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let changed = false;
      if (e.key === 'w' || e.key === 'ArrowUp') { inputRef.current.moveY = -1; changed = true; }
      if (e.key === 's' || e.key === 'ArrowDown') { inputRef.current.moveY = 1; changed = true; }
      if (e.key === 'a' || e.key === 'ArrowLeft') { inputRef.current.moveX = -1; changed = true; }
      if (e.key === 'd' || e.key === 'ArrowRight') { inputRef.current.moveX = 1; changed = true; }
      if (e.code === 'Space') { inputRef.current.isFiring = true; changed = true; }
      if (e.key === 'Shift') {
        if (gameMode === 'SURFACE') inputRef.current.isBoosting = true;
        if (gameMode === 'CITADEL') inputRef.current.isCovering = true;
        changed = true;
      }
      if (e.key === 'q' || e.key === 'Q') { inputRef.current.isEMPTriggered = true; changed = true; }
      if (e.key === 'e' || e.key === 'E') { inputRef.current.isInteracting = true; changed = true; }

      if (changed) notifyChange();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let changed = false;
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) { inputRef.current.moveY = 0; changed = true; }
      if (['a', 'd', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { inputRef.current.moveX = 0; changed = true; }
      if (e.code === 'Space') { inputRef.current.isFiring = false; changed = true; }
      if (e.key === 'Shift') {
        inputRef.current.isBoosting = false;
        inputRef.current.isCovering = false;
        changed = true;
      }
      if (e.key === 'q' || e.key === 'Q') { inputRef.current.isEMPTriggered = false; changed = true; }
      if (e.key === 'e' || e.key === 'E') { inputRef.current.isInteracting = false; changed = true; }

      if (changed) notifyChange();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode, notifyChange]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex justify-between items-end p-4 md:p-8">
      {/* 1. Left Thumbstick Virtual Joystick */}
      <div
        ref={joystickContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto relative w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center touch-none shadow-2xl active:border-cyan-400/50"
      >
        {/* Outer Ring Markings */}
        <div className="absolute inset-2 rounded-full border border-dashed border-white/10 pointer-events-none" />
        <div className="absolute text-[10px] text-white/40 uppercase tracking-widest top-2 font-display pointer-events-none">
          YÖN
        </div>

        {/* Joystick Center Thumb */}
        <div
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            transition: joystickActive ? 'none' : 'transform 0.15s ease-out',
          }}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg ${
            joystickActive
              ? 'bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white shadow-cyan-500/40'
              : 'bg-white/20 text-white/70'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white/40" />
        </div>
      </div>

      {/* 2. Right Action Button Cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-3 touch-none">
        {/* Interaction / Hack Button (Visible in citadel when near terminal) */}
        {gameMode === 'CITADEL' && (
          <button
            onTouchStart={(e) => { e.preventDefault(); inputRef.current.isInteracting = true; notifyChange(); }}
            onTouchEnd={(e) => { e.preventDefault(); inputRef.current.isInteracting = false; notifyChange(); }}
            onMouseDown={() => { inputRef.current.isInteracting = true; notifyChange(); }}
            onMouseUp={() => { inputRef.current.isInteracting = false; notifyChange(); }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center border font-display transition-all ${
              isNearTerminal
                ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg shadow-emerald-500/40 scale-105 animate-bounce'
                : 'bg-black/50 border-white/20 text-white/40'
            }`}
          >
            <Terminal className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold tracking-tight">HACK [E]</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* EMP Shockwave Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); inputRef.current.isEMPTriggered = true; notifyChange(); }}
            onTouchEnd={(e) => { e.preventDefault(); inputRef.current.isEMPTriggered = false; notifyChange(); }}
            onMouseDown={() => { inputRef.current.isEMPTriggered = true; notifyChange(); }}
            onMouseUp={() => { inputRef.current.isEMPTriggered = false; notifyChange(); }}
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black/60 border border-cyan-500/40 text-cyan-400 flex flex-col items-center justify-center shadow-lg active:scale-95 active:bg-cyan-500 active:text-black font-display"
          >
            <Zap className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold">EMP [Q]</span>
          </button>

          {/* Secondary Action: BOOST in Surface or COVER in Citadel */}
          {gameMode === 'SURFACE' ? (
            <button
              onTouchStart={(e) => { e.preventDefault(); inputRef.current.isBoosting = true; notifyChange(); }}
              onTouchEnd={(e) => { e.preventDefault(); inputRef.current.isBoosting = false; notifyChange(); }}
              onMouseDown={() => { inputRef.current.isBoosting = true; notifyChange(); }}
              onMouseUp={() => { inputRef.current.isBoosting = false; notifyChange(); }}
              className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 border border-orange-300 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 font-display"
            >
              <ArrowUpRight className="w-6 h-6 mb-0.5" />
              <span className="text-[10px] font-bold tracking-wider">İTKİ</span>
            </button>
          ) : (
            <button
              onTouchStart={(e) => { e.preventDefault(); inputRef.current.isCovering = true; notifyChange(); }}
              onTouchEnd={(e) => { e.preventDefault(); inputRef.current.isCovering = false; notifyChange(); }}
              onMouseDown={() => { inputRef.current.isCovering = true; notifyChange(); }}
              onMouseUp={() => { inputRef.current.isCovering = false; notifyChange(); }}
              className={`w-16 h-16 md:w-18 md:h-18 rounded-2xl flex flex-col items-center justify-center border font-display active:scale-95 ${
                inputRef.current.isCovering
                  ? 'bg-blue-600 border-blue-300 text-white shadow-blue-500/40 shadow-lg'
                  : 'bg-black/60 border-blue-500/40 text-blue-300'
              }`}
            >
              <Shield className="w-6 h-6 mb-0.5" />
              <span className="text-[10px] font-bold tracking-wider">SİPER</span>
            </button>
          )}

          {/* Primary Action: FIRE (Plasma Cannons / Silenced Blaster) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); inputRef.current.isFiring = true; notifyChange(); }}
            onTouchEnd={(e) => { e.preventDefault(); inputRef.current.isFiring = false; notifyChange(); }}
            onMouseDown={() => { inputRef.current.isFiring = true; notifyChange(); }}
            onMouseUp={() => { inputRef.current.isFiring = false; notifyChange(); }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 border-2 border-red-300 text-white flex flex-col items-center justify-center shadow-xl shadow-red-500/40 active:scale-90 font-display"
          >
            <Crosshair className="w-8 h-8 mb-0.5" />
            <span className="text-[11px] font-bold tracking-widest uppercase">ATEŞ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
