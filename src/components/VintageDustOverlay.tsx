import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: string;
  delay: string;
  animType: 1 | 2 | 3;
  color: string;
  glow: boolean;
}

interface VintageDustOverlayProps {
  className?: string;
  density?: 'subtle' | 'standard';
}

export const VintageDustOverlay = React.memo<VintageDustOverlayProps>(({ 
  className = '',
  density = 'standard',
}) => {
  // Deterministic particle set to prevent any layout shifts or SSR mismatches
  const particles: Particle[] = useMemo(() => {
    const rawList: Particle[] = [
      { id: 1, left: '8%', top: '15%', size: 2.5, duration: '18s', delay: '-3s', animType: 1, color: 'rgba(235, 205, 140, 0.65)', glow: true },
      { id: 2, left: '22%', top: '45%', size: 1.5, duration: '22s', delay: '-8s', animType: 2, color: 'rgba(215, 175, 105, 0.5)', glow: false },
      { id: 3, left: '38%', top: '18%', size: 3.0, duration: '26s', delay: '-14s', animType: 3, color: 'rgba(245, 230, 190, 0.7)', glow: true },
      { id: 4, left: '52%', top: '65%', size: 2.0, duration: '19s', delay: '-5s', animType: 1, color: 'rgba(225, 195, 130, 0.55)', glow: false },
      { id: 5, left: '68%', top: '25%', size: 1.8, duration: '24s', delay: '-11s', animType: 2, color: 'rgba(212, 175, 55, 0.5)', glow: false },
      { id: 6, left: '84%', top: '50%', size: 3.2, duration: '21s', delay: '-17s', animType: 3, color: 'rgba(255, 235, 185, 0.75)', glow: true },
      { id: 7, left: '14%', top: '80%', size: 2.2, duration: '23s', delay: '-7s', animType: 1, color: 'rgba(230, 200, 140, 0.6)', glow: false },
      { id: 8, left: '32%', top: '75%', size: 1.5, duration: '27s', delay: '-19s', animType: 2, color: 'rgba(205, 170, 110, 0.45)', glow: false },
      { id: 9, left: '46%', top: '35%', size: 2.8, duration: '20s', delay: '-2s', animType: 3, color: 'rgba(240, 215, 155, 0.68)', glow: true },
      { id: 10, left: '60%', top: '85%', size: 1.6, duration: '25s', delay: '-13s', animType: 1, color: 'rgba(215, 180, 120, 0.5)', glow: false },
    ];

    return density === 'subtle' ? rawList.slice(0, 7) : rawList.slice(0, 10);
  }, [density]);

  return (
    <div
      aria-hidden="true"
      className={`vintage-dust-layer pointer-events-none ${className}`}
    >
      {/* Ambient background micro-dust speckle veil with gentle golden breathing */}
      <div className="vintage-dust-ambient-veil" />

      {/* Floating Individual Vintage Dust Particles */}
      {particles.map((p) => {
        const animName =
          p.animType === 1
            ? 'vintageDustDrift1'
            : p.animType === 2
            ? 'vintageDustDrift2'
            : 'vintageDustDrift3';

        return (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: '9999px',
              boxShadow: p.glow
                ? `0 0 ${p.size * 2}px rgba(212, 175, 55, 0.65)`
                : 'none',
              animation: `${animName} ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
});

VintageDustOverlay.displayName = 'VintageDustOverlay';
