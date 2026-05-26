export function computeSNR(alphaBar: number): number {
  if (alphaBar >= 1) return Infinity;
  if (alphaBar <= 0) return 0;
  return alphaBar / (1 - alphaBar);
}

export function computeSNRdB(alphaBar: number): number {
  const snr = computeSNR(alphaBar);
  if (snr <= 0) return -Infinity;
  if (!isFinite(snr)) return Infinity;
  return 10 * Math.log10(snr);
}

export function computeBeta(t: number, betaStart: number, betaEnd: number, totalSteps: number = 1000): number {
  return betaStart + (betaEnd - betaStart) * (t / totalSteps);
}

export function computeAlpha(beta: number): number {
  return 1 - beta;
}

export function computeNoiseFraction(alphaBar: number): number {
  return Math.sqrt(1 - alphaBar);
}

export function computeSignalFraction(alphaBar: number): number {
  return Math.sqrt(alphaBar);
}

export function getPhaseFromSNR(snr: number): {
  name: string;
  description: string;
} {
  if (snr < 0.01) {
    return {
      name: "PURE NOISE",
      description: "Signal is completely dominated by noise. The model sees almost no structure from the original image.",
    };
  }
  if (snr < 0.1) {
    return {
      name: "COARSE STRUCTURE",
      description: "Low-frequency content emerges first. The model commits to global composition before resolving fine detail.",
    };
  }
  if (snr < 1) {
    return {
      name: "DETAIL FORMATION",
      description: "Mid-frequency features crystallize. Edges sharpen and local patterns become coherent.",
    };
  }
  if (snr < 10) {
    return {
      name: "REFINEMENT",
      description: "High-frequency details lock in. The model polishes textures and removes remaining artifacts.",
    };
  }
  return {
    name: "CONVERGED",
    description: "Image has reached final form. Further denoising has diminishing returns.",
  };
}
