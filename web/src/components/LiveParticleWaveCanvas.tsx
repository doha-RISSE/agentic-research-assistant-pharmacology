import { useEffect, useRef } from 'react';
import {
  computePinchedWavePoint,
  generateParticleSeeds,
  type ParticleSeed
} from '../utils/particleWave';

interface LiveParticleWaveCanvasProps {
  variant: 'material-light' | 'obsidian';
  isSearching?: boolean;
  className?: string;
}

const LIGHT_PALETTE: readonly [number, number, number][] = [
  [37, 99, 235],  // crisp cobalt-sky
  [99, 102, 241], // vibrant indigo-periwinkle
  [219, 39, 119]  // vivid rose accent
];

const OBSIDIAN_PALETTE: readonly [number, number, number][] = [
  [125, 211, 252], // luminous ice-cyan
  [56, 189, 248],  // electric sky
  [147, 197, 253]  // soft azure
];

export function LiveParticleWaveCanvas({
  variant,
  isSearching = false,
  className = ''
}: LiveParticleWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchingRef = useRef(isSearching);
  const pointerRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });
  const seedsRef = useRef<ParticleSeed[] | null>(null);

  useEffect(() => {
    searchingRef.current = isSearching;
  }, [isSearching]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!seedsRef.current) {
      seedsRef.current = generateParticleSeeds(1200);
    }
    const seeds = seedsRef.current;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!width || !height) return;
      pointerRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let rafId = 0;
    let lastTs = performance.now();
    let lastDrawTs = 0;
    let simTime = 0;
    let energyBoost = searchingRef.current ? 1 : 0;

    const palette = variant === 'obsidian' ? OBSIDIAN_PALETTE : LIGHT_PALETTE;
    const tierAlphas =
      variant === 'obsidian'
        ? [0.24, 0.52, 0.86]
        : [0.14, 0.3, 0.52];

    // Pre-allocated bucket coordinate buffers (3 colors x 3 alpha tiers = 9 batches max)
    const buckets: number[][] = Array.from({ length: 9 }, () => []);

    const renderFrame = (now: number) => {
      if (lastDrawTs !== 0 && now - lastDrawTs < 32) {
        if (!prefersReducedMotion) {
          rafId = window.requestAnimationFrame(renderFrame);
        }
        return;
      }
      lastDrawTs = now;

      const dt = Math.min(0.06, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      if (!document.hidden) {
        const targetEnergy = searchingRef.current ? 1 : 0;
        energyBoost += (targetEnergy - energyBoost) * Math.min(1, dt * 1.45);

        const ptr = pointerRef.current;
        ptr.currentX += (ptr.targetX - ptr.currentX) * Math.min(1, dt * 2.5);
        ptr.currentY += (ptr.targetY - ptr.currentY) * Math.min(1, dt * 2.5);

        simTime += dt * (0.44 + energyBoost * 0.34);

        ctx.clearRect(0, 0, width, height);

        for (let b = 0; b < 9; b++) {
          buckets[b].length = 0;
        }

        const radiusScale = 1 + energyBoost * 0.14;

        for (let i = 0; i < seeds.length; i++) {
          const p = seeds[i];
          const flowSpeed = (p.isRibbon ? 0.036 : 0.01) * p.speed * (1 + energyBoost * 0.45);
          const nx = (p.x + simTime * flowSpeed) % 1;

          const { px, py } = computePinchedWavePoint(
            nx,
            p.strand,
            simTime,
            p.phase,
            p.isRibbon,
            p.ambientOffset,
            width,
            height,
            ptr.currentX,
            ptr.currentY,
            energyBoost
          );

          if (py < -12 || py > height + 12) continue;

          // Keep left hero headline crisp while letting the right-hand pinched ribbon shine
          const leftTextQuietZone = nx < 0.36 && py < 190 ? 0 : p.alphaTier;
          const edgeFade = nx < 0.04 || nx > 0.96 ? 0 : leftTextQuietZone;
          const boostedTier = energyBoost > 0.35 && p.isRibbon ? Math.min(2, edgeFade + 1) : edgeFade;
          const bucketIdx = p.colorIndex * 3 + boostedTier;
          const r = p.radius * radiusScale;

          buckets[bucketIdx].push(px, py, r);
        }

        for (let c = 0; c < 3; c++) {
          const [r, g, b] = palette[c];
          for (let t = 0; t < 3; t++) {
            const coords = buckets[c * 3 + t];
            if (coords.length === 0) continue;

            const alpha = Math.min(0.95, tierAlphas[t] * (1 + energyBoost * 0.28));
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
            for (let k = 0; k < coords.length; k += 3) {
              const cx = coords[k];
              const cy = coords[k + 1];
              const size = coords[k + 2] * 1.65;
              ctx.fillRect(cx - size * 0.5, cy - size * 0.5, size, size);
            }
          }
        }
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame(lastTs);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
