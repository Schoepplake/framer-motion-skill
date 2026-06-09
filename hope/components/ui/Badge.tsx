import { cn } from "./cn";
import type { StatusTone } from "@/lib/domain/labels";

const TONES: Record<StatusTone, string> = {
  neutral: "bg-surface-2 text-fg-muted border-border",
  info: "bg-info-soft text-info border-info/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/20",
};

export interface BadgeProps {
  tone?: StatusTone;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Kleiner farbiger Punkt, z. B. als Status-Indikator. */
export function Dot({ tone = "neutral" }: { tone?: StatusTone }) {
  const colors: Record<StatusTone, string> = {
    neutral: "bg-muted",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return <span className={cn("h-1.5 w-1.5 rounded-full", colors[tone])} />;
}
