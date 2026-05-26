"use client";

import { useMemo } from "react";
import { useSimulatorStore } from "@/state/simulatorStore";
import { getMetricAtStep, getAlphaBarAtStep, getBetaAtStep } from "@/lib/trajectoryStore";
import { computeSNR, computeSignalFraction, computeNoiseFraction } from "@/lib/schedule";
import { formatScientific, formatFixed } from "@/lib/format";
import LiveMetric from "./LiveMetric";
import SparkChart from "./SparkChart";

export default function MathTelemetry() {
  const { bundle, trajId, stepIdx } = useSimulatorStore();

  const metrics = useMemo(() => {
    if (!bundle) return null;
    return getMetricAtStep(bundle, trajId, stepIdx);
  }, [bundle, trajId, stepIdx]);

  const alphaBar = useMemo(() => {
    if (!bundle) return 0;
    return getAlphaBarAtStep(bundle, stepIdx);
  }, [bundle, stepIdx]);

  const beta = useMemo(() => {
    if (!bundle) return 0;
    return getBetaAtStep(bundle, stepIdx);
  }, [bundle, stepIdx]);

  const snrData = useMemo(() => {
    if (!bundle) return [];
    const traj = bundle.metadata.metrics.find((m) => m.trajId === trajId);
    if (!traj) return [];
    return traj.perStep.map((s) => Math.log10(s.snr + 1e-10));
  }, [bundle, trajId]);

  const x0MseData = useMemo(() => {
    if (!bundle) return [];
    const traj = bundle.metadata.metrics.find((m) => m.trajId === trajId);
    if (!traj) return [];
    return traj.perStep.map((s) => s.x0Mse);
  }, [bundle, trajId]);

  if (!bundle || !metrics) {
    return (
      <div className="border border-border-rail bg-bg-panel p-4">
        <div className="text-text-dim text-sm">Loading telemetry...</div>
      </div>
    );
  }

  const snr = computeSNR(alphaBar);
  const signalFrac = computeSignalFraction(alphaBar);
  const noiseFrac = computeNoiseFraction(alphaBar);

  return (
    <div className="border border-border-rail bg-bg-panel p-4">
      <div className="text-xs text-text-secondary tracking-wider mb-3 pb-2 border-b border-border-rail">
        TELEMETRY
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <LiveMetric label="t" value={metrics.t.toString()} />
          <LiveMetric label="β_t" value={formatScientific(beta)} />
          <LiveMetric label="ᾱ_t" value={formatFixed(alphaBar, 5)} />
          <LiveMetric label="SNR" value={formatScientific(snr)} />
          <LiveMetric label="√ᾱ_t (signal)" value={formatFixed(signalFrac, 4)} />
          <LiveMetric label="√(1-ᾱ_t) (noise)" value={formatFixed(noiseFrac, 4)} />
          <LiveMetric label="||ε_θ||" value={formatFixed(metrics.epsNorm, 2)} />
          <LiveMetric label="MSE(x̂_0, x_0)" value={formatScientific(metrics.x0Mse)} />
        </div>

        <div className="space-y-4">
          <SparkChart
            data={snrData}
            currentIndex={stepIdx}
            width={200}
            height={50}
            label="log₁₀(SNR) vs step"
          />
          <SparkChart
            data={x0MseData}
            currentIndex={stepIdx}
            width={200}
            height={50}
            label="MSE(x̂_0, x_0) vs step"
            color="#6B8E8A"
          />
        </div>
      </div>
    </div>
  );
}
