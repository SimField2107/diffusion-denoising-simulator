"use client";

import { useEffect } from "react";
import { useSimulatorStore } from "@/state/simulatorStore";

export default function KeyboardShortcuts() {
  const { togglePlay, stepForward, stepBackward, reset, setSpeed, speed, bundle } = useSimulatorStore();

  useEffect(() => {
    if (!bundle) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepBackward();
          break;
        case "r":
        case "R":
          e.preventDefault();
          reset();
          break;
        case "1":
          setSpeed(1);
          break;
        case "2":
          setSpeed(2);
          break;
        case "3":
          setSpeed(5);
          break;
        case "4":
          setSpeed(10);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bundle, togglePlay, stepForward, stepBackward, reset, setSpeed, speed]);

  return null;
}
