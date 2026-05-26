"use client";

interface LiveMetricProps {
  label: string;
  value: string;
  unit?: string;
}

export default function LiveMetric({ label, value, unit }: LiveMetricProps) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1 border-b border-border-rail last:border-b-0">
      <span className="text-text-dim text-xs">{label}</span>
      <span className="text-accent tabular-nums font-bold">
        {value}
        {unit && <span className="text-text-dim font-normal ml-1">{unit}</span>}
      </span>
    </div>
  );
}
