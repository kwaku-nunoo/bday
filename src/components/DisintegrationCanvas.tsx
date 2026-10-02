import React, { useEffect, useRef } from 'react';

interface DisintegrationProps {
  imageSrc: string;
  sourceRect: DOMRect | null;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  decay: number;
  isGoldEmber: boolean;
}

export const DisintegrationCanvas: React.FC<DisintegrationProps> = ({
  imageSrc,
  sourceRect,
  onComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceRect) {
      onComplete();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onComplete();
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    let animId: number;

    img.onload = () => {
      // Create off-screen canvas to sample image colors
      const sampleCanvas = document.createElement('canvas');
      const sampleCtx = sampleCanvas.getContext('2d');
      const sampleWidth = Math.floor(sourceRect.width);
      const sampleHeight = Math.floor(sourceRect.height);

      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;

      if (!sampleCtx) {
        onComplete();
        return;
      }

      sampleCtx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

      let imgData: ImageData;
      try {
        imgData = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
      } catch {
        // Fallback if cross-origin tainted
        onComplete();
        return;
      }

      const particles: Particle[] = [];
      const step = Math.max(6, Math.floor(sampleWidth / 45)); // Granularity

      for (let y = 0; y < sampleHeight; y += step) {
        for (let x = 0; x < sampleWidth; x += step) {
          const pixelIndex = (y * sampleWidth + x) * 4;
          const r = imgData.data[pixelIndex];
          const g = imgData.data[pixelIndex + 1];
          const b = imgData.data[pixelIndex + 2];
          const a = imgData.data[pixelIndex + 3] / 255;

          if (a > 0.1) {
            const worldX = sourceRect.left + x;
            const worldY = sourceRect.top + y;
            const angle = (Math.random() - 0.5) * Math.PI * 0.8 - Math.PI * 0.5; // Upward-biased explosion
            const speed = 2.5 + Math.random() * 6.5;

            // Occasional golden ember sparkle
            const isGold = Math.random() < 0.22;

            particles.push({
              x: worldX,
              y: worldY,
              vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
              vy: Math.sin(angle) * speed - (1.5 + Math.random() * 2.5), // Rising thermal wind
              size: (step * 0.9) * (0.8 + Math.random() * 0.6),
              color: isGold ? '#F3D27C' : `rgb(${r},${g},${b})`,
              alpha: 1,
              rotation: Math.random() * Math.PI,
              rotSpeed: (Math.random() - 0.5) * 0.25,
              decay: 0.012 + Math.random() * 0.016,
              isGoldEmber: isGold,
            });
          }
        }
      }

      // Add extra fine golden dust motes
      for (let i = 0; i < 90; i++) {
        const worldX = sourceRect.left + Math.random() * sourceRect.width;
        const worldY = sourceRect.top + Math.random() * sourceRect.height;
        particles.push({
          x: worldX,
          y: worldY,
          vx: (Math.random() - 0.5) * 6,
          vy: -3 - Math.random() * 4,
          size: 2 + Math.random() * 3,
          color: '#FFE29A',
          alpha: 1,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.3,
          decay: 0.014 + Math.random() * 0.018,
          isGoldEmber: true,
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let living = 0;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.alpha <= 0.01) continue;
          living++;

          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          p.alpha -= p.decay;
          // Air resistance & upward buoyancy
          p.vx *= 0.97;
          p.vy *= 0.96;
          p.vy -= 0.04; // Rising smoke effect

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);

          if (p.isGoldEmber) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 6;
          }

          ctx.fillStyle = p.color;
          // Render jagged photographic fragments
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }

        if (living > 0) {
          animId = requestAnimationFrame(animate);
        } else {
          onComplete();
        }
      };

      animate();
    };

    img.onerror = () => {
      onComplete();
    };

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [imageSrc, sourceRect, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
};
