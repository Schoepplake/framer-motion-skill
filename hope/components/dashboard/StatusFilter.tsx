"use client";

import type { MissionStatus } from "@/lib/domain/types";
import { MISSION_STATUS } from "@/lib/domain/types";
import { STATUS_LABEL } from "@/lib/domain/labels";
import { cn } from "@/components/ui";

export type StatusFilterValue = MissionStatus | "alle";

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (v: StatusFilterValue) => void;
}

const ALL_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "alle", label: "Alle" },
  ...MISSION_STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Nach Status filtern"
      className="flex flex-wrap gap-1"
    >
      {ALL_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            value === opt.value
              ? "bg-primary text-primary-fg shadow-sm"
              : "bg-surface-2 text-fg-muted hover:bg-border/70 hover:text-fg border border-border",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
