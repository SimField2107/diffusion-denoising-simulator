"use client";

import { useEffect, useRef } from "react";

interface SparkChartProps {
  data: number[];
  currentIndex: number;
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

export default function SparkChart({
  data,
  currentIndex,
  width = 200,
  height = 40,
  color = "#4FB3A9",
  label,
}: SparkChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;

    const normalize = (v: number) => (v - minVal) / range;

    ctx.beginPath();
    ctx.strokeStyle = "#1F2429";
    ctx.lineWidth = 1;

    for (let i = 0; i < data.length; i++) {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + (1 - normalize(data[i])) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    for (let i = 0; i <= currentIndex && i < data.length; i++) {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + (1 - normalize(data[i])) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    if (currentIndex >= 0 && currentIndex < data.length) {
      const x = padding + (currentIndex / (data.length - 1)) * chartWidth;
      const y = padding + (1 - normalize(data[currentIndex])) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [data, currentIndex, width, height, color]);

  return (
    <div className="flex flex-col">
      {label && <div className="text-[10px] text-text-dim mb-1">{label}</div>}
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="bg-bg-secondary border border-border-rail"
      />
    </div>
  );
}
