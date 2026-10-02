import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, GripVertical, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { globalAudioEngine } from '../services/AudioEngine';

export const AudioControl: React.FC = () => {
  const [audioState, setAudioState] = useState(globalAudioEngine.getState());
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('audio_control_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('audio_control_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const asideRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  } | null>(null);
  const ignoreNextClickRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = globalAudioEngine.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // Clamp position within viewport boundaries on mount and resize
  const clampPosition = useCallback((x: number, y: number, width: number, height: number) => {
    const padding = 12;
    const maxX = Math.max(padding, window.innerWidth - width - padding);
    const maxY = Math.max(padding, window.innerHeight - height - padding);
    return {
      x: Math.min(Math.max(padding, x), maxX),
      y: Math.min(Math.max(padding, y), maxY),
    };
  }, []);

  // Keep button within viewport when resizing window
  useEffect(() => {
    const handleResize = () => {
      if (position && asideRef.current) {
        const rect = asideRef.current.getBoundingClientRect();
        const clamped = clampPosition(position.x, position.y, rect.width, rect.height);
        if (clamped.x !== position.x || clamped.y !== position.y) {
          setPosition(clamped);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, clampPosition]);

  // Window-based drag listener: allows reliable dragging while never swallowing native button clicks!
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary mouse / touch button

    const el = asideRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const currentX = position ? position.x : rect.left;
    const currentY = position ? position.y : rect.top;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
      hasMoved: false,
    };

    if (!position) {
      setPosition({ x: currentX, y: currentY });
    }

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!dragStartRef.current || !asideRef.current) return;
      const dx = moveEv.clientX - dragStartRef.current.startX;
      const dy = moveEv.clientY - dragStartRef.current.startY;

      // Threshold: only start drag when pointer moved > 5 pixels
      if (!dragStartRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
        dragStartRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragStartRef.current.hasMoved) {
        const rectNow = asideRef.current.getBoundingClientRect();
        const rawX = dragStartRef.current.initialX + dx;
        const rawY = dragStartRef.current.initialY + dy;
        const clamped = clampPosition(rawX, rawY, rectNow.width, rectNow.height);
        setPosition(clamped);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (!dragStartRef.current) return;
      const wasDragged = dragStartRef.current.hasMoved;
      dragStartRef.current = null;
      setIsDragging(false);

      if (wasDragged) {
        // Prevent click trigger immediately following a drag
        ignoreNextClickRef.current = true;
        setTimeout(() => {
          ignoreNextClickRef.current = false;
        }, 120);

        if (position) {
          try {
            localStorage.setItem('audio_control_pos', JSON.stringify(position));
          } catch {
            // ignore
          }
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (ignoreNextClickRef.current) return;

    if (!audioState.isPlaying) {
      globalAudioEngine.start();
    } else {
      globalAudioEngine.toggleMute();
    }
  };

  const handleToggleCollapse = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (ignoreNextClickRef.current) return;

    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('audio_control_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleNextTrack = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (ignoreNextClickRef.current) return;

    globalAudioEngine.nextTrack();
  };

  const isAudioActive = audioState.isPlaying && !audioState.isMuted;

  // Use fixed coordinates if moved, or default bottom-6 right-6
  const asideStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
        zIndex: 60,
      }
    : {
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 50,
      };

  return (
    <aside 
      ref={asideRef}
      aria-label="Soundtrack controls"
      style={asideStyle}
      className="touch-none select-none"
    >
      {isCollapsed ? (
        /* ========================================================= */
        /* VERY SMALL CIRCLE MODE                                    */
        /* Small circle with mute/unmute sign + small expand arrow   */
        /* ========================================================= */
        <div
          onPointerDown={handlePointerDown}
          className={`flex items-center gap-1.5 p-1 rounded-full border transition-all duration-300 backdrop-blur-md cursor-grab active:cursor-grabbing select-none touch-none ${
            isDragging ? 'scale-110 shadow-2xl ring-2 ring-[#C5A059]/50 z-50' : 'shadow-xl'
          } ${
            isAudioActive
              ? 'bg-[#251E1A]/95 text-[#F5EFE6] border-[#C5A059]/50 shadow-[0_4px_20px_rgba(197,160,89,0.35)]'
              : 'bg-[#1F1916]/90 text-[#B8A89A] border-stone-800/80 shadow-black/40'
          }`}
        >
          {/* Small Circle: Mute / Unmute Sign */}
          <button
            onClick={handleToggle}
            type="button"
            title={isAudioActive ? "Mute soundtrack" : "Play / Unmute soundtrack"}
            aria-label={isAudioActive ? "Mute soundtrack" : "Play soundtrack"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2E241E] hover:bg-[#3D3028] text-[#C5A059] flex items-center justify-center transition-all cursor-pointer border border-[#C5A059]/30 hover:border-[#C5A059] active:scale-90"
          >
            {isAudioActive ? (
              <Volume2 className="w-4 h-4 text-[#C5A059]" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Small Arrow Beside It to Expand */}
          <button
            onClick={handleToggleCollapse}
            type="button"
            title="Expand soundtrack controls"
            aria-label="Expand soundtrack controls"
            className="w-6 h-6 rounded-full bg-stone-900/70 hover:bg-[#3B3029] text-[#C5A059]/80 hover:text-[#F9E8B2] flex items-center justify-center transition-all cursor-pointer border border-stone-700/60 hover:border-[#C5A059]/60 active:scale-90"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* ========================================================= */
        /* FULL SHAPE (EXPANDED PILL)                                */
        /* Full controls with title, artist, waves, skip, collapse   */
        /* ========================================================= */
        <div
          onPointerDown={handlePointerDown}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border transition-all duration-300 backdrop-blur-md cursor-grab active:cursor-grabbing select-none touch-none ${
            isDragging ? 'scale-105 shadow-2xl ring-2 ring-[#C5A059]/40 z-50' : 'shadow-xl'
          } ${
            isAudioActive
              ? 'bg-[#251E1A]/90 text-[#F5EFE6] border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#2F2621] shadow-black/50'
              : 'bg-[#1F1916]/80 text-[#B8A89A] border-stone-800/70 hover:text-stone-200 hover:border-stone-600 shadow-black/40'
          }`}
        >
          {/* Drag Handle Indicator */}
          <span className="text-[#C5A059]/40 group-hover:text-[#C5A059]/80 transition-colors flex items-center -mr-0.5 pointer-events-none">
            <GripVertical className="w-3.5 h-3.5" />
          </span>

          {/* Mute / Unmute Button */}
          <button
            onClick={handleToggle}
            type="button"
            title={isAudioActive ? "Mute music" : "Play / Unmute music"}
            aria-label={isAudioActive ? "Mute soundtrack" : "Play soundtrack"}
            className="flex items-center justify-center w-5 h-5 text-[#C5A059] hover:scale-110 active:scale-90 transition-transform cursor-pointer"
          >
            {isAudioActive ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* State Label */}
          <div
            onClick={handleToggle}
            className="flex flex-col text-left cursor-pointer select-none"
          >
            <span className="text-xs font-medium tracking-wider uppercase font-serif-heading leading-tight truncate max-w-[125px] sm:max-w-[155px]">
              {isAudioActive ? (audioState.currentTrack?.title || 'Playing') : 'Music Off'}
            </span>
            {isAudioActive && (
              <span className="text-[9px] text-[#C5A059]/80 font-serif-heading tracking-wide leading-none truncate max-w-[125px] sm:max-w-[155px]">
                {audioState.currentTrack?.infoSubtitle || 'Soundtrack'}
              </span>
            )}
          </div>

          {/* Dynamic Sound Wave Bars */}
          {isAudioActive && (
            <span className="flex items-center gap-0.5 ml-0.5 h-3 pointer-events-none" aria-hidden="true">
              <span className="w-0.5 h-2.5 bg-[#C5A059] rounded-full animate-pulse [animation-duration:600ms]" />
              <span className="w-0.5 h-3.5 bg-[#E6CA85] rounded-full animate-pulse [animation-duration:800ms]" />
              <span className="w-0.5 h-2 bg-[#C5A059] rounded-full animate-pulse [animation-duration:500ms]" />
            </span>
          )}

          {/* Skip to Next Track Button */}
          {isAudioActive && (
            <button
              onClick={handleNextTrack}
              type="button"
              title="Next song: Owo Oluwa Nbe Lori Aiye Mi"
              aria-label="Skip to next song"
              className="p-1 rounded-full text-[#C5A059]/60 hover:text-[#FFDF73] hover:bg-stone-800/60 active:scale-90 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Small Arrow Beside It to Collapse Back into Circle */}
          <button
            onClick={handleToggleCollapse}
            type="button"
            title="Collapse into circle"
            aria-label="Collapse soundtrack control into circle"
            className="p-1 -mr-1 rounded-full text-stone-400 hover:text-[#C5A059] hover:bg-stone-800/60 active:scale-90 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
};
