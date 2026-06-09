"use client";

/**
 * UC06 — Lostopf / Sachpreisverlosung
 *
 * Optionaler Lostopf mit einer oder mehreren Sachpreisen.
 * Max. 1 Lostopf pro Mission (BR-UC05-002).
 * Ziehung der Gewinner erfolgt außerhalb von HOPE (BR-UC05-006).
 * Gewinnerkommunikation nicht im initialen Scope (BR-UC05-007).
 *
 * REQ-UC05-005/006/007, VAL-013/014, BR-UC05-001/002/005/006/007
 */

import { AnimatePresence, motion } from "framer-motion";
import { useMission, useValidation } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { isKonfigurationEditierbar } from "@/lib/domain/status";
import { EditorPage } from "@/components/editor/EditorPage";
import { IssueList } from "@/components/editor/IssueList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StaggerList, StaggerItem } from "@/components/motion/Stagger";

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const setLostopfAktiv = useMissionStore((s) => s.setLostopfAktiv);
  const addPreis = useMissionStore((s) => s.addPreis);
  const updatePreis = useMissionStore((s) => s.updatePreis);
  const removePreis = useMissionStore((s) => s.removePreis);
  const validation = useValidation(mission);

  if (!mission) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const lostopfIssues = validation?.byArea.lostopf ?? [];

  function preisFieldError(preisId: string, field: string): string | null {
    return (
      lostopfIssues.find(
        (i) => i.refId === preisId && i.field === field && i.severity === "error",
      )?.message ?? null
    );
  }

  const { lostopf } = mission;

  /* ------------------------------------------------------------------ */
  /* Inaktiver Lostopf: Erklärung + Aktivierungsbutton                  */
  /* ------------------------------------------------------------------ */
  if (!lostopf.aktiv) {
    return (
      <EditorPage
        ucId="UC06"
        title="Lostopf / Sachpreisverlosung"
        description="Optionaler Lostopf: Teilnehmer ohne Coupon-Sofortgewinn werden in eine Sachpreisverlosung aufgenommen."
        locked={!editierbar}
      >
        <StaggerList className="space-y-4">
          <StaggerItem>
            <Callout tone="info" title="Was ist der Lostopf?">
              <p>
                Der Lostopf ist optional (BR-UC05-001). Wenn aktiviert, werden
                Teilnehmer ohne Coupon-Sofortgewinn in eine Sachpreisverlosung
                aufgenommen — max. 1 Lostopf pro Mission (BR-UC05-002).
              </p>
              <p className="mt-2">
                Die Ziehung der Gewinner erfolgt{" "}
                <strong>außerhalb von HOPE</strong> (BR-UC05-006). Der
                Lostopf-Ergebnis-Screen in der PENNY App wird unter{" "}
                <em>App-Inhalte</em> konfiguriert (UC07).
              </p>
            </Callout>
          </StaggerItem>

          <StaggerItem>
            <EmptyState
              icon="🎰"
              title="Lostopf nicht aktiv"
              description="Aktivieren Sie den Lostopf, um Sachpreise für Nichtgewinner zu konfigurieren (BR-UC05-001)."
              action={
                editierbar ? (
                  <Button
                    variant="primary"
                    onClick={() => setLostopfAktiv(params.id, true)}
                  >
                    Lostopf aktivieren
                  </Button>
                ) : undefined
              }
            />
          </StaggerItem>
        </StaggerList>
      </EditorPage>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Aktiver Lostopf                                                     */
  /* ------------------------------------------------------------------ */
  return (
    <EditorPage
      ucId="UC06"
      title="Lostopf / Sachpreisverlosung"
      description="Sachpreise für die Verlosung unter Nichtgewinnern konfigurieren."
      locked={!editierbar}
      actions={
        editierbar ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => addPreis(params.id)}
          >
            + Preis hinzufügen
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {/* Hinweis-Callouts */}
        <StaggerList className="space-y-2">
          <StaggerItem>
            <Callout tone="neutral" title="Ziehung außerhalb von HOPE (BR-UC05-006)">
              Die Ziehung der Gewinner und die Übergabe der Sachpreise erfolgen
              außerhalb von HOPE. HOPE erfasst nur die Preise und
              Verlosungsanzahlen.
            </Callout>
          </StaggerItem>
          <StaggerItem>
            <Callout tone="neutral" title="Gewinnerkommunikation nicht im Scope (BR-UC05-007)">
              Die Benachrichtigung der Gewinner ist nicht im initialen Scope von
              HOPE enthalten.
            </Callout>
          </StaggerItem>
          <StaggerItem>
            <Callout tone="info" title="Lostopf-Ergebnis-Screen">
              Den Lostopf-Ergebnis-Screen für die PENNY App konfigurieren Sie
              unter <strong>App-Inhalte</strong> (UC07).
            </Callout>
          </StaggerItem>
        </StaggerList>

        {/* Preis-Liste */}
        {lostopf.preise.length === 0 ? (
          <EmptyState
            icon="🎁"
            title="Noch keine Preise"
            description="Fügen Sie mindestens einen Preis hinzu. Mindestens 1 Preis ist für die Veröffentlichung erforderlich (VAL-013)."
            action={
              editierbar ? (
                <Button
                  variant="primary"
                  onClick={() => addPreis(params.id)}
                >
                  Ersten Preis hinzufügen
                </Button>
              ) : undefined
            }
          />
        ) : (
          <StaggerList className="space-y-3">
            <AnimatePresence mode="popLayout">
              {lostopf.preise.map((preis, idx) => {
                const beschreibungErr = preisFieldError(preis.id, "beschreibung");
                const anzahlErr = preisFieldError(preis.id, "anzahlVerlosungen");
                const hasErrors = !!(beschreibungErr || anzahlErr);

                return (
                  <StaggerItem key={preis.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Card
                        className={hasErrors ? "border-danger/40" : undefined}
                      >
                        <CardHeader>
                          <div>
                            <CardTitle>
                              Preis {idx + 1}
                              {preis.beschreibung && (
                                <span className="ml-2 font-normal text-fg-muted">
                                  — {preis.beschreibung}
                                </span>
                              )}
                            </CardTitle>
                          </div>
                        </CardHeader>

                        <CardBody className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                            {/* Beschreibung */}
                            <Field
                              label="Preisbeschreibung"
                              htmlFor={`preis-bez-${preis.id}`}
                              required
                              help="Kurze Beschreibung des Sachpreises (REQ-UC05-007)."
                              error={beschreibungErr}
                            >
                              <Input
                                id={`preis-bez-${preis.id}`}
                                value={preis.beschreibung}
                                placeholder='z. B. iPad Pro 13", 256 GB'
                                disabled={!editierbar}
                                invalid={!!beschreibungErr}
                                onChange={(e) =>
                                  updatePreis(params.id, preis.id, {
                                    beschreibung: e.target.value,
                                  })
                                }
                              />
                            </Field>

                            {/* Anzahl Verlosungen */}
                            <Field
                              label="Anzahl Verlosungen"
                              htmlFor={`preis-anz-${preis.id}`}
                              required
                              help="Wie oft wird dieser Preis verlost? Muss mindestens 1 sein (VAL-014, BR-UC05-005)."
                              error={anzahlErr}
                            >
                              <Input
                                id={`preis-anz-${preis.id}`}
                                type="number"
                                min={1}
                                step={1}
                                value={preis.anzahlVerlosungen}
                                disabled={!editierbar}
                                invalid={!!anzahlErr}
                                className="w-28"
                                onChange={(e) => {
                                  const n = Math.max(
                                    1,
                                    parseInt(e.target.value, 10) || 1,
                                  );
                                  updatePreis(params.id, preis.id, {
                                    anzahlVerlosungen: n,
                                  });
                                }}
                              />
                            </Field>
                          </div>
                        </CardBody>

                        {editierbar && (
                          <CardFooter>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removePreis(params.id, preis.id)}
                            >
                              Preis entfernen
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </AnimatePresence>
          </StaggerList>
        )}

        {/* Lostopf-Validierungsfehler ohne Preis-Bezug */}
        {lostopfIssues.filter((i) => !i.refId).length > 0 && (
          <IssueList issues={lostopfIssues.filter((i) => !i.refId)} />
        )}

        {/* Lostopf deaktivieren */}
        {editierbar && (
          <div className="flex justify-start border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLostopfAktiv(params.id, false)}
            >
              Lostopf deaktivieren
            </Button>
          </div>
        )}
      </div>
    </EditorPage>
  );
}
