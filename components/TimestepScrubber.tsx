"use client";

import { useEffect, useRef } from "react";
import { useSimulatorStore } from "@/state/simulatorStore";
import PlaybackControls from "./PlaybackControls";

const NUM_TIMESTEPS = 100;
const BASE_INTERVAL_MS = 100;

export default function TimestepScrubber() {
  const { bundle, stepIdx, isPlaying, speed, direction, setStepIdx, setIsPlaying, stepForward } = useSimulatorStore();

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastTickRef.current = performance.now();

    const tick = (timestamp: number) => {
      const interval = BASE_INTERVAL_MS / speed;
      if (timestamp - lastTickRef.current >= interval) {
        lastTickRef.current = timestamp;

        const currentStep = useSimulatorStore.getState().stepIdx;
        const currentDir = useSimulatorStore.getState().direction;

        if (currentDir === "denoise") {
          if (currentStep >= NUM_TIMESTEPS - 1) {
            setIsPlaying(false);
            return;
          }
        } else {
          if (currentStep <= 0) {
            setIsPlaying(false);
            return;
          }
        }

        stepForward();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, speed, setIsPlaying, stepForward]);

  if (!bundle) return null;

  const currentT = bundle.metadata.sampledTimesteps[stepIdx];
  const maxT = bundle.metadata.sampledTimesteps[0];
  const minT = bundle.metadata.sampledTimesteps[NUM_TIMESTEPS - 1];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStepIdx(parseInt(e.target.value, 10));
  };

  return (
    <div className="border border-border-rail bg-bg-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="text-accent font-bold tabular-nums">
            t = <span className="inline-block w-12 text-right">{currentT.toString().padStart(4, "0")}</span>
          </div>
          <PlaybackControls />
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={NUM_TIMESTEPS - 1}
          value={stepIdx}
          onChange={handleSliderChange}
          className="w-full h-6"
        />
        <div className="flex justify-between text-xs text-text-dim mt-1">
          <span>{maxT} (noise)</span>
          <span>{minT} (clean)</span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-text-dim mt-2 border-t border-border-rail pt-2">
        <span>
          {direction === "denoise" ? "DENOISING" : "NOISING"} · {isPlaying ? "RUNNING" : "PAUSED"}
        </span>
        <span>Step {stepIdx + 1} / {NUM_TIMESTEPS}</span>
      </div>
    </div>
  );
}
