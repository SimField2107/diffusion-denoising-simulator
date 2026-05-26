"use client";

import { useEffect, useRef, useMemo } from "react";
import { useSimulatorStore } from "@/state/simulatorStore";
import { getPCAPointsForTrajectory } from "@/lib/trajectoryStore";

const CHART_WIDTH = 300;
const CHART_HEIGHT = 200;
const PADDING = 20;

export default function LatentTrajectoryChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { bundle, trajId, stepIdx } = useSimulatorStore();

  const allPoints = useMemo(() => {
    if (!bundle) return [];
    return bundle.metadata.pca.points;
  }, [bundle]);

  const trajectoryPoints = useMemo(() => {
    if (!bundle) return [];
    return getPCAPointsForTrajectory(bundle, trajId);
  }, [bundle, trajId]);

  const bounds = useMemo(() => {
    if (allPoints.length === 0) {
      return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    for (const p of allPoints) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    const padX = (maxX - minX) * 0.1;
    const padY = (maxY - minY) * 0.1;

    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY,
    };
  }, [allPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bundle) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CHART_WIDTH * dpr;
    canvas.height = CHART_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#111316";
    ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

    const chartW = CHART_WIDTH - PADDING * 2;
    const chartH = CHART_HEIGHT - PADDING * 2;

    const toCanvasX = (x: number) =>
      PADDING + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * chartW;
    const toCanvasY = (y: number) =>
      PADDING + (1 - (y - bounds.minY) / (bounds.maxY - bounds.minY)) * chartH;

    ctx.fillStyle = "#1F2429";
    for (const p of allPoints) {
      if (p.trajId === trajId) continue;
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (trajectoryPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "#3d8a82";
      ctx.lineWidth = 1;

      for (let i = 0; i < trajectoryPoints.length; i++) {
        const p = trajectoryPoints[i];
        const cx = toCanvasX(p.x);
        const cy = toCanvasY(p.y);

        if (i === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "#4FB3A9";
      ctx.lineWidth = 2;

      for (let i = 0; i <= stepIdx && i < trajectoryPoints.length; i++) {
        const p = trajectoryPoints[i];
        const cx = toCanvasX(p.x);
        const cy = toCanvasY(p.y);

        if (i === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
    }

    for (let i = 0; i < trajectoryPoints.length; i++) {
      const p = trajectoryPoints[i];
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);

      if (i === stepIdx) {
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#4FB3A9";
        ctx.fill();
        ctx.strokeStyle = "#0B0C0E";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (i === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#6B8E8A";
        ctx.fill();
      } else if (i === trajectoryPoints.length - 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#4FB3A9";
        ctx.fill();
      }
    }

    ctx.fillStyle = "#5f6368";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("noise (t=max)", toCanvasX(trajectoryPoints[0]?.x || 0), CHART_HEIGHT - 4);

    const lastP = trajectoryPoints[trajectoryPoints.length - 1];
    if (lastP) {
      ctx.fillText("clean (t=0)", toCanvasX(lastP.x), 12);
    }
  }, [bundle, allPoints, trajectoryPoints, bounds, stepIdx, trajId]);

  if (!bundle) {
    return (
      <div className="border border-border-rail bg-bg-panel p-4">
        <div className="text-text-dim text-sm">Loading chart...</div>
      </div>
    );
  }

  const variance = bundle.metadata.pca.explainedVariance;

  return (
    <div className="border border-border-rail bg-bg-panel p-4">
      <div className="text-xs text-text-secondary tracking-wider mb-3 pb-2 border-b border-border-rail">
        LATENT TRAJECTORY (PCA)
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}
        className="border border-border-rail"
      />

      <div className="mt-2 text-[10px] text-text-dim">
        PC1: {(variance[0] * 100).toFixed(1)}% · PC2: {(variance[1] * 100).toFixed(1)}% variance explained
      </div>
    </div>
  );
}
