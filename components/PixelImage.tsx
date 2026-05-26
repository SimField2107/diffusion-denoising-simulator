"use client";

import { useEffect, useRef } from "react";

interface PixelImageProps {
  spriteSheet: HTMLImageElement | null;
  row: number;
  col: number;
  cellWidth: number;
  cellHeight: number;
  displaySize?: number;
  className?: string;
}

export default function PixelImage({
  spriteSheet,
  row,
  col,
  cellWidth,
  cellHeight,
  displaySize = 160,
  className = "",
}: PixelImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteSheet) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, displaySize, displaySize);

    const sx = col * cellWidth;
    const sy = row * cellHeight;

    ctx.drawImage(spriteSheet, sx, sy, cellWidth, cellHeight, 0, 0, displaySize, displaySize);
  }, [spriteSheet, row, col, cellWidth, cellHeight, displaySize]);

  return (
    <canvas
      ref={canvasRef}
      width={displaySize}
      height={displaySize}
      className={`bg-bg-secondary ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
