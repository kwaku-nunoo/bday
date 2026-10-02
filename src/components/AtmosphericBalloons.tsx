import React, { useEffect, useRef } from 'react';

interface Balloon {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  highlightColor: string;
  shadowColor: string;
  speed: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
  scale: number;
  alpha: number;
  stringLength: number;
  tilt: number;
  tiltSpeed: number;
}

export const AtmosphericBalloons: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Rich, celebratory color palette with authentic 3D shading
    const balloonPalettes = [
      { base: '#EF4444', highlight: '#FEE2E2', shadow: '#7F1D1D' }, // Crimson Red
      { base: '#3B82F6', highlight: '#DBEAFE', shadow: '#1E3A8A' }, // Royal Blue
      { base: '#F59E0B', highlight: '#FEF3C7', shadow: '#78350F' }, // Golden Amber
      { base: '#10B981', highlight: '#D1FAE5', shadow: '#064E3B' }, // Emerald Green
      { base: '#F97316', highlight: '#FFEDD5', shadow: '#7C2D12' }, // Tangerine Orange
      { base: '#8B5CF6', highlight: '#EDE9FE', shadow: '#4C1D95' }, // Electric Violet
      { base: '#EC4899', highlight: '#FCE7F3', shadow: '#831843' }, // Hot Pink
      { base: '#06B6D4', highlight: '#CFFAFE', shadow: '#164E63' }, // Vivid Sky Turquoise
      { base: '#A855F7', highlight: '#F3E8FF', shadow: '#581C87' }, // Deep Purple
      { base: '#E11D48', highlight: '#FFE4E6', shadow: '#881337' }, // Ruby Rose
      { base: '#22C55E', highlight: '#DCFCE7', shadow: '#14532D' }, // Bright Mint
      { base: '#EAB308', highlight: '#FEF9C3', shadow: '#713F12' }, // Sunshine Yellow
      { base: '#14B8A6', highlight: '#CCFBF1', shadow: '#134E4A' }, // Ocean Teal
      { base: '#D946EF', highlight: '#FAE8FF', shadow: '#701A75' }, // Radiant Magenta
    ];

    // Plenty of balloons: 50-65 for large screens, 35 for smaller screens
    const isMobile = width < 768;
    const balloonCount = isMobile ? 38 : 64;
    const balloons: Balloon[] = [];

    // Pre-populate across full screen height and slightly beyond for instant abundant flow
    for (let i = 0; i < balloonCount; i++) {
      const palette = balloonPalettes[i % balloonPalettes.length];
      // Three depth tiers: small background, medium midground, large foreground
      const depthTier = i % 3;
      const scale =
        depthTier === 0
          ? 0.45 + Math.random() * 0.18 // background (small)
          : depthTier === 1
          ? 0.65 + Math.random() * 0.22 // midground (medium)
          : 0.9 + Math.random() * 0.28; // foreground (large)

      balloons.push({
        x: Math.random() * width,
        // Stagger vertically across viewport and beneath it
        y: Math.random() * (height * 1.4) - 50,
        radiusX: 24 * scale,
        radiusY: 31 * scale,
        color: palette.base,
        highlightColor: palette.highlight,
        shadowColor: palette.shadow,
        speed: 0.45 + scale * 0.75 + Math.random() * 0.35,
        swaySpeed: 0.012 + Math.random() * 0.015,
        swayAmplitude: 18 + scale * 26 + Math.random() * 20,
        swayOffset: Math.random() * Math.PI * 2,
        scale,
        alpha: depthTier === 0 ? 0.22 : depthTier === 1 ? 0.32 : 0.42,
        stringLength: 48 * scale,
        tilt: (Math.random() - 0.5) * 0.18,
        tiltSpeed: 0.01 + Math.random() * 0.015,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      for (let i = 0; i < balloons.length; i++) {
        const b = balloons[i];
        b.y -= b.speed;
        const currentX =
          b.x + Math.sin(time * b.swaySpeed + b.swayOffset) * b.swayAmplitude;
        const currentTilt =
          b.tilt + Math.sin(time * b.tiltSpeed + b.swayOffset) * 0.08;

        // Reset once balloon floats off top of screen
        if (b.y < -140) {
          b.y = height + 60 + Math.random() * 140;
          b.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.translate(currentX, b.y);
        ctx.rotate(currentTilt);

        const rx = b.radiusX;
        const ry = b.radiusY;

        // 1. Balloon String (Delicate dangling ribbon that wiggles in updraft)
        ctx.beginPath();
        ctx.moveTo(0, ry * 0.95);
        const wave1 = Math.sin(time * 0.04 + i) * (8 * b.scale);
        const wave2 = Math.cos(time * 0.05 + i * 2) * (10 * b.scale);
        ctx.bezierCurveTo(
          wave1,
          ry + b.stringLength * 0.35,
          -wave2,
          ry + b.stringLength * 0.7,
          wave1 * 0.5,
          ry + b.stringLength
        );
        ctx.strokeStyle = 'rgba(235, 220, 200, 0.45)';
        ctx.lineWidth = Math.max(1, 1.2 * b.scale);
        ctx.stroke();

        // 2. Balloon Knot (Small triangular flare at the bottom)
        ctx.beginPath();
        const knotY = ry * 0.92;
        ctx.moveTo(-3 * b.scale, knotY);
        ctx.lineTo(3 * b.scale, knotY);
        ctx.lineTo(4.5 * b.scale, knotY + 5 * b.scale);
        ctx.lineTo(-4.5 * b.scale, knotY + 5 * b.scale);
        ctx.closePath();
        ctx.fillStyle = b.shadowColor;
        ctx.fill();

        // 3. Balloon Body (Smooth curved teardrop geometry)
        ctx.beginPath();
        const topY = -ry;
        const botY = ry * 0.92;
        ctx.moveTo(0, botY);
        // Left side bezier
        ctx.bezierCurveTo(-rx * 1.35, ry * 0.45, -rx * 1.35, topY, 0, topY);
        // Right side bezier
        ctx.bezierCurveTo(rx * 1.35, topY, rx * 1.35, ry * 0.45, 0, botY);
        ctx.closePath();

        // Volumetric 3D Radial Gradient Lighting
        const grad = ctx.createRadialGradient(
          -rx * 0.38,
          -ry * 0.42,
          rx * 0.1,
          0,
          0,
          ry * 1.25
        );
        grad.addColorStop(0, b.highlightColor);
        grad.addColorStop(0.35, b.color);
        grad.addColorStop(0.85, b.shadowColor);
        grad.addColorStop(1, '#0C0605');

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10 * b.scale;
        ctx.shadowOffsetY = 6 * b.scale;
        ctx.fill();

        // 4. Glossy Specular Surface Glint (Curved oval sheen near top-left)
        ctx.beginPath();
        ctx.ellipse(
          -rx * 0.35,
          -ry * 0.42,
          rx * 0.28,
          ry * 0.45,
          -Math.PI / 6,
          0,
          Math.PI * 2
        );
        const specGrad = ctx.createLinearGradient(
          -rx * 0.45,
          -ry * 0.6,
          -rx * 0.2,
          -ry * 0.25
        );
        specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.12)');
        specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = specGrad;
        ctx.fill();

        // Secondary subtle rim reflection on the bottom-right
        ctx.beginPath();
        ctx.arc(rx * 0.45, ry * 0.45, rx * 0.3, 0, Math.PI * 0.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5 * b.scale;
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 filter blur-[5px] sm:blur-[6px] opacity-70 transform-gpu"
      style={{ willChange: 'transform' }}
    />
  );
};
