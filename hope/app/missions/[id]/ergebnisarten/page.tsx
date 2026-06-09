"use client";

/**
 * UC05 — Ergebnisarten & Gewinnlogik
 *
 * Konfiguration der möglichen Spielergebnisse (Coupon-Sofortgewinn, Niete, Lostopf)
 * sowie der operativen Werte (Gewinnwahrscheinlichkeit, Gewichtung, Teilnahmelimit).
 *
 * REQ-UC05-005/006/008/009/010, VAL-015/016/017/018, BR-UC05-001/002/003/004/005/006/007
 */

import { useMission, useValidation } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { isKonfigurationEditierbar, kannOperativeWerteAendern } from "@/lib/domain/status";
import {
  ERGEBNISART_LABEL,
  ERGEBNISART_BESCHREIBUNG,
  OPERATIVER_WERT_LABEL,
  OPERATIVER_WERT_EINHEIT,
  OPERATIVER_WERT_HILFE,
} from "@/lib/domain/labels";
import { OPERATIVE_WERT_KEYS, type OperativerWertKey } from "@/lib/domain/types";
import { EditorPage } from "@/components/editor/EditorPage";
import { IssueList } from "@/components/editor/IssueList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Callout } from "@/components/ui/Callout";
import { ButtonLink } from "@/components/ui/Button";
import { StaggerList, StaggerItem } from "@/components/motion/Stagger";

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const setErgebnisarten = useMissionStore((s) => s.setErgebnisarten);
  const setOperativeWerte = useMissionStore((s) => s.setOperativeWerte);
  const validation = useValidation(mission);

  if (!mission) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const operativEditierbar =
    editierbar || kannOperativeWerteAendern(mission);

  const ergebnisartenIssues = validation?.byArea.ergebnisarten ?? [];
  const operativIssues = validation?.byArea.operativ ?? [];

  function operativFieldError(key: OperativerWertKey): string | null {
    return (
      operativIssues.find(
        (i) => i.field === key && i.severity === "error",
      )?.message ?? null
    );
  }

  const { ergebnisarten, operativeWerte } = mission;

  return (
    <EditorPage
      ucId="UC05"
      title="Ergebnisarten &amp; Gewinnlogik"
      description="Konfigurieren Sie die möglichen Spielergebnisse und die operativen Steuerungsparameter der Mission."
      locked={!editierbar && !operativEditierbar}
    >
      <StaggerList className="space-y-5">
        {/* ================================================ */}
        {/* ERGEBNISARTEN                                    */}
        {/* ================================================ */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ergebnisarten</CardTitle>
                <CardDescription>
                  Welche Spielergebnisse sind in dieser Mission möglich?
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Coupon-Sofortgewinn — fest aktiv, nicht deaktivierbar */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">
                    {ERGEBNISART_LABEL.coupon_sofortgewinn}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {ERGEBNISART_BESCHREIBUNG.coupon_sofortgewinn}
                  </p>
                  <p className="mt-1 text-[11px] text-info">
                    Immer aktiv — muss den gesamten Missionszeitraum abdecken (VAL-023).
                  </p>
                </div>
                <div className="shrink-0">
                  <Toggle
                    checked
                    onChange={() => {/* nicht deaktivierbar */}}
                    disabled
                    label="Coupon-Sofortgewinn immer aktiv"
                  />
                </div>
              </div>

              {/* Niete */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">
                    {ERGEBNISART_LABEL.niete}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {ERGEBNISART_BESCHREIBUNG.niete}
                  </p>
                  <p className="mt-1 text-[11px] text-fg-muted">
                    Wenn aktiv: Teilnehmer ohne Gewinn erhalten keine weitere Chance.
                  </p>
                </div>
                <div className="shrink-0">
                  <Toggle
                    id="nieteAktiv"
                    checked={ergebnisarten.nieteAktiv}
                    onChange={(v) =>
                      setErgebnisarten(params.id, { nieteAktiv: v })
                    }
                    disabled={!editierbar}
                    label="Niete aktivieren"
                  />
                </div>
              </div>

              {/* Lostopf */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">
                    {ERGEBNISART_LABEL.lostopf}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {ERGEBNISART_BESCHREIBUNG.lostopf}
                  </p>
                  <p className="mt-1 text-[11px] text-fg-muted">
                    Lostopf-Teilnahme nur bei Nichtgewinn (BR-UC05-003/004).
                  </p>
                  {ergebnisarten.lostopfAktiv && (
                    <ButtonLink
                      href={`/missions/${params.id}/lostopf`}
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-auto p-0 text-xs underline-offset-2 hover:underline"
                    >
                      Lostopf konfigurieren →
                    </ButtonLink>
                  )}
                </div>
                <div className="shrink-0">
                  <Toggle
                    id="lostopfAktiv"
                    checked={ergebnisarten.lostopfAktiv}
                    onChange={(v) =>
                      setErgebnisarten(params.id, { lostopfAktiv: v })
                    }
                    disabled={!editierbar}
                    label="Lostopf aktivieren"
                  />
                </div>
              </div>

              {/* Gegenseitige Ausschließlichkeit */}
              <Callout tone="warning" title="Gegenseitige Ausschließlichkeit (BR-UC05-003/004)">
                Coupon-Sofortgewinn und Lostopf schließen sich für denselben
                Teilnehmer gegenseitig aus: Ein Lostopf-Eintrag erfolgt nur bei
                Nichtgewinn (REQ-UC05-005/006, VAL-018). Die App-Spiellogik löst
                dies auf.
              </Callout>

              {/* Ergebnisarten-Validierungsfehler */}
              {ergebnisartenIssues.length > 0 && (
                <IssueList issues={ergebnisartenIssues} />
              )}
            </CardBody>
          </Card>
        </StaggerItem>

        {/* ================================================ */}
        {/* OPERATIVE WERTE                                  */}
        {/* ================================================ */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Operative Werte</CardTitle>
                <CardDescription>
                  Steuerungsparameter der Gewinnlogik — auch nach Veröffentlichung
                  änderbar (UC12, REQ-UC05-008/009/010).
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Hinweis: Operative Werte nachträglich änderbar */}
              <Callout tone="info">
                Diese Werte können auch nach der Veröffentlichung und während
                einer aktiven Mission jederzeit angepasst werden (UC12).
              </Callout>

              {OPERATIVE_WERT_KEYS.map((key) => {
                const isPercentage = OPERATIVER_WERT_EINHEIT[key] === "%";
                const max = isPercentage ? 100 : 100;
                const value = operativeWerte[key];
                const err = operativFieldError(key);

                return (
                  <Field
                    key={key}
                    label={OPERATIVER_WERT_LABEL[key]}
                    htmlFor={`operativ-${key}`}
                    required
                    help={OPERATIVER_WERT_HILFE[key]}
                    hint={
                      isPercentage
                        ? `Wert zwischen 0 und 100 ${OPERATIVER_WERT_EINHEIT[key]}`
                        : `Wert zwischen 0 und 100`
                    }
                    error={err}
                  >
                    <div className="flex items-center gap-3">
                      {/* Range-Slider */}
                      <input
                        type="range"
                        min={0}
                        max={max}
                        step={1}
                        value={value}
                        disabled={!operativEditierbar}
                        aria-label={OPERATIVER_WERT_LABEL[key]}
                        className="h-2 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-60"
                        onChange={(e) =>
                          setOperativeWerte(params.id, {
                            [key]: Number(e.target.value),
                          })
                        }
                      />
                      {/* Numerisches Eingabefeld */}
                      <div className="flex items-center gap-1">
                        <Input
                          id={`operativ-${key}`}
                          type="number"
                          min={0}
                          max={max}
                          step={1}
                          value={value}
                          disabled={!operativEditierbar}
                          invalid={!!err}
                          className="w-20 text-center"
                          onChange={(e) => {
                            const n = Math.max(
                              0,
                              Math.min(max, Number(e.target.value) || 0),
                            );
                            setOperativeWerte(params.id, { [key]: n });
                          }}
                        />
                        {OPERATIVER_WERT_EINHEIT[key] && (
                          <span className="shrink-0 text-sm text-fg-muted">
                            {OPERATIVER_WERT_EINHEIT[key]}
                          </span>
                        )}
                      </div>
                    </div>
                  </Field>
                );
              })}

              {/* Operativ-Validierungsfehler ohne Feldbezug */}
              {operativIssues.filter((i) => !i.field).length > 0 && (
                <IssueList issues={operativIssues.filter((i) => !i.field)} />
              )}
            </CardBody>
          </Card>
        </StaggerItem>
      </StaggerList>
    </EditorPage>
  );
}
