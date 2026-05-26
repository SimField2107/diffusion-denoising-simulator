"use client";

import DatasetToggle from "./DatasetToggle";

export default function Header() {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary mb-1">
          DIFFUSION MODEL DENOISING SIMULATOR
        </h1>
        <p className="text-text-secondary text-sm">
          reverse the noise · watch coherence emerge from chaos
        </p>
      </div>
      <DatasetToggle />
    </header>
  );
}
