"use client";

import { create } from "zustand";
import { Dataset, DatasetBundle } from "@/lib/types";
import { loadDataset } from "@/lib/trajectoryStore";

export type PlaybackDirection = "denoise" | "noise";

interface SimulatorState {
  dataset: Dataset;
  bundle: DatasetBundle | null;
  trajId: number;
  stepIdx: number;
  isPlaying: boolean;
  speed: number;
  direction: PlaybackDirection;
  isLoading: boolean;
  error: string | null;

  setDataset: (dataset: Dataset) => Promise<void>;
  setTrajId: (trajId: number) => void;
  setStepIdx: (stepIdx: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: PlaybackDirection) => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
}

const NUM_TIMESTEPS = 100;

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  dataset: "mnist",
  bundle: null,
  trajId: 0,
  stepIdx: 0,
  isPlaying: false,
  speed: 1,
  direction: "denoise",
  isLoading: true,
  error: null,

  setDataset: async (dataset: Dataset) => {
    set({ isLoading: true, error: null });
    try {
      const bundle = await loadDataset(dataset);
      set({ dataset, bundle, isLoading: false, stepIdx: 0 });
    } catch {
      set({ error: `Failed to load ${dataset} data`, isLoading: false });
    }
  },

  setTrajId: (trajId: number) => {
    const { bundle } = get();
    if (bundle && trajId >= 0 && trajId < bundle.metadata.numTrajectories) {
      set({ trajId });
    }
  },

  setStepIdx: (stepIdx: number) => {
    if (stepIdx >= 0 && stepIdx < NUM_TIMESTEPS) {
      set({ stepIdx });
    }
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  setSpeed: (speed: number) => set({ speed }),

  setDirection: (direction: PlaybackDirection) => set({ direction }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  stepForward: () => {
    const { stepIdx, direction } = get();
    if (direction === "denoise") {
      if (stepIdx < NUM_TIMESTEPS - 1) {
        set({ stepIdx: stepIdx + 1 });
      }
    } else {
      if (stepIdx > 0) {
        set({ stepIdx: stepIdx - 1 });
      }
    }
  },

  stepBackward: () => {
    const { stepIdx, direction } = get();
    if (direction === "denoise") {
      if (stepIdx > 0) {
        set({ stepIdx: stepIdx - 1 });
      }
    } else {
      if (stepIdx < NUM_TIMESTEPS - 1) {
        set({ stepIdx: stepIdx + 1 });
      }
    }
  },

  reset: () => {
    const { direction } = get();
    set({ stepIdx: direction === "denoise" ? 0 : NUM_TIMESTEPS - 1, isPlaying: false });
  },
}));
