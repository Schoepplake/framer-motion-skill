"use client";

/**
 * UC04 — Coupon-Sofortgewinne
 *
 * Konfiguration aller Coupon-Sofortgewinne einer Mission.
 * Zentrale Seite für die Gewinnlogik: Promo-Items, Coupon-Mechaniken,
 * Ausspielungszeiträume und die Timeline-Visualisierung der Zeitabdeckung.
 *
 * REQ-UC04-004/005, VAL-011/012/019/020/021/022/023/024, BR-UC04-002/003/006/007/008
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useMission,
  useStammdaten,
  useValidation,
  useCoverage,
} from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { isKonfigurationEditierbar } from "@/lib/domain/status";
import { formatDateRange } from "@/lib/format";
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
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StaggerList, StaggerItem } from "@/components/motion/Stagger";
import { Collapse } from "@/components/motion/Collapse";
import { CouponTimeline } from "@/components/coupons/CouponTimeline";

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const stammdaten = useStammdaten();
  const addCoupon = useMissionStore((s) => s.addCoupon);
  const updateCoupon = useMissionStore((s) => s.updateCoupon);
  const removeCoupon = useMissionStore((s) => s.removeCoupon);

  /* Expanded-State für jede Coupon-Karte */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const validation = useValidation(mission);
  const coverage = useCoverage(mission);

  if (!mission) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const couponIssues = validation?.byArea.coupons ?? [];

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function isExpanded(id: string) {
    /* Default: expandiert, wenn gerade hinzugefügt (kein Wert in State) */
    return id in expanded ? expanded[id] : true;
  }

  function couponFieldError(couponId: string, field: string): string | null {
    return (
      couponIssues.find(
        (i) => i.refId === couponId && i.field === field && i.severity === "error",
      )?.message ?? null
    );
  }

  function couponAllIssues(couponId: string) {
    return couponIssues.filter((i) => i.refId === couponId);
  }

  function handleAdd() {
    const newId = addCoupon(params.id);
    setExpanded((prev) => ({ ...prev, [newId]: true }));
  }

  const { couponSofortgewinne } = mission;

  return (
    <EditorPage
      ucId="UC04"
      title="Coupon-Sofortgewinne"
      description="Konfigurieren Sie alle Coupon-Sofortgewinne dieser Mission: Promo-Items, Mechaniken und Ausspielungszeiträume."
      locked={!editierbar}
      actions={
        editierbar ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
          >
            + Coupon-Sofortgewinn hinzufügen
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {/* === Hinweis-Callouts === */}
        <StaggerList className="space-y-2">
          <StaggerItem>
            <Callout tone="info" title="Überschneidungen erlaubt (BR-UC04-006)">
              Mehrere Coupons dürfen sich zeitlich überschneiden (VAL-021). Sind
              mehrere Coupons gleichzeitig gültig, wird einer zufällig/gleichwertig
              ausgespielt (VAL-022, BR-UC04-007).
            </Callout>
          </StaggerItem>
          <StaggerItem>
            <Callout tone="neutral" title="Keine Gewichtung initial (BR-UC04-008)">
              Im initialen Umfang werden gleichzeitig gültige Coupons gleichwertig
              ohne zusätzliche Gewichtung ausgewählt.
            </Callout>
          </StaggerItem>
        </StaggerList>

        {/* === Timeline-Karte === */}
        {coverage && (
          <StaggerItem>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Zeitabdeckung — Übersicht</CardTitle>
                  <CardDescription>
                    Der gesamte Missionszeitraum muss lückenlos durch mindestens
                    einen Coupon-Sofortgewinn abgedeckt sein (REQ-GEN-011, VAL-023/024).
                  </CardDescription>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <CouponTimeline mission={mission} coverage={coverage} />

                {/* Coverage-Status */}
                {!coverage.zeitraumGueltig ? (
                  <Callout tone="info">
                    Bitte zuerst den Missionszeitraum in den Grunddaten vollständig
                    angeben, damit die Abdeckung berechnet werden kann.
                  </Callout>
                ) : coverage.vollstaendigAbgedeckt ? (
                  <Callout tone="success" title="Vollständig abgedeckt">
                    Der gesamte Missionszeitraum ist durch mindestens einen
                    Coupon-Sofortgewinn abgedeckt.
                  </Callout>
                ) : (
                  <Callout tone="danger" title="Zeitraum nicht vollständig abgedeckt">
                    <p className="mb-2">
                      Folgende Zeiträume sind nicht abgedeckt — dies blockiert die
                      Veröffentlichung (VAL-023/024, REQ-GEN-011):
                    </p>
                    <ul className="space-y-0.5 pl-2">
                      {coverage.luecken.map((l) => (
                        <li
                          key={`${l.von}__${l.bis}`}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                          {formatDateRange(l.von, l.bis)}
                          {" "}
                          <span className="text-fg-muted">
                            ({l.tage} {l.tage === 1 ? "Tag" : "Tage"})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Callout>
                )}
              </CardBody>
            </Card>
          </StaggerItem>
        )}

        {/* === Coupon-Liste === */}
        {couponSofortgewinne.length === 0 ? (
          <EmptyState
            icon="🎫"
            title="Noch keine Coupon-Sofortgewinne"
            description="Fügen Sie mindestens einen Coupon-Sofortgewinn hinzu, der den gesamten Missionszeitraum abdeckt."
            action={
              editierbar ? (
                <Button variant="primary" onClick={handleAdd}>
                  Ersten Coupon-Sofortgewinn hinzufügen
                </Button>
              ) : undefined
            }
          />
        ) : (
          <StaggerList className="space-y-3">
            <AnimatePresence mode="popLayout">
              {couponSofortgewinne.map((coupon) => {
                const open = isExpanded(coupon.id);
                const issues = couponAllIssues(coupon.id);
                const hasErrors = issues.some((i) => i.severity === "error");

                return (
                  <StaggerItem key={coupon.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Card
                        className={
                          hasErrors ? "border-danger/40" : undefined
                        }
                      >
                        {/* Karten-Header (klickbar zum Auf-/Zuklappen) */}
                        <CardHeader className="cursor-pointer select-none">
                          <button
                            type="button"
                            className="flex flex-1 items-start gap-3 text-left"
                            onClick={() => toggleExpand(coupon.id)}
                            aria-expanded={open}
                          >
                            <div className="min-w-0 flex-1">
                              <CardTitle className="flex items-center gap-2">
                                <span className="truncate">
                                  {coupon.bezeichnung || (
                                    <span className="text-fg-muted font-normal italic">
                                      Coupon ohne Bezeichnung
                                    </span>
                                  )}
                                </span>
                                {hasErrors && (
                                  <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                                    {issues.filter((i) => i.severity === "error").length}
                                  </span>
                                )}
                              </CardTitle>
                              {(coupon.ausspielung.von || coupon.ausspielung.bis) && (
                                <CardDescription>
                                  Ausspielung:{" "}
                                  {formatDateRange(
                                    coupon.ausspielung.von,
                                    coupon.ausspielung.bis,
                                  )}
                                </CardDescription>
                              )}
                            </div>
                            <motion.span
                              animate={{ rotate: open ? 0 : -90 }}
                              transition={{ duration: 0.2 }}
                              className="shrink-0 text-fg-muted"
                              aria-hidden
                            >
                              ▾
                            </motion.span>
                          </button>
                        </CardHeader>

                        {/* Aufklappbarer Inhaltsbereich */}
                        <Collapse open={open}>
                          <CardBody className="space-y-5">
                            {/* Bezeichnung */}
                            <Field
                              label="Bezeichnung"
                              htmlFor={`bez-${coupon.id}`}
                              required
                              help="Interne Bezeichnung des Coupon-Sofortgewinns."
                              error={couponFieldError(coupon.id, "bezeichnung")}
                            >
                              <Input
                                id={`bez-${coupon.id}`}
                                value={coupon.bezeichnung}
                                placeholder="z. B. 10 % Rabatt auf alle Frischetheken-Produkte"
                                disabled={!editierbar}
                                invalid={!!couponFieldError(coupon.id, "bezeichnung")}
                                onChange={(e) =>
                                  updateCoupon(params.id, coupon.id, {
                                    bezeichnung: e.target.value,
                                  })
                                }
                              />
                            </Field>

                            <div className="grid gap-4 sm:grid-cols-2">
                              {/* Promo-Item */}
                              <Field
                                label="Promo-Item"
                                htmlFor={`promo-${coupon.id}`}
                                required
                                help="Promo-Item aus dem Promo-Item-Pool (VAL-011, BR-UC04-002)."
                                error={couponFieldError(coupon.id, "promoItemId")}
                              >
                                <Select
                                  id={`promo-${coupon.id}`}
                                  value={coupon.promoItemId ?? ""}
                                  disabled={!editierbar}
                                  invalid={!!couponFieldError(coupon.id, "promoItemId")}
                                  onChange={(e) =>
                                    updateCoupon(params.id, coupon.id, {
                                      promoItemId: e.target.value || null,
                                    })
                                  }
                                >
                                  <option value="">— Promo-Item auswählen —</option>
                                  {stammdaten.promoItems.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </Select>
                              </Field>

                              {/* Coupon-Mechanik */}
                              <Field
                                label="Coupon-Mechanik"
                                htmlFor={`mech-${coupon.id}`}
                                required
                                help="Coupon-Mechanik aus den Stammdaten (VAL-012, BR-UC04-003)."
                                error={couponFieldError(coupon.id, "couponMechanikId")}
                              >
                                <Select
                                  id={`mech-${coupon.id}`}
                                  value={coupon.couponMechanikId ?? ""}
                                  disabled={!editierbar}
                                  invalid={
                                    !!couponFieldError(coupon.id, "couponMechanikId")
                                  }
                                  onChange={(e) =>
                                    updateCoupon(params.id, coupon.id, {
                                      couponMechanikId: e.target.value || null,
                                    })
                                  }
                                >
                                  <option value="">— Coupon-Mechanik auswählen —</option>
                                  {stammdaten.couponMechaniken.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </Select>
                              </Field>
                            </div>

                            {/* Ausspielungszeitraum */}
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field
                                label="Ausspielung von"
                                htmlFor={`aus-von-${coupon.id}`}
                                required
                                help="Startdatum der Coupon-Ausspielung — innerhalb des Missionszeitraums (REQ-UC04-005, VAL-019)."
                                error={couponFieldError(coupon.id, "ausspielungVon")}
                              >
                                <Input
                                  id={`aus-von-${coupon.id}`}
                                  type="date"
                                  value={coupon.ausspielung.von ?? ""}
                                  disabled={!editierbar}
                                  invalid={
                                    !!couponFieldError(coupon.id, "ausspielungVon")
                                  }
                                  onChange={(e) =>
                                    updateCoupon(params.id, coupon.id, {
                                      ausspielung: {
                                        von: e.target.value || null,
                                        bis: coupon.ausspielung.bis,
                                      },
                                    })
                                  }
                                />
                              </Field>

                              <Field
                                label="Ausspielung bis"
                                htmlFor={`aus-bis-${coupon.id}`}
                                required
                                help="Enddatum der Coupon-Ausspielung (REQ-UC04-005, VAL-020)."
                                error={couponFieldError(coupon.id, "ausspielungBis")}
                              >
                                <Input
                                  id={`aus-bis-${coupon.id}`}
                                  type="date"
                                  value={coupon.ausspielung.bis ?? ""}
                                  disabled={!editierbar}
                                  invalid={
                                    !!couponFieldError(coupon.id, "ausspielungBis")
                                  }
                                  onChange={(e) =>
                                    updateCoupon(params.id, coupon.id, {
                                      ausspielung: {
                                        von: coupon.ausspielung.von,
                                        bis: e.target.value || null,
                                      },
                                    })
                                  }
                                />
                              </Field>
                            </div>

                            {/* Feldübergreifende Coupon-Issues */}
                            {issues.filter((i) => !i.field).length > 0 && (
                              <IssueList
                                issues={issues.filter((i) => !i.field)}
                              />
                            )}
                          </CardBody>

                          {editierbar && (
                            <CardFooter>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  removeCoupon(params.id, coupon.id)
                                }
                              >
                                Coupon entfernen
                              </Button>
                            </CardFooter>
                          )}
                        </Collapse>
                      </Card>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </AnimatePresence>
          </StaggerList>
        )}

        {/* Bereichsübergreifende Coupon-Issues (ohne refId) */}
        {couponIssues.filter((i) => !i.refId).length > 0 && (
          <IssueList issues={couponIssues.filter((i) => !i.refId)} />
        )}

        {/* Hinzufügen-Button unten (Convenience) */}
        {editierbar && couponSofortgewinne.length > 0 && (
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={handleAdd}>
              + Weiteren Coupon-Sofortgewinn hinzufügen
            </Button>
          </div>
        )}
      </div>
    </EditorPage>
  );
}
