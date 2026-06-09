"use client";

import { useState } from "react";
import type { ValidationResult } from "@/lib/validation";
import { useMission, useValidation, useCoverage } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { kannVeroeffentlichen, isKonfigurationEditierbar } from "@/lib/domain/status";
import { VALIDATION_AREAS } from "@/lib/validation";
import type { ValidationArea } from "@/lib/validation";
import { formatDateTime } from "@/lib/format";
import { EditorPage } from "@/components/editor/EditorPage";
import { IssueList } from "@/components/editor/IssueList";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import { LifecycleActions } from "@/components/lifecycle/LifecycleActions";
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Badge,
  StatusBadge,
  Callout,
  Modal,
} from "@/components/ui";
import { FadeIn, FadeInView } from "@/components/motion";

/* ------------------------------------------------------------------ */
/* Mapping ValidationArea → Tab-Segment                               */
/* ------------------------------------------------------------------ */

const AREA_SEGMENT: Record<ValidationArea, string> = {
  grunddaten: "grunddaten",
  mechanik: "mechanik",
  coupons: "coupons",
  ergebnisarten: "ergebnisarten",
  lostopf: "lostopf",
  inhalte: "inhalte",
  operativ: "grunddaten", // Operative Werte liegen im Grunddaten-Tab
};

const AREA_LABEL: Record<ValidationArea, string> = {
  grunddaten: "Grunddaten",
  mechanik: "Mechanik",
  coupons: "Coupon-Sofortgewinne",
  ergebnisarten: "Ergebnisarten",
  lostopf: "Lostopf",
  inhalte: "App-Inhalte",
  operativ: "Operative Werte",
};

/* ------------------------------------------------------------------ */
/* Validierungs-Sektion                                                */
/* ------------------------------------------------------------------ */

function ValidationPanel({
  missionId,
  validation,
}: {
  missionId: string;
  validation: ValidationResult;
}) {
  const totalErrors = validation.errors.length;
  const totalWarnings = validation.warnings.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurationsvalidierung</CardTitle>
        <div className="flex items-center gap-2">
          {totalErrors > 0 && (
            <Badge tone="danger">
              {totalErrors} {totalErrors === 1 ? "Fehler" : "Fehler"}
            </Badge>
          )}
          {totalWarnings > 0 && (
            <Badge tone="warning">
              {totalWarnings} {totalWarnings === 1 ? "Warnung" : "Warnungen"}
            </Badge>
          )}
          {totalErrors === 0 && totalWarnings === 0 && (
            <Badge tone="success">Alles korrekt</Badge>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        {validation.veroeffentlichbar && totalWarnings === 0 && (
          <Callout tone="success" title="Bereit zur Veröffentlichung">
            Alle Pflichtangaben sind vollständig. Die Mission kann jetzt
            veröffentlicht werden.
          </Callout>
        )}

        {!validation.veroeffentlichbar && totalErrors > 0 && (
          <Callout tone="danger" title="Veröffentlichung blockiert">
            Es gibt {totalErrors} blockierende{" "}
            {totalErrors === 1 ? "Fehler" : "Fehler"}, die vor der
            Veröffentlichung behoben werden müssen.
          </Callout>
        )}

        {VALIDATION_AREAS.map((area) => {
          const areaIssues = validation.byArea[area];
          if (areaIssues.length === 0) return null;
          const areaErrors = areaIssues.filter((i) => i.severity === "error").length;
          return (
            <div key={area} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-fg">
                  {AREA_LABEL[area]}
                </h4>
                <div className="flex items-center gap-2">
                  {areaErrors > 0 && (
                    <Badge tone="danger">{areaErrors}</Badge>
                  )}
                  <a
                    href={`/missions/${missionId}/${AREA_SEGMENT[area]}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Korrigieren →
                  </a>
                </div>
              </div>
              <IssueList issues={areaIssues} />
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Erfolgs-Banner nach Veröffentlichung                               */
/* ------------------------------------------------------------------ */

function PublishSuccessBanner({ mission }: { mission: { veroeffentlichtVon: string | null; veroeffentlichtAm: string | null } }) {
  return (
    <FadeIn>
      <Callout tone="success" title="Mission erfolgreich veröffentlicht">
        Veröffentlicht von{" "}
        <strong>{mission.veroeffentlichtVon ?? "—"}</strong> am{" "}
        <strong>{formatDateTime(mission.veroeffentlichtAm)}</strong>.
        Die Mission ist jetzt an Firebase übergeben und in der PENNY App sichtbar.
      </Callout>
    </FadeIn>
  );
}

/* ------------------------------------------------------------------ */
/* Seite                                                               */
/* ------------------------------------------------------------------ */

export default function ReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const mission = useMission(params.id);
  const validation = useValidation(mission);
  const coverage = useCoverage(mission);
  const publishAction = useMissionStore((s) => s.publish);

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [lastPublishResult, setLastPublishResult] =
    useState<ValidationResult | null>(null);

  if (!mission || !validation || !coverage) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const canPublish =
    kannVeroeffentlichen(mission) && validation.veroeffentlichbar;
  const coverageBlocked = !coverage.vollstaendigAbgedeckt;

  function handlePublishConfirm() {
    setPublishLoading(true);
    const result = publishAction(params.id);
    setLastPublishResult(result);
    setPublishLoading(false);
    if (result.veroeffentlichbar) {
      setPublishOpen(false);
    }
  }

  const alreadyPublished =
    mission.status === "veroeffentlicht" ||
    mission.status === "aktiv" ||
    mission.status === "beendet" ||
    mission.status === "storniert" ||
    mission.status === "abgebrochen";

  return (
    <EditorPage
      ucId="UC09"
      title="Review & Veröffentlichung"
      description="Prüfe die Missionskonfiguration und veröffentliche die Mission."
      locked={!editierbar}
      lockedHint={
        alreadyPublished
          ? "Die Mission wurde bereits veröffentlicht. Die Konfiguration ist gesperrt."
          : undefined
      }
      actions={
        kannVeroeffentlichen(mission) ? (
          <Button
            variant="primary"
            size="lg"
            disabled={!canPublish || coverageBlocked}
            onClick={() => setPublishOpen(true)}
          >
            Mission veröffentlichen
          </Button>
        ) : undefined
      }
    >
      {/* Erfolgs-Banner nach Veröffentlichung */}
      {mission.status === "veroeffentlicht" &&
        mission.veroeffentlichtAm && (
          <PublishSuccessBanner mission={mission} />
        )}

      {/* Informeller Review-Hinweis (REQ-UC08-009, BR-UC08-002) */}
      <FadeIn delay={0.05}>
        <Callout tone="neutral" title="Informeller Review">
          HOPE unterstützt informelle Reviews ohne erzwungenes 4-Augen-Prinzip.
          Die Konfiguration sollte vor der Veröffentlichung durch eine zweite Person
          geprüft werden — dies wird jedoch nicht technisch erzwungen (BR-UC08-002).
        </Callout>
      </FadeIn>

      {/* Coverage-Sperre (REQ-UC08-010/011) */}
      {kannVeroeffentlichen(mission) && coverageBlocked && (
        <FadeIn delay={0.1}>
          <Callout tone="danger" title="Veröffentlichung blockiert: Coupon-Lücken">
            Der Missionszeitraum ist nicht vollständig durch Coupon-Sofortgewinne
            abgedeckt. Es gibt {coverage.luecken.length}{" "}
            {coverage.luecken.length === 1 ? "Lücke" : "Lücken"} im Ausspielungsplan.
            Bitte lege weitere Coupons an oder passe die Ausspielungszeiträume an.{" "}
            <a
              href={`/missions/${params.id}/coupons`}
              className="font-medium underline underline-offset-2"
            >
              Zu den Coupons →
            </a>
          </Callout>
        </FadeIn>
      )}

      {/* Konfigurationsüberblick */}
      <FadeInView delay={0.05}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">
          Konfigurationsüberblick
        </h3>
      </FadeInView>
      <ReviewSummary
        mission={mission}
        validation={validation}
        coverage={coverage}
      />

      {/* Validierungs-Panel */}
      <FadeInView delay={0.05}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">
          Validierung
        </h3>
      </FadeInView>
      <ValidationPanel missionId={params.id} validation={validation} />

      {/* Fehlgeschlagene Veröffentlichung */}
      {lastPublishResult && !lastPublishResult.veroeffentlichbar && (
        <FadeIn>
          <Callout tone="danger" title="Veröffentlichung fehlgeschlagen">
            Die Validierung hat {lastPublishResult.errors.length} blockierende{" "}
            {lastPublishResult.errors.length === 1 ? "Fehler" : "Fehler"} gefunden.
            Bitte korrigiere die Konfiguration und versuche es erneut.
          </Callout>
        </FadeIn>
      )}

      {/* Lifecycle-Aktionen (Stornieren, Abbrechen, Operative Werte, Simulation) */}
      <LifecycleActions mission={mission} />

      {/* Veröffentlichungs-Bestätigungs-Modal */}
      <Modal
        open={publishOpen}
        onClose={() => {
          if (!publishLoading) setPublishOpen(false);
        }}
        title="Mission veröffentlichen"
        description="Die Mission wird validiert und an Firebase übergeben. Sie ist danach in der PENNY App sichtbar."
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPublishOpen(false)}
              disabled={publishLoading}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={publishLoading}
              onClick={handlePublishConfirm}
            >
              Jetzt veröffentlichen
            </Button>
          </>
        }
      >
        <Callout tone="info">
          Stelle sicher, dass die Konfiguration vollständig und von einer zweiten
          Person geprüft wurde. Nach der Veröffentlichung können nur noch
          operative Werte geändert werden.
        </Callout>
      </Modal>
    </EditorPage>
  );
}
