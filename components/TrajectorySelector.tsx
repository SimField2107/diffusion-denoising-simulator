"use client";

import { useSimulatorStore } from "@/state/simulatorStore";
import PixelImage from "./PixelImage";

export default function TrajectorySelector() {
  const { bundle, trajId, setTrajId } = useSimulatorStore();

  if (!bundle) return null;

  const { numTrajectories, imageSize, sampledTimesteps } = bundle.metadata;
  const lastStepIdx = sampledTimesteps.length - 1;

  return (
    <div className="border border-border-rail bg-bg-panel p-4">
      <div className="text-xs text-text-secondary tracking-wider mb-3 pb-2 border-b border-border-rail">
        TRAJECTORIES
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: numTrajectories }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setTrajId(idx)}
            className={`relative border-2 transition-colors ${
              trajId === idx
                ? "border-accent"
                : "border-border-rail hover:border-accent-dim"
            }`}
            title={`Trajectory ${idx + 1}`}
          >
            <PixelImage
              spriteSheet={bundle.x0predImage}
              row={idx}
              col={lastStepIdx}
              cellWidth={imageSize}
              cellHeight={imageSize}
              displaySize={48}
            />
            {trajId === idx && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-2 text-[10px] text-text-dim">
        Click to select trajectory · Showing final clean estimates
      </div>
    </div>
  );
}
