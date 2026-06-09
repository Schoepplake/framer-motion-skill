"use client";

import { useMission, useValidation } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { isKonfigurationEditierbar } from "@/lib/domain/status";
import { STATUS_BESCHREIBUNG } from "@/lib/domain/labels";
import { EditorPage } from "@/components/editor/EditorPage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Callout } from "@/components/ui/Callout";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerList, StaggerItem } from "@/components/motion/Stagger";

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const updateGrunddaten = useMissionStore((s) => s.updateGrunddaten);
  // Hooks müssen vor jedem bedingten Return aufgerufen werden (React-Regeln).
  const validation = useValidation(mission);

  if (!mission) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const grunddatenIssues = validation?.byArea.grunddaten ?? [];

  /** Feldnah: erstes Issue für ein gegebenes Feldnamen zurückgeben. */
  function fieldError(fieldName: string): string | null {
    const issue = grunddatenIssues.find(
      (i) => i.field === fieldName && i.severity === "error",
    );
    return issue?.message ?? null;
  }

  const { grunddaten, status } = mission;

  return (
    <EditorPage
      ucId="UC02"
      title="Grunddaten"
      description="Basisinformationen zur Mission: Name, Zeitraum, Beschreibung und interne Referenz."
      locked={!editierbar}
    >
      <StaggerList className="space-y-4">
        {/* Status-Info */}
        <StaggerItem>
          <Callout tone="neutral" title="Aktueller Status">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <span className="text-fg-muted">{STATUS_BESCHREIBUNG[status]}</span>
            </div>
          </Callout>
        </StaggerItem>

        {/* Pflichtfelder */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Missionsbezeichnung &amp; Zeitraum</CardTitle>
                <CardDescription>
                  Pflichtangaben — erforderlich für die Veröffentlichung (BR-UC02-001/002/003).
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Missionsname */}
              <Field
                label="Missionsname"
                htmlFor="missionsName"
                required
                help="Eindeutiger Name der Gewinnspiel-Mission. Wird intern sowie im Audit-Trail verwendet (BR-UC02-001, VAL-001)."
                error={fieldError("missionsName")}
              >
                <Input
                  id="missionsName"
                  value={grunddaten.missionsName}
                  placeholder="z. B. PENNY Sommergewinnspiel 2025"
                  disabled={!editierbar}
                  invalid={!!fieldError("missionsName")}
                  onChange={(e) =>
                    updateGrunddaten(params.id, { missionsName: e.target.value })
                  }
                />
              </Field>

              {/* Missionszeitraum von / bis */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Zeitraum von"
                  htmlFor="zeitraumVon"
                  required
                  help="Startdatum der Mission (inklusive). ISO-Datum yyyy-mm-dd (BR-UC02-002, VAL-002/004)."
                  error={fieldError("zeitraumVon")}
                >
                  <Input
                    id="zeitraumVon"
                    type="date"
                    value={grunddaten.zeitraum.von ?? ""}
                    disabled={!editierbar}
                    invalid={!!fieldError("zeitraumVon")}
                    onChange={(e) => {
                      const von = e.target.value || null;
                      updateGrunddaten(params.id, {
                        zeitraum: { von, bis: grunddaten.zeitraum.bis },
                      });
                    }}
                  />
                </Field>

                <Field
                  label="Zeitraum bis"
                  htmlFor="zeitraumBis"
                  required
                  help="Enddatum der Mission (inklusive). Muss nach dem Startdatum liegen (BR-UC02-003, VAL-003/004)."
                  error={fieldError("zeitraumBis")}
                >
                  <Input
                    id="zeitraumBis"
                    type="date"
                    value={grunddaten.zeitraum.bis ?? ""}
                    disabled={!editierbar}
                    invalid={!!fieldError("zeitraumBis")}
                    onChange={(e) => {
                      const bis = e.target.value || null;
                      updateGrunddaten(params.id, {
                        zeitraum: { von: grunddaten.zeitraum.von, bis },
                      });
                    }}
                  />
                </Field>
              </div>
            </CardBody>
          </Card>
        </StaggerItem>

        {/* Metadaten */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Beschreibung &amp; Referenz</CardTitle>
                <CardDescription>
                  Optionale Metadaten zur internen Dokumentation (REQ-UC02-005).
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Beschreibung */}
              <Field
                label="Beschreibung"
                htmlFor="beschreibung"
                help="Allgemeine fachliche Beschreibung der Mission — für das interne Team (REQ-UC02-005)."
                hint="Optional. Erscheint nicht in der PENNY App."
              >
                <Textarea
                  id="beschreibung"
                  value={grunddaten.beschreibung}
                  placeholder="Kurze Beschreibung der Kampagne, Ziele und Besonderheiten …"
                  rows={4}
                  disabled={!editierbar}
                  onChange={(e) =>
                    updateGrunddaten(params.id, { beschreibung: e.target.value })
                  }
                />
              </Field>

              {/* Interne Referenz */}
              <Field
                label="Interne Referenz"
                htmlFor="interneReferenz"
                help="Internes Ticket-, Projekt- oder Kampagnennummer — für die eigene Nachvollziehbarkeit."
                hint="Optional. Wird nicht an die PENNY App übergeben."
              >
                <Input
                  id="interneReferenz"
                  value={grunddaten.interneReferenz}
                  placeholder="z. B. JIRA-1234 oder KW-2025-07"
                  disabled={!editierbar}
                  onChange={(e) =>
                    updateGrunddaten(params.id, { interneReferenz: e.target.value })
                  }
                />
              </Field>
            </CardBody>
          </Card>
        </StaggerItem>

        {/* Restliche Grunddaten-Validierungsfehler ohne Feldbezug */}
        {grunddatenIssues.filter((i) => !i.field).length > 0 && (
          <StaggerItem>
            <FadeIn>
              <div className="space-y-2">
                {grunddatenIssues
                  .filter((i) => !i.field)
                  .map((issue) => (
                    <Callout
                      key={issue.code}
                      tone={
                        issue.severity === "error"
                          ? "danger"
                          : issue.severity === "warning"
                            ? "warning"
                            : "info"
                      }
                    >
                      {issue.message}
                    </Callout>
                  ))}
              </div>
            </FadeIn>
          </StaggerItem>
        )}
      </StaggerList>
    </EditorPage>
  );
}
