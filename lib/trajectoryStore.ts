import { Dataset, DatasetBundle, TrajectoryData } from "./types";

const cache: Partial<Record<Dataset, DatasetBundle>> = {};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function loadDataset(dataset: Dataset): Promise<DatasetBundle> {
  if (cache[dataset]) {
    return cache[dataset];
  }

  const basePath = `/data/${dataset}`;

  const [metadata, framesImage, epsImage, x0predImage] = await Promise.all([
    fetch(`${basePath}/trajectories.json`).then((r) => r.json()) as Promise<TrajectoryData>,
    loadImage(`${basePath}/frames.png`),
    loadImage(`${basePath}/eps.png`),
    loadImage(`${basePath}/x0pred.png`),
  ]);

  const bundle: DatasetBundle = {
    metadata,
    framesImage,
    epsImage,
    x0predImage,
  };

  cache[dataset] = bundle;
  return bundle;
}

export function preloadDataset(dataset: Dataset): void {
  loadDataset(dataset).catch(() => {});
}

export function getMetricAtStep(
  bundle: DatasetBundle,
  trajId: number,
  stepIdx: number
): { t: number; snr: number; epsNorm: number; x0Mse: number } | null {
  const traj = bundle.metadata.metrics.find((m) => m.trajId === trajId);
  if (!traj || stepIdx < 0 || stepIdx >= traj.perStep.length) {
    return null;
  }
  return traj.perStep[stepIdx];
}

export function getPCAPointsForTrajectory(bundle: DatasetBundle, trajId: number) {
  return bundle.metadata.pca.points.filter((p) => p.trajId === trajId);
}

export function getAlphaBarAtStep(bundle: DatasetBundle, stepIdx: number): number {
  const alphaBars = bundle.metadata.schedule.alphaBars;
  if (stepIdx < 0 || stepIdx >= alphaBars.length) {
    return 0;
  }
  return alphaBars[stepIdx];
}

export function getBetaAtStep(bundle: DatasetBundle, stepIdx: number): number {
  const { betaStart, betaEnd } = bundle.metadata.schedule;
  const t = bundle.metadata.sampledTimesteps[stepIdx];
  const totalSteps = 1000;
  return betaStart + (betaEnd - betaStart) * (t / totalSteps);
}
