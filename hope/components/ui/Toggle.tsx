"use client";

import { motion } from "framer-motion";
import { cn } from "./cn";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function Toggle({ checked, onChange, disabled, label, id }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow",
          checked ? "ml-[22px]" : "ml-0.5",
        )}
      />
    </button>
  );
}
