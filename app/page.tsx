"use client";

import { useEffect } from "react";
import { useSimulatorStore } from "@/state/simulatorStore";
import Header from "@/components/Header";
import PrimaryInstrument from "@/components/PrimaryInstrument";
import TimestepScrubber from "@/components/TimestepScrubber";
import TrajectorySelector from "@/components/TrajectorySelector";
import MathTelemetry from "@/components/MathTelemetry";
import LatentTrajectoryChart from "@/components/LatentTrajectoryChart";
import PhaseOverlay from "@/components/PhaseOverlay";
import MethodologyFooter from "@/components/MethodologyFooter";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

export default function Home() {
  const { isLoading, error, setDataset } = useSimulatorStore();

  useEffect(() => {
    setDataset("mnist");
  }, [setDataset]);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary font-mono">
      <KeyboardShortcuts />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Header />

        {error && (
          <div className="border border-red-500/50 bg-red-500/10 text-red-400 p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="border border-border-rail bg-bg-panel p-8 text-center">
            <div className="text-text-dim">[ LOADING TRAJECTORY DATA ]</div>
          </div>
        ) : (
          <div className="space-y-6">
            <PrimaryInstrument />
            <TimestepScrubber />
            <TrajectorySelector />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MathTelemetry />
              <LatentTrajectoryChart />
            </div>

            <PhaseOverlay />

            <div className="text-xs text-text-dim border border-border-rail bg-bg-panel p-3">
              <span className="text-text-secondary">Keyboard:</span>{" "}
              <span className="text-accent">Space</span> play/pause ·{" "}
              <span className="text-accent">←/→</span> step ·{" "}
              <span className="text-accent">R</span> reset ·{" "}
              <span className="text-accent">1-4</span> speed
            </div>
          </div>
        )}

        <MethodologyFooter />
      </div>
    </main>
  );
}
