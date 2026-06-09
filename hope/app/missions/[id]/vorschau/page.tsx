"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMission, useValidation, useCoverage } from "@/lib/store/hooks";
import { isKonfigurationEditierbar } from "@/lib/domain/status";
import { getRelevanteScreens } from "@/lib/domain/screens";
import { EditorPage } from "@/components/editor/EditorPage";
import {
  ButtonLink,
  Callout,
  Card,
  CardBody,
  cn,
} from "@/components/ui";
import { FadeIn, StaggerList, StaggerItem } from "@/components/motion";
import { PhoneFrame } from "@/components/preview/PhoneFrame";
import { ScreenPreview } from "@/components/preview/ScreenPreview";

/* ------------------------------------------------------------------ */
/* Screen icon map                                                      */
/* ------------------------------------------------------------------ */

const SCREEN_ICONS: Record<string, string> = {
  play: "▶",
  sparkles: "✦",
  gift: "🎁",
  frown: "☹",
  ticket: "🎟",
  scale: "⚖",
};

function screenIcon(icon: string): string {
  return SCREEN_ICONS[icon] ?? "◉";
}

/* ------------------------------------------------------------------ */
/* Coverage summary                                                     */
/* ------------------------------------------------------------------ */

interface CoverageSummaryProps {
  tageGesamt: number;
  tageAbgedeckt: number;
  vollstaendig: boolean;
  luecken: { von: string; bis: string; tage: number }[];
}

function CoverageSummary({
  tageGesamt,
  tageAbgedeckt,
  vollstaendig,
  luecken,
}: CoverageSummaryProps) {
  const pct = tageGesamt > 0 ? Math.round((tageAbgedeckt / tageGesamt) * 100) : 0;

  return (
    <Callout
      tone={vollstaendig ? "success" : "warning"}
      title={vollstaendig ? "Coupon-Abdeckung vollständig" : "Abdeckungslücken vorhanden"}
    >
      <div className="space-y-1">
        <p className="text-sm">
          {tageAbgedeckt} von {tageGesamt} Tag{tageGesamt === 1 ? "" : "en"} abgedeckt ({pct} %).
          {vollstaendig
            ? " Die Mission ist lückenlos durch Coupons abgedeckt."
            : " Es gibt Zeiträume ohne Coupon-Sofortgewinn."}
        </p>
        {luecken.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-xs">
            {luecken.slice(0, 3).map((l) => (
              <li key={`${l.von}-${l.bis}`} className="flex items-center gap-1">
                <span aria-hidden>→</span>
                <span>
                  Lücke {l.von} – {l.bis} ({l.tage} Tag{l.tage === 1 ? "" : "e"})
                </span>
              </li>
            ))}
            {luecken.length > 3 && (
              <li className="opacity-70">... und {luecken.length - 3} weitere Lücke{luecken.length - 3 === 1 ? "" : "n"}</li>
            )}
          </ul>
        )}
      </div>
    </Callout>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const validation = useValidation(mission);
  const coverage = useCoverage(mission);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!mission) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const screens = getRelevanteScreens(mission);
  const safeIdx = Math.min(activeIdx, screens.length - 1);
  const activeScreen = screens[safeIdx];

  const inhalteIssues = validation?.byArea.inhalte ?? [];
  const activeScreenIssues = inhalteIssues.filter(
    (i) => i.refId === activeScreen.id,
  );
  const activeScreenHasErrors =
    activeScreenIssues.some((i) => i.severity === "error") ||
    activeScreenIssues.some((i) => i.severity === "warning");

  const screenContent = mission.appContent.screens[activeScreen.id] ?? {};
  const { styling } = mission.appContent;

  return (
    <EditorPage
      ucId="UC08"
      title="App-Vorschau"
      description="Fachlich-repräsentative Vorschau der PENNY App Screens basierend auf den aktuellen Inhaltsdaten. Kein pixel-perfektes Abbild — für finale Prüfung auf echtem Gerät testen (OP-UC07-001/003)."
      locked={!editierbar}
      actions={
        <ButtonLink
          href={`/missions/${params.id}/inhalte`}
          variant="outline"
          size="sm"
        >
          ← Inhalte bearbeiten
        </ButtonLink>
      }
    >
      <StaggerList className="space-y-6">
        {/* Notice callout */}
        <StaggerItem>
          <FadeIn>
            <Callout tone="info" title="Vorschauhinweis (OP-UC07-001/003)">
              Diese Vorschau ist fachlich repräsentativ, aber kein pixel-perfektes Abbild der App.
              Tatsächliche Darstellung kann je nach Gerät und App-Version abweichen.
              Finale Prüfung auf echtem Gerät empfohlen.
            </Callout>
          </FadeIn>
        </StaggerItem>

        {/* Coverage summary */}
        {coverage && (
          <StaggerItem>
            <FadeIn delay={0.05}>
              <CoverageSummary
                tageGesamt={coverage.tageGesamt}
                tageAbgedeckt={coverage.tageAbgedeckt}
                vollstaendig={coverage.vollstaendigAbgedeckt}
                luecken={coverage.luecken}
              />
            </FadeIn>
          </StaggerItem>
        )}

        {/* Main preview area */}
        <StaggerItem>
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-10">
              {/* Phone + screen switcher */}
              <div className="flex flex-col items-center gap-6">
                {/* Screen tab switcher */}
                <div className="flex flex-wrap justify-center gap-2 px-2">
                  {screens.map((screen, idx) => {
                    const screenIssues = inhalteIssues.filter((i) => i.refId === screen.id);
                    const hasErr = screenIssues.some(
                      (i) => i.severity === "error" || i.severity === "warning",
                    );
                    const isActive = idx === safeIdx;
                    return (
                      <button
                        key={screen.id}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                          isActive
                            ? "bg-primary text-primary-fg shadow-sm"
                            : "bg-surface-2 text-fg-muted hover:bg-border/60 hover:text-fg",
                        )}
                      >
                        <span aria-hidden>{screenIcon(screen.icon)}</span>
                        <span>{screen.name}</span>
                        {hasErr && !isActive && (
                          <span
                            className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-warning text-[9px] font-bold text-white shadow"
                            aria-label="Hat Hinweise"
                          >
                            !
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Phone frame with animated screen transitions */}
                <PhoneFrame>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeScreen.id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ScreenPreview
                        screen={activeScreen}
                        content={screenContent}
                        styling={styling}
                        issues={activeScreenIssues}
                      />
                    </motion.div>
                  </AnimatePresence>
                </PhoneFrame>
              </div>

              {/* Right panel: screen info + issues */}
              <div className="flex w-full flex-1 flex-col gap-4 lg:max-w-sm">
                {/* Screen description */}
                <Card>
                  <CardBody className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-base"
                        aria-hidden
                      >
                        {screenIcon(activeScreen.icon)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-fg">{activeScreen.name}</p>
                        <p className="text-xs text-fg-muted">{activeScreen.beschreibung}</p>
                      </div>
                    </div>

                    {/* Fields summary */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {activeScreen.fields.map((field) => {
                        const val = (screenContent[field.key] ?? "").trim();
                        const filled = val.length > 0;
                        return (
                          <div
                            key={field.key}
                            className={cn(
                              "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs",
                              filled
                                ? "bg-success-soft text-success"
                                : field.required
                                  ? "bg-danger-soft text-danger"
                                  : "bg-surface-2 text-fg-muted",
                            )}
                          >
                            <span aria-hidden>{filled ? "✓" : field.required ? "○" : "–"}</span>
                            <span className="truncate">{field.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>

                {/* Validation issues for this screen */}
                {activeScreenHasErrors && (
                  <FadeIn>
                    <Callout
                      tone={
                        activeScreenIssues.some((i) => i.severity === "error")
                          ? "danger"
                          : "warning"
                      }
                      title="Validierungshinweise für diesen Screen"
                    >
                      <ul className="mt-1 space-y-1 text-xs">
                        {activeScreenIssues.map((issue) => (
                          <li
                            key={`${issue.code}-${issue.field ?? ""}`}
                            className="flex items-start gap-1"
                          >
                            <span aria-hidden className="shrink-0">
                              {issue.severity === "error" ? "⚠" : "!"}
                            </span>
                            <span>{issue.message}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3">
                        <ButtonLink
                          href={`/missions/${params.id}/inhalte`}
                          variant="outline"
                          size="sm"
                        >
                          Zur Eingabestelle →
                        </ButtonLink>
                      </div>
                    </Callout>
                  </FadeIn>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                    disabled={safeIdx === 0}
                    className={cn(
                      "flex-1 rounded-lg border border-border bg-surface py-2 text-xs font-medium text-fg-muted transition-all hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    ← Vorheriger Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((i) => Math.min(screens.length - 1, i + 1))}
                    disabled={safeIdx === screens.length - 1}
                    className={cn(
                      "flex-1 rounded-lg border border-border bg-surface py-2 text-xs font-medium text-fg-muted transition-all hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    Nächster Screen →
                  </button>
                </div>

                {/* Overall inhalte status */}
                {(validation?.byArea.inhalte ?? []).length > 0 && (
                  <FadeIn delay={0.15}>
                    <Callout
                      tone="warning"
                      title={`${validation?.byArea.inhalte.filter((i) => i.severity === "error").length ?? 0} Fehler in allen Screens`}
                    >
                      <p className="text-xs">
                        Es gibt noch offene Validierungsprobleme in den App-Inhalten.
                        Bitte alle Screens prüfen, bevor die Mission veröffentlicht wird.
                      </p>
                      <div className="mt-2">
                        <ButtonLink
                          href={`/missions/${params.id}/inhalte`}
                          variant="outline"
                          size="sm"
                        >
                          Alle Inhalte bearbeiten
                        </ButtonLink>
                      </div>
                    </Callout>
                  </FadeIn>
                )}
              </div>
            </div>
          </FadeIn>
        </StaggerItem>
      </StaggerList>
    </EditorPage>
  );
}
