import { cn } from "./cn";

export type CalloutTone = "info" | "success" | "warning" | "danger" | "neutral";

const TONES: Record<CalloutTone, { box: string; icon: string; symbol: string }> = {
  info: { box: "bg-info-soft border-info/20 text-info", icon: "text-info", symbol: "i" },
  success: { box: "bg-success-soft border-success/20 text-success", icon: "text-success", symbol: "✓" },
  warning: { box: "bg-warning-soft border-warning/30 text-warning", icon: "text-warning", symbol: "!" },
  danger: { box: "bg-danger-soft border-danger/20 text-danger", icon: "text-danger", symbol: "⚠" },
  neutral: { box: "bg-surface-2 border-border text-fg-muted", icon: "text-fg-muted", symbol: "•" },
};

export interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Callout({ tone = "info", title, className, children }: CalloutProps) {
  const t = TONES[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", t.box, className)}>
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface/60 text-xs font-bold",
          t.icon,
        )}
        aria-hidden
      >
        {t.symbol}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {children && <div className="leading-relaxed text-fg/80">{children}</div>}
      </div>
    </div>
  );
}
