"use client";

import { useSimulatorStore } from "@/state/simulatorStore";
import PixelImage from "./PixelImage";

interface PaneProps {
  label: string;
  sublabel: string;
  children: React.ReactNode;
}

function InstrumentPane({ label, sublabel, children }: PaneProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="border border-border-rail bg-bg-panel p-3 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent" />
        {children}
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs text-text-secondary tracking-wider">{label}</div>
        <div className="text-[10px] text-text-dim">{sublabel}</div>
      </div>
    </div>
  );
}

export default function PrimaryInstrument() {
  const { bundle, trajId, stepIdx } = useSimulatorStore();

  if (!bundle) {
    return (
      <div className="flex justify-center gap-8 py-8">
        <div className="text-text-dim">Loading instrument...</div>
      </div>
    );
  }

  const { imageSize, numTrajectories } = bundle.metadata;
  const numTimesteps = bundle.metadata.sampledTimesteps.length;
  const currentT = bundle.metadata.sampledTimesteps[stepIdx];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center gap-6 md:gap-10">
        <InstrumentPane label="CURRENT STATE" sublabel={`x_${currentT}`}>
          <PixelImage
            spriteSheet={bundle.framesImage}
            row={trajId}
            col={stepIdx}
            cellWidth={imageSize}
            cellHeight={imageSize}
            displaySize={160}
          />
        </InstrumentPane>

        <InstrumentPane label="PREDICTED NOISE" sublabel="ε_θ(x_t, t)">
          <PixelImage
            spriteSheet={bundle.epsImage}
            row={trajId}
            col={stepIdx}
            cellWidth={imageSize}
            cellHeight={imageSize}
            displaySize={160}
          />
        </InstrumentPane>

        <InstrumentPane label="CLEAN ESTIMATE" sublabel="x̂_0">
          <PixelImage
            spriteSheet={bundle.x0predImage}
            row={trajId}
            col={stepIdx}
            cellWidth={imageSize}
            cellHeight={imageSize}
            displaySize={160}
          />
        </InstrumentPane>
      </div>

      <div className="text-xs text-text-dim">
        Trajectory {trajId + 1}/{numTrajectories} · Step {stepIdx + 1}/{numTimesteps}
      </div>
    </div>
  );
}
