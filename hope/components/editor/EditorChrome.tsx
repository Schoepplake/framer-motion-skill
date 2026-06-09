"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useMission, useValidation, useLoaded } from "@/lib/store/hooks";
import type { ValidationArea } from "@/lib/validation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { formatDateTime } from "@/lib/format";
import { isKonfigurationEditierbar } from "@/lib/domain/status";

interface TabDef {
  seg: string;
  label: string;
  areas: ValidationArea[];
}

const TABS: TabDef[] = [
  { seg: "grunddaten", label: "Grunddaten", areas: ["grunddaten"] },
  { seg: "mechanik", label: "Mechanik", areas: ["mechanik"] },
  { seg: "coupons", label: "Coupon-Sofortgewinne", areas: ["coupons"] },
  { seg: "ergebnisarten", label: "Ergebnisarten", areas: ["ergebnisarten", "operativ"] },
  { seg: "lostopf", label: "Lostopf", areas: ["lostopf"] },
  { seg: "inhalte", label: "App-Inhalte", areas: ["inhalte"] },
  { seg: "vorschau", label: "Vorschau", areas: [] },
  { seg: "review", label: "Review & Veröffentlichung", areas: [] },
  { seg: "audit", label: "Audit Trail", areas: [] },
];

export function EditorChrome({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const loaded = useLoaded();
  const mission = useMission(id);
  const validation = useValidation(mission);
  const pathname = usePathname();
  const activeSeg = pathname?.split("/")[3] ?? "grunddaten";

  if (!loaded) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-10 animate-pulse rounded-xl bg-surface-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm font-semibold text-fg">Mission nicht gefunden</p>
        <p className="mt-1 text-sm text-fg-muted">
          Die Mission „{id}“ existiert nicht oder wurde gelöscht.
        </p>
        <ButtonLink href="/" variant="outline" className="mt-4">
          Zur Übersicht
        </ButtonLink>
      </div>
    );
  }

  const totalErrors = validation?.errors.length ?? 0;
  const editierbar = isKonfigurationEditierbar(mission);

  const errorsForAreas = (areas: ValidationArea[]) =>
    areas.reduce(
      (sum, a) => sum + (validation?.byArea[a]?.filter((i) => i.severity === "error").length ?? 0),
      0,
    );

  return (
    <div className="space-y-5">
      {/* Kopfbereich */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg focus-ring rounded"
        >
          ← Alle Missionen
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-xl font-bold tracking-tight text-fg">
                {mission.grunddaten.missionsName || "Unbenannte Mission"}
              </h1>
              <StatusBadge status={mission.status} />
            </div>
            <p className="mt-1 text-sm text-fg-muted">
              <span className="font-mono">{mission.id}</span> · Gewinnspiel ·
              zuletzt geändert {formatDateTime(mission.geaendertAm)} von {mission.geaendertVon}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editierbar && (
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  totalErrors > 0
                    ? "border-danger/20 bg-danger-soft text-danger"
                    : "border-success/20 bg-success-soft text-success",
                )}
              >
                {totalErrors > 0
                  ? `${totalErrors} offene${totalErrors === 1 ? "r Punkt" : " Punkte"}`
                  : "Bereit zur Veröffentlichung"}
              </span>
            )}
            <ButtonLink href={`/missions/${id}/review`} size="sm">
              Review & Veröffentlichen
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Tab-Navigation mit Validierungs-Badges */}
      <nav className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((tab) => {
          const active = activeSeg === tab.seg;
          const errs = errorsForAreas(tab.areas);
          return (
            <Link
              key={tab.seg}
              href={`/missions/${id}/${tab.seg}`}
              className={cn(
                "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors focus-ring rounded-t-lg",
                active ? "text-primary" : "text-fg-muted hover:text-fg",
              )}
            >
              {tab.label}
              {tab.areas.length > 0 && errs > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {errs}
                </span>
              )}
              {tab.areas.length > 0 && errs === 0 && (
                <span className="text-success" aria-label="vollständig">✓</span>
              )}
              {active && (
                <motion.span
                  layoutId="editor-tab-underline"
                  className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Inhalt der jeweiligen Use-Case-Seite */}
      <div>{children}</div>
    </div>
  );
}
