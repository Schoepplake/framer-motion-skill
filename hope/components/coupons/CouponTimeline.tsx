"use client";

/**
 * CouponTimeline — visuelle Darstellung der Zeitabdeckung durch Coupon-Sofortgewinne.
 *
 * Visualisiert REQ-UC07-006 / NFR-USAB-006 / OP-UC07-004:
 * Zeigt den gesamten Missionszeitraum als horizontale Leiste mit farbigen
 * Segmenten (grün = abgedeckt, rot = Lücke). Animierte Segmentbreiten via framer-motion.
 * Auf Hover erscheint ein Tooltip mit den abdeckenden Coupons (couponIds → bezeichnung).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "@/lib/domain/types";
import type { CoverageResult, CoverageSegment } from "@/lib/validation";
import { formatDate, formatDateRange } from "@/lib/format";
import { cn } from "@/components/ui/cn";
import { Callout } from "@/components/ui/Callout";
import { ProgressBar } from "@/components/ui/ProgressBar";

export interface CouponTimelineProps {
  mission: Mission;
  coverage: CoverageResult;
}

interface ActiveTooltip {
  segment: CoverageSegment;
  /** Pixel-Offset von der linken Kante des Balken-Containers */
  x: number;
}

export function CouponTimeline({ mission, coverage }: CouponTimelineProps) {
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);

  /* --- Kein gültiger Zeitraum --- */
  if (!coverage.zeitraumGueltig) {
    return (
      <Callout tone="info" title="Missionszeitraum nicht vollständig">
        Bitte vervollständigen Sie zuerst den Missionszeitraum unter „Grunddaten",
        um die Timeline-Abdeckung zu sehen.
      </Callout>
    );
  }

  /* --- Noch keine Segmente --- */
  if (coverage.segmente.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-2 px-4 py-8 text-center text-sm text-fg-muted">
        Noch keine Coupon-Sofortgewinne mit gültigem Ausspielungszeitraum vorhanden.
      </div>
    );
  }

  const pct =
    coverage.tageGesamt > 0
      ? Math.round((coverage.tageAbgedeckt / coverage.tageGesamt) * 100)
      : 0;

  const couponById = new Map(mission.couponSofortgewinne.map((c) => [c.id, c]));

  return (
    <div className="space-y-4">
      {/* Legende & Titel */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-fg">Abdeckungs-Timeline</p>
        <div className="flex items-center gap-4 text-xs text-fg-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 shrink-0 rounded-sm bg-success" />
            Abgedeckt
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 shrink-0 rounded-sm bg-danger" />
            Lücke
          </span>
        </div>
      </div>

      {/* Zeitachse */}
      <div>
        {/* Start-/End-Datum */}
        <div className="mb-1 flex justify-between text-[11px] text-fg-muted">
          <span>{formatDate(mission.grunddaten.zeitraum.von)}</span>
          <span>{formatDate(mission.grunddaten.zeitraum.bis)}</span>
        </div>

        {/* Balken-Container */}
        <div
          className="relative flex h-10 w-full overflow-visible rounded-lg"
          onMouseLeave={() => setActiveTooltip(null)}
        >
          {/* Segmentleiste (overflow-hidden für abgerundete Ecken) */}
          <div className="flex h-full w-full overflow-hidden rounded-lg">
            {coverage.segmente.map((seg, idx) => {
              const widthPct =
                coverage.tageGesamt > 0
                  ? (seg.tage / coverage.tageGesamt) * 100
                  : 0;

              return (
                <motion.div
                  key={`${seg.von}__${seg.bis}`}
                  className={cn(
                    "relative h-full cursor-default border-r border-white/20 last:border-r-0",
                    "transition-[filter] hover:brightness-90",
                    seg.abgedeckt ? "bg-success" : "bg-danger",
                  )}
                  style={{ width: `${widthPct}%` }}
                  /* Segmentbreite von 0 auf Ziel animieren */
                  initial={{ scaleX: 0, originX: "0%" }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.055,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onMouseEnter={(e) => {
                    const containerEl = (
                      e.currentTarget as HTMLElement
                    ).closest(".relative") as HTMLElement | null;
                    const containerRect = containerEl?.getBoundingClientRect();
                    const segRect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    const centerX =
                      segRect.left -
                      (containerRect?.left ?? 0) +
                      segRect.width / 2;
                    setActiveTooltip({ segment: seg, x: centerX });
                  }}
                >
                  {/* Tage-Label in breiten Segmenten */}
                  {widthPct > 10 && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white/90 select-none">
                      {seg.tage}d
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Hover-Tooltip (außerhalb des overflow-hidden Containers) */}
          <AnimatePresence>
            {activeTooltip && (
              <motion.div
                key="seg-tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+8px)] z-30 w-52 rounded-xl border border-border bg-surface p-3 shadow-lg"
                style={{
                  left: Math.max(
                    0,
                    Math.min(activeTooltip.x - 104, 9999),
                  ),
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.14 }}
              >
                <p className="mb-1.5 text-[11px] font-semibold text-fg-muted">
                  {formatDateRange(
                    activeTooltip.segment.von,
                    activeTooltip.segment.bis,
                  )}
                  {" "}
                  · {activeTooltip.segment.tage}{" "}
                  {activeTooltip.segment.tage === 1 ? "Tag" : "Tage"}
                </p>

                {activeTooltip.segment.abgedeckt ? (
                  <>
                    <p className="mb-1 text-xs font-medium text-success">
                      Abgedeckt durch:
                    </p>
                    <ul className="space-y-0.5">
                      {activeTooltip.segment.couponIds.map((cid) => {
                        const c = couponById.get(cid);
                        return (
                          <li
                            key={cid}
                            className="flex items-start gap-1.5 text-xs text-fg"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                            <span className="line-clamp-2">
                              {c?.bezeichnung || "Coupon (ohne Bezeichnung)"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <p className="text-xs font-medium text-danger">
                    Keine Coupon-Abdeckung — Lücke!
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gesamt-Tage unter dem Balken */}
        <div className="mt-1 text-center text-[11px] text-fg-muted">
          {coverage.tageGesamt} Tage Missionszeitraum
        </div>
      </div>

      {/* Abdeckungsgrad-Fortschrittsbalken */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>Abdeckungsgrad</span>
          <span className="font-semibold tabular-nums">
            {coverage.tageAbgedeckt} / {coverage.tageGesamt} Tage ({pct} %)
          </span>
        </div>
        <ProgressBar
          value={pct}
          tone={
            coverage.vollstaendigAbgedeckt
              ? "success"
              : pct >= 50
              ? "warning"
              : "danger"
          }
        />
      </div>
    </div>
  );
}
