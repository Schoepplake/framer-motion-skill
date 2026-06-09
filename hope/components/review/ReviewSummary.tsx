"use client";

import Link from "next/link";
import type { Mission } from "@/lib/domain/types";
import {
  MECHANIK_LABEL,
  ERGEBNISART_LABEL,
  OPERATIVER_WERT_LABEL,
  OPERATIVER_WERT_EINHEIT,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/domain/labels";
import { getRelevanteScreens } from "@/lib/domain/screens";
import { formatDateRange, formatDateTime } from "@/lib/format";
import type { ValidationResult, CoverageResult } from "@/lib/validation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  StatusBadge,
  ProgressBar,
  cn,
} from "@/components/ui";
import { FadeIn } from "@/components/motion";

/* ------------------------------------------------------------------ */
/* Kleine Hilfsdatenzeile                                              */
/* ------------------------------------------------------------------ */

function MetaRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span className="shrink-0 text-fg-muted">{label}</span>
      <span className={cn("text-right font-medium", muted ? "text-fg-muted" : "text-fg")}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Abschnitts-Header mit Link                                          */
/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  href,
  badge,
}: {
  title: string;
  href: string;
  badge?: React.ReactNode;
}) {
  return (
    <CardHeader className="flex-row items-center gap-2">
      <CardTitle className="flex-1">{title}</CardTitle>
      {badge}
      <Link
        href={href}
        className="shrink-0 text-xs font-medium text-primary hover:underline"
      >
        Bearbeiten →
      </Link>
    </CardHeader>
  );
}

/* ------------------------------------------------------------------ */
/* Haupt-Komponente                                                    */
/* ------------------------------------------------------------------ */

export interface ReviewSummaryProps {
  mission: Mission;
  validation: ValidationResult;
  coverage: CoverageResult;
}

export function ReviewSummary({
  mission,
  validation,
  coverage,
}: ReviewSummaryProps) {
  const missionId = mission.id;
  const screens = getRelevanteScreens(mission);

  /* App-Inhalte Vollständigkeit */
  const requiredFields = screens.flatMap((s) =>
    s.fields.filter((f) => f.required).map((f) => ({ screenId: s.id, key: f.key })),
  );
  const filledRequired = requiredFields.filter(
    ({ screenId, key }) => !!mission.appContent.screens[screenId]?.[key],
  );
  const contentPct =
    requiredFields.length > 0
      ? Math.round((filledRequired.length / requiredFields.length) * 100)
      : 100;
  const contentTone =
    contentPct === 100 ? "success" : contentPct >= 50 ? "warning" : "danger";

  /* Lostopf */
  const lostopfPreisCount = mission.lostopf.aktiv ? mission.lostopf.preise.length : 0;

  /* Coverage */
  const coverageGaps = coverage.luecken;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {/* Grunddaten */}
      <FadeIn delay={0.0}>
        <Card>
          <SectionHeader
            title="Grunddaten"
            href={`/missions/${missionId}/grunddaten`}
          />
          <CardBody className="space-y-0 divide-y divide-border/50">
            <MetaRow label="Name" value={mission.grunddaten.missionsName || "—"} />
            <MetaRow
              label="Zeitraum"
              value={formatDateRange(
                mission.grunddaten.zeitraum.von,
                mission.grunddaten.zeitraum.bis,
              )}
            />
            <MetaRow
              label="Status"
              value={<StatusBadge status={mission.status} />}
            />
            {mission.grunddaten.interneReferenz && (
              <MetaRow
                label="Int. Referenz"
                value={mission.grunddaten.interneReferenz}
                muted
              />
            )}
          </CardBody>
        </Card>
      </FadeIn>

      {/* Mechanik */}
      <FadeIn delay={0.05}>
        <Card>
          <SectionHeader
            title="Mechanik"
            href={`/missions/${missionId}/mechanik`}
          />
          <CardBody>
            {mission.mechanik ? (
              <div className="flex items-center gap-2">
                <Badge tone="info">{MECHANIK_LABEL[mission.mechanik]}</Badge>
              </div>
            ) : (
              <span className="text-sm text-danger">Noch nicht gewählt</span>
            )}
          </CardBody>
        </Card>
      </FadeIn>

      {/* Coupon-Sofortgewinne + Coverage */}
      <FadeIn delay={0.1}>
        <Card>
          <SectionHeader
            title="Coupon-Sofortgewinne"
            href={`/missions/${missionId}/coupons`}
            badge={
              <Badge
                tone={
                  mission.couponSofortgewinne.length === 0
                    ? "danger"
                    : coverage.vollstaendigAbgedeckt
                    ? "success"
                    : "warning"
                }
              >
                {mission.couponSofortgewinne.length}
              </Badge>
            }
          />
          <CardBody className="space-y-2">
            {mission.couponSofortgewinne.length === 0 ? (
              <p className="text-sm text-danger">Keine Coupons angelegt</p>
            ) : (
              <>
                <MetaRow
                  label="Abdeckung"
                  value={`${coverage.tageAbgedeckt}/${coverage.tageGesamt} Tage`}
                />
                {coverage.vollstaendigAbgedeckt ? (
                  <Badge tone="success">Vollständig abgedeckt</Badge>
                ) : (
                  <div className="space-y-1">
                    <Badge tone="warning">
                      {coverageGaps.length}{" "}
                      {coverageGaps.length === 1 ? "Lücke" : "Lücken"}
                    </Badge>
                    {coverageGaps.slice(0, 3).map((g, i) => (
                      <p key={i} className="text-xs text-fg-muted">
                        {formatDateRange(g.von, g.bis)} ({g.tage}{" "}
                        {g.tage === 1 ? "Tag" : "Tage"})
                      </p>
                    ))}
                    {coverageGaps.length > 3 && (
                      <p className="text-xs text-fg-muted">
                        +{coverageGaps.length - 3} weitere…
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </FadeIn>

      {/* Ergebnisarten */}
      <FadeIn delay={0.15}>
        <Card>
          <SectionHeader
            title="Ergebnisarten"
            href={`/missions/${missionId}/ergebnisarten`}
          />
          <CardBody className="flex flex-wrap gap-2">
            <Badge tone="info">{ERGEBNISART_LABEL["coupon_sofortgewinn"]}</Badge>
            {mission.ergebnisarten.nieteAktiv && (
              <Badge tone="neutral">{ERGEBNISART_LABEL["niete"]}</Badge>
            )}
            {mission.ergebnisarten.lostopfAktiv && (
              <Badge tone="info">{ERGEBNISART_LABEL["lostopf"]}</Badge>
            )}
          </CardBody>
        </Card>
      </FadeIn>

      {/* Operative Werte */}
      <FadeIn delay={0.2}>
        <Card>
          <SectionHeader
            title="Operative Werte"
            href={`/missions/${missionId}/grunddaten`}
          />
          <CardBody className="space-y-0 divide-y divide-border/50">
            {(
              [
                "gewinnwahrscheinlichkeit",
                "sofortgewinngewichtung",
                "taeglichesTeilnahmeLimit",
              ] as const
            ).map((key) => (
              <MetaRow
                key={key}
                label={OPERATIVER_WERT_LABEL[key]}
                value={`${mission.operativeWerte[key]}${OPERATIVER_WERT_EINHEIT[key]}`}
              />
            ))}
          </CardBody>
        </Card>
      </FadeIn>

      {/* Lostopf */}
      {mission.ergebnisarten.lostopfAktiv && (
        <FadeIn delay={0.25}>
          <Card>
            <SectionHeader
              title="Lostopf"
              href={`/missions/${missionId}/lostopf`}
              badge={
                <Badge tone={lostopfPreisCount > 0 ? "success" : "warning"}>
                  {lostopfPreisCount}{" "}
                  {lostopfPreisCount === 1 ? "Preis" : "Preise"}
                </Badge>
              }
            />
            <CardBody>
              <MetaRow
                label="Aktiv"
                value={mission.lostopf.aktiv ? "Ja" : "Nein"}
              />
              <MetaRow
                label="Preise"
                value={`${lostopfPreisCount} angelegt`}
                muted={lostopfPreisCount === 0}
              />
            </CardBody>
          </Card>
        </FadeIn>
      )}

      {/* App-Inhalte */}
      <FadeIn delay={0.3}>
        <Card>
          <SectionHeader
            title="App-Inhalte"
            href={`/missions/${missionId}/inhalte`}
            badge={
              <Badge tone={contentTone}>
                {filledRequired.length}/{requiredFields.length} Pflichtfelder
              </Badge>
            }
          />
          <CardBody className="space-y-3">
            <ProgressBar value={contentPct} tone={contentTone} />
            <p className="text-xs text-fg-muted">
              {screens.length}{" "}
              {screens.length === 1 ? "Screen" : "Screens"} relevant
            </p>
            {filledRequired.length < requiredFields.length && (
              <p className="text-xs text-danger">
                {requiredFields.length - filledRequired.length} Pflichtfelder noch leer
              </p>
            )}
          </CardBody>
        </Card>
      </FadeIn>

      {/* Firebase-Status */}
      <FadeIn delay={0.35}>
        <Card className="sm:col-span-2 xl:col-span-3">
          <SectionHeader
            title="Firebase-Synchronisierung"
            href={`/missions/${missionId}/review`}
          />
          <CardBody className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  mission.firebase.sichtbar ? "bg-success" : "bg-fg-muted/40",
                )}
              />
              <span className="text-sm text-fg">
                {mission.firebase.sichtbar
                  ? "In App sichtbar"
                  : "Nicht in App sichtbar"}
              </span>
            </div>
            <div className="text-sm text-fg-muted">
              Zuletzt übertragen:{" "}
              <span className="font-medium text-fg">
                {formatDateTime(mission.firebase.zuletztUebertragenAm)}
              </span>
            </div>
          </CardBody>
        </Card>
      </FadeIn>
    </div>
  );
}
