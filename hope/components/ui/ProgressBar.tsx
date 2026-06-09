"use client";

import { motion } from "framer-motion";
import { cn } from "./cn";

export interface ProgressBarProps {
  /** Wert 0–100. */
  value: number;
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const TONE: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({ value, tone = "primary", className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <motion.div
        className={cn("h-full rounded-full", TONE[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </div>
  );
}
