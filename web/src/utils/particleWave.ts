export interface ParticleSeed {
  /** Normalized horizontal coordinate [0..1] */
  x: number;
  /** Strand vertical normalized factor [-1..1] */
  strand: number;
  /** Depth layer [0..1] */
  depth: number;
  /** Individual dot radius in CSS px */
  radius: number;
  /** Phase offset in radians */
  phase: number;
  /** Speed multiplier */
  speed: number;
  /** Whether dot belongs to structured ribbon strands vs ambient starfield */
  isRibbon: boolean;
  /** Color bucket index (0: sky/cyan, 1: indigo/azure, 2: rose/ice) */
  colorIndex: number;
  /** Alpha tier bucket (0..2) */
  alphaTier: number;
  /** Ambient vertical drift offset [-1..1] */
  ambientOffset: number;
}

/** Deterministic PRNG (Mulberry32) so particle layouts stay stable without render-loop randomness */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateParticleSeeds(count: number, seed = 4219): ParticleSeed[] {
  const rng = createSeededRng(seed);
  const particles: ParticleSeed[] = new Array(count);

  const ribbonCount = 18;
  const structuredTarget = Math.floor(count * 0.84);
  const dotsPerStrand = Math.max(1, Math.floor(structuredTarget / ribbonCount));

  for (let i = 0; i < count; i++) {
    const isRibbon = i < ribbonCount * dotsPerStrand;
    if (isRibbon) {
      const strandIndex = Math.floor(i / dotsPerStrand);
      const dotIndex = i % dotsPerStrand;
      const strand = (strandIndex / (ribbonCount - 1)) * 2 - 1;
      // Tightly spaced micro-pinpoints along each curved stream
      const x = (dotIndex + rng() * 0.25) / dotsPerStrand;
      const depth = 0.42 + 0.58 * (1 - Math.abs(strand) * 0.65);

      particles[i] = {
        x: x % 1,
        strand,
        depth,
        radius: 0.72 + depth * 0.52,
        phase: strandIndex * 0.22,
        speed: 1,
        isRibbon: true,
        colorIndex: strandIndex % 3,
        alphaTier: depth > 0.78 ? 2 : depth > 0.54 ? 1 : 0,
        ambientOffset: 0
      };
    } else {
      const depth = rng();
      particles[i] = {
        x: rng(),
        strand: rng() * 2 - 1,
        depth,
        radius: 0.65 + rng() * 0.45,
        phase: rng() * Math.PI * 2,
        speed: 0.45 + rng() * 0.5,
        isRibbon: false,
        colorIndex: i % 3,
        alphaTier: depth > 0.72 ? 1 : 0,
        ambientOffset: rng() * 2 - 1
      };
    }
  }

  return particles;
}

/**
 * Computes the pinched hourglass wave envelope matching the LangChain/LangSmith
 * flowing particle ribbon silhouette.
 */
export function computePinchedWavePoint(
  nx: number,
  strand: number,
  time: number,
  phase: number,
  isRibbon: boolean,
  ambientOffset: number,
  width: number,
  height: number,
  pointerOffsetX: number,
  pointerOffsetY: number,
  energyBoost: number
): { px: number; py: number; alphaScale: number } {
  // Pinch focal throat sits in the open upper-right hero corridor (~68% across width)
  const pinchX = 0.68 + pointerOffsetX * 0.035;
  const distFromPinch = nx - pinchX;

  // Envelope pinches tightly at pinchX and opens broadly across left mist and right braided arc
  const throat = 0.012 + 0.008 * Math.sin(time * 0.8 + strand * 1.4);
  const flareLeft = distFromPinch < 0 ? Math.pow(Math.abs(distFromPinch), 1.35) * 0.56 : 0;
  const flareRight = distFromPinch >= 0 ? Math.sin(Math.min(1, distFromPinch / 0.32) * Math.PI * 0.72) * 0.22 : 0;
  const envelope = throat + flareLeft + flareRight;

  // Smooth travelling wave propagating from left toward the pinched focal throat and out right
  const waveSpeed = 1.25 + energyBoost * 1.6;
  const primaryRipple = Math.sin(nx * 5.6 - time * waveSpeed + phase) * (0.024 + 0.018 * energyBoost);
  const secondaryRipple = Math.cos(nx * 2.8 + time * 0.55 - strand * 1.6) * 0.014;

  // Positioned cleanly in the upper hero ribbon (~16%..20% of workspace height) so it's immediately visible
  const baseLineY = 0.16 + nx * 0.02 + pointerOffsetY * 0.025;

  let ny: number;
  let alphaScale: number;

  if (isRibbon) {
    ny = baseLineY + strand * envelope + primaryRipple + secondaryRipple;
    const proximityToThroat = Math.exp(-Math.pow(distFromPinch / 0.18, 2));
    alphaScale = 0.72 + proximityToThroat * 0.28;
  } else {
    // Sparse ambient constellation drifting gently across the rest of the canvas
    const drift = Math.sin(time * 0.35 + phase) * 0.03;
    ny = 0.42 + ambientOffset * 0.45 + drift + pointerOffsetY * 0.015;
    alphaScale = 0.38 + Math.max(0, 1 - nx) * 0.2;
  }

  return {
    px: nx * width,
    py: ny * height,
    alphaScale
  };
}
