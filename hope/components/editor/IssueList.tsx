"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ValidationIssue } from "@/lib/validation";
import { cn } from "@/components/ui/cn";

const TONE: Record<ValidationIssue["severity"], string> = {
  error: "bg-danger-soft text-danger border-danger/15",
  warning: "bg-warning-soft text-warning border-warning/25",
  info: "bg-info-soft text-info border-info/15",
};

const SYMBOL: Record<ValidationIssue["severity"], string> = {
  error: "⚠",
  warning: "!",
  info: "i",
};

/** Einheitliche, animierte Darstellung von Validierungs-Issues (VAL-027/028). */
export function IssueList({
  issues,
  className,
}: {
  issues: ValidationIssue[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <AnimatePresence initial={false}>
        {issues.map((issue) => (
          <motion.div
            key={`${issue.code}-${issue.refId ?? ""}-${issue.field ?? ""}-${issue.message}`}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
              TONE[issue.severity],
            )}
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface/70 text-[10px] font-bold">
              {SYMBOL[issue.severity]}
            </span>
            <span className="flex-1 text-fg/80">{issue.message}</span>
            <span className="shrink-0 font-mono text-[10px] opacity-60">{issue.code}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
