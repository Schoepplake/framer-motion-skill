"use client";

import type { AuditEntry, AuditAction } from "@/lib/domain/types";
import { AUDIT_ACTION_LABEL } from "@/lib/domain/labels";
import type { StatusTone } from "@/lib/domain/labels";
import { formatDateTime } from "@/lib/format";
import { useMission } from "@/lib/store/hooks";
import { EditorPage } from "@/components/editor/EditorPage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  Dot,
  EmptyState,
  cn,
} from "@/components/ui";
import { FadeIn, StaggerList, StaggerItem } from "@/components/motion";

/* ------------------------------------------------------------------ */
/* Farbgebung je Aktionstyp                                            */
/* ------------------------------------------------------------------ */

type AuditTone = StatusTone;

const ACTION_TONE: Record<AuditAction, AuditTone> = {
  mission_erstellt: "info",
  grunddaten_geaendert: "neutral",
  mechanik_geaendert: "neutral",
  coupon_hinzugefuegt: "neutral",
  coupon_geaendert: "neutral",
  coupon_entfernt: "warning",
  ergebnisarten_geaendert: "neutral",
  lostopf_geaendert: "neutral",
  inhalte_geaendert: "neutral",
  operative_werte_geaendert: "info",
  veroeffentlicht: "success",
  storniert: "warning",
  abgebrochen: "danger",
  aktiviert: "success",
  beendet: "neutral",
  validierung_fehlgeschlagen: "danger",
};

/* ------------------------------------------------------------------ */
/* Einzelner Timeline-Eintrag                                          */
/* ------------------------------------------------------------------ */

function AuditEntryItem({
  entry,
  isLast,
}: {
  entry: AuditEntry;
  isLast: boolean;
}) {
  const tone = ACTION_TONE[entry.aktion] ?? "neutral";

  return (
    <div className="relative flex gap-4">
      {/* Vertikale Linie */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-7 bottom-0 w-px bg-border"
          aria-hidden
        />
      )}

      {/* Punkt */}
      <div className="relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border">
        <Dot tone={tone} />
      </div>

      {/* Inhalt */}
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-fg">
            {AUDIT_ACTION_LABEL[entry.aktion] ?? entry.aktion}
          </span>
          <span className="shrink-0 text-xs text-fg-muted">
            {formatDateTime(entry.zeitpunkt)}
          </span>
        </div>

        <p className="mt-0.5 text-sm text-fg-muted">{entry.beschreibung}</p>

        {entry.details && (
          <p className="mt-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs font-mono text-fg-muted whitespace-pre-wrap">
            {entry.details}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          <Badge tone="neutral">{entry.benutzer}</Badge>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Metadaten-Grid                                                      */
/* ------------------------------------------------------------------ */

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-1.5 text-sm border-b border-border/40 last:border-0">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg text-right">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seite                                                               */
/* ------------------------------------------------------------------ */

export default function AuditPage({
  params,
}: {
  params: { id: string };
}) {
  const mission = useMission(params.id);

  if (!mission) return null;

  const auditNewestFirst = [...mission.audit].reverse();

  return (
    <EditorPage
      ucId="UC13"
      title="Audit Trail"
      description="Vollständiger Änderungsverlauf der Mission. Alle Statusübergänge und Konfigurationsänderungen werden lückenlos aufgezeichnet."
    >
      {/* Metadaten-Übersicht */}
      <FadeIn delay={0.0}>
        <Card>
          <CardHeader>
            <CardTitle>Lebenszyklus-Metadaten</CardTitle>
          </CardHeader>
          <CardBody className="divide-y divide-border/40">
            <MetadataRow
              label="Erstellt von"
              value={
                <span>
                  <span className="font-semibold">{mission.erstelltVon}</span>
                  {" · "}
                  <span className="text-fg-muted font-normal">
                    {formatDateTime(mission.erstelltAm)}
                  </span>
                </span>
              }
            />
            <MetadataRow
              label="Zuletzt geändert"
              value={
                <span>
                  <span className="font-semibold">{mission.geaendertVon}</span>
                  {" · "}
                  <span className="text-fg-muted font-normal">
                    {formatDateTime(mission.geaendertAm)}
                  </span>
                </span>
              }
            />
            {mission.veroeffentlichtAm && (
              <MetadataRow
                label="Veröffentlicht"
                value={
                  <span>
                    <span className="font-semibold">
                      {mission.veroeffentlichtVon ?? "—"}
                    </span>
                    {" · "}
                    <span className="text-fg-muted font-normal">
                      {formatDateTime(mission.veroeffentlichtAm)}
                    </span>
                  </span>
                }
              />
            )}
            {mission.storniertAm && (
              <>
                <MetadataRow
                  label="Storniert"
                  value={
                    <span>
                      <span className="font-semibold">
                        {mission.storniertVon ?? "—"}
                      </span>
                      {" · "}
                      <span className="text-fg-muted font-normal">
                        {formatDateTime(mission.storniertAm)}
                      </span>
                    </span>
                  }
                />
                {mission.stornierungsgrund && (
                  <MetadataRow
                    label="Stornierungsgrund"
                    value={
                      <span className="text-warning font-normal">
                        {mission.stornierungsgrund}
                      </span>
                    }
                  />
                )}
              </>
            )}
            {mission.abgebrochenAm && (
              <>
                <MetadataRow
                  label="Abgebrochen"
                  value={
                    <span>
                      <span className="font-semibold">
                        {mission.abgebrochenVon ?? "—"}
                      </span>
                      {" · "}
                      <span className="text-fg-muted font-normal">
                        {formatDateTime(mission.abgebrochenAm)}
                      </span>
                    </span>
                  }
                />
                {mission.abbruchgrund && (
                  <MetadataRow
                    label="Abbruchgrund"
                    value={
                      <span className="text-danger font-normal">
                        {mission.abbruchgrund}
                      </span>
                    }
                  />
                )}
              </>
            )}
            <MetadataRow
              label="Audit-Einträge gesamt"
              value={
                <Badge tone="neutral">{mission.audit.length}</Badge>
              }
            />
          </CardBody>
        </Card>
      </FadeIn>

      {/* Timeline */}
      <FadeIn delay={0.1}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider">
          Änderungsverlauf
        </h3>
      </FadeIn>

      {auditNewestFirst.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Kein Audit Trail vorhanden"
          description="Es wurden noch keine auditrelevanten Aktionen ausgeführt."
        />
      ) : (
        <Card>
          <CardBody className="py-6">
            <StaggerList className="space-y-0">
              {auditNewestFirst.map((entry, index) => (
                <StaggerItem key={entry.id}>
                  <AuditEntryItem
                    entry={entry}
                    isLast={index === auditNewestFirst.length - 1}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          </CardBody>
        </Card>
      )}
    </EditorPage>
  );
}
