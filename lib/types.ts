export type Dataset = "mnist" | "cifar";

export interface NormalizationRange {
  min: number;
  max: number;
}

export interface Schedule {
  type: string;
  betaStart: number;
  betaEnd: number;
  alphaBars: number[];
}

export interface StepMetric {
  t: number;
  snr: number;
  epsNorm: number;
  x0Mse: number;
}

export interface TrajectoryMetrics {
  trajId: number;
  perStep: StepMetric[];
}

export interface PCAPoint {
  trajId: number;
  stepIdx: number;
  x: number;
  y: number;
}

export interface PCAData {
  explainedVariance: [number, number];
  points: PCAPoint[];
}

export interface TrajectoryData {
  dataset: Dataset;
  imageSize: number;
  channels: number;
  numTrajectories: number;
  sampledTimesteps: number[];
  schedule: Schedule;
  normalization: {
    x: NormalizationRange;
    eps: NormalizationRange;
    x0pred: NormalizationRange;
  };
  metrics: TrajectoryMetrics[];
  pca: PCAData;
}

export interface DatasetBundle {
  metadata: TrajectoryData;
  framesImage: HTMLImageElement;
  epsImage: HTMLImageElement;
  x0predImage: HTMLImageElement;
}
