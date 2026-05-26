"use client";

import { useSimulatorStore } from "@/state/simulatorStore";

const SPEEDS = [1, 2, 5, 10];

export default function PlaybackControls() {
  const { isPlaying, speed, direction, togglePlay, stepForward, stepBackward, setSpeed, setDirection, reset } =
    useSimulatorStore();

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <button
          onClick={stepBackward}
          className="px-2 py-1 border border-border-rail hover:border-accent hover:text-accent transition-colors"
          title="Step backward"
        >
          ◀
        </button>

        <button
          onClick={togglePlay}
          className={`px-3 py-1 border transition-colors ${
            isPlaying
              ? "border-accent text-accent bg-accent/10"
              : "border-border-rail hover:border-accent hover:text-accent"
          }`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <button
          onClick={stepForward}
          className="px-2 py-1 border border-border-rail hover:border-accent hover:text-accent transition-colors"
          title="Step forward"
        >
          ▶
        </button>

        <button
          onClick={reset}
          className="px-2 py-1 border border-border-rail hover:border-accent hover:text-accent transition-colors ml-1"
          title="Reset"
        >
          ⏮
        </button>
      </div>

      <div className="h-4 w-px bg-border-rail" />

      <div className="flex items-center gap-2">
        <span className="text-text-dim text-xs">SPEED</span>
        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-xs border transition-colors ${
                speed === s
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border-rail hover:border-accent hover:text-accent"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="h-4 w-px bg-border-rail" />

      <div className="flex items-center gap-2">
        <span className="text-text-dim text-xs">DIR</span>
        <div className="flex">
          <button
            onClick={() => setDirection("denoise")}
            className={`px-2 py-0.5 text-xs border-y border-l transition-colors ${
              direction === "denoise"
                ? "border-accent text-accent bg-accent/10"
                : "border-border-rail hover:border-accent hover:text-accent"
            }`}
            title="Denoise (t → 0)"
          >
            t→0
          </button>
          <button
            onClick={() => setDirection("noise")}
            className={`px-2 py-0.5 text-xs border transition-colors ${
              direction === "noise"
                ? "border-accent text-accent bg-accent/10"
                : "border-border-rail hover:border-accent hover:text-accent"
            }`}
            title="Add noise (0 → t)"
          >
            0→t
          </button>
        </div>
      </div>
    </div>
  );
}
