"use client";

import { useSimulatorStore } from "@/state/simulatorStore";
import { preloadDataset } from "@/lib/trajectoryStore";
import { Dataset } from "@/lib/types";

const DATASETS: { id: Dataset; label: string }[] = [
  { id: "mnist", label: "MNIST" },
  { id: "cifar", label: "CIFAR-10" },
];

export default function DatasetToggle() {
  const { dataset, setDataset, isLoading } = useSimulatorStore();

  const handleMouseEnter = (id: Dataset) => {
    if (id !== dataset) {
      preloadDataset(id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {DATASETS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setDataset(id)}
          onMouseEnter={() => handleMouseEnter(id)}
          disabled={isLoading}
          className={`px-3 py-1 text-xs border transition-colors disabled:opacity-50 ${
            dataset === id
              ? "border-accent text-accent bg-accent/10"
              : "border-border-rail hover:border-accent hover:text-accent"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
