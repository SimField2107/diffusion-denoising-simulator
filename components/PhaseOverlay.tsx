"use client";

import { useMemo } from "react";
import { useSimulatorStore } from "@/state/simulatorStore";
import { getAlphaBarAtStep } from "@/lib/trajectoryStore";
import { computeSNR, getPhaseFromSNR } from "@/lib/schedule";

export default function PhaseOverlay() {
  const { bundle, stepIdx } = useSimulatorStore();

  const phase = useMemo(() => {
    if (!bundle) return null;
    const alphaBar = getAlphaBarAtStep(bundle, stepIdx);
    const snr = computeSNR(alphaBar);
    return getPhaseFromSNR(snr);
  }, [bundle, stepIdx]);

  if (!phase) return null;

  return (
    <div className="border border-border-rail bg-bg-panel p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-xs text-text-secondary tracking-wider">PHASE:</div>
        <div className="text-accent font-bold">{phase.name}</div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {phase.description}
      </p>

      <div className="border-t border-border-rail pt-3">
        <div className="text-[10px] text-text-dim tracking-wider mb-1">UPDATE RULE</div>
        <div className="text-xs text-text-secondary font-mono">
          x<sub>t-1</sub> = (1/√α<sub>t</sub>) · (x<sub>t</sub> − β<sub>t</sub>/√(1−ᾱ<sub>t</sub>) · ε<sub>θ</sub>) + σ<sub>t</sub>·z
        </div>
      </div>
    </div>
  );
}
