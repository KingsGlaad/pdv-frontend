"use client";
import { useEffect } from "react";

interface ShortcutsHandlerProps {
  onF1?: () => void;
  onF2?: () => void; // Search focus
  onF8?: () => void; // Cashier Functions
  onF9?: () => void; // Finalize
  onEscape?: () => void;
}

export function ShortcutsHandler({
  onF1,
  onF2,
  onF8,
  onF9,
  onEscape,
}: ShortcutsHandlerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "F1":
          e.preventDefault();
          onF1?.();
          break;
        case "F2":
          e.preventDefault();
          onF2?.();
          break;
        case "F8":
          e.preventDefault();
          onF8?.();
          break;
        case "F9":
          e.preventDefault();
          onF9?.();
          break;
        case "Escape":
          e.preventDefault();
          onEscape?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onF1, onF2, onF8, onF9, onEscape]);

  return null;
}
