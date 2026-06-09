"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "@/lib/domain/types";
import { OPERATIVE_WERT_KEYS } from "@/lib/domain/types";
import {
  kannStornieren,
  kannAbbrechen,
  kannOperativeWerteAendern,
  kannAktivieren,
  kannBeenden,
} from "@/lib/domain/status";
import {
  OPERATIVER_WERT_LABEL,
  OPERATIVER_WERT_EINHEIT,
  OPERATIVER_WERT_HILFE,
} from "@/lib/domain/labels";
import { useMissionStore } from "@/lib/store/missionStore";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Modal,
  Callout,
  Field,
  Input,
  Textarea,
} from "@/components/ui";
import { FadeIn, Collapse } from "@/components/motion";

/* ------------------------------------------------------------------ */
/* UC12 — Operative Werte live ändern                                  */
/* ------------------------------------------------------------------ */

function OperativeWerteEditor({ mission }: { mission: Mission }) {
  const setOperativeWerte = useMissionStore((s) => s.setOperativeWerte);
  const [values, setValues] = useState({ ...mission.operativeWerte });

  function handleChange(key: (typeof OPERATIVE_WERT_KEYS)[number], raw: string) {
    const parsed = parseFloat(raw.replace(",", "."));
    const next = isNaN(parsed) ? 0 : parsed;
    setValues((v) => ({ ...v, [key]: next }));
    setOperativeWerte(mission.id, { [key]: next });
  }

  return (
    <FadeIn delay={0.05}>
      <Card>
        <CardHeader>
          <CardTitle>Operative Werte (live änderbar)</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Callout tone="info" title="Eingeschränkte Editierbarkeit">
            Diese drei Werte sind die <strong>einzigen</strong> Konfigurationsfelder,
            die nach der Veröffentlichung noch geändert werden können. Alle übrigen
            Konfigurationsdaten sind gesperrt (REQ-UC11-008). Änderungen werden sofort
            an Firebase übertragen und im Audit Trail erfasst.
          </Callout>

          <div className="grid gap-4 sm:grid-cols-3">
            {OPERATIVE_WERT_KEYS.map((key) => (
              <Field
                key={key}
                label={OPERATIVER_WERT_LABEL[key]}
                htmlFor={`op-${key}`}
                help={OPERATIVER_WERT_HILFE[key]}
              >
                <div className="relative flex items-center">
                  <Input
                    id={`op-${key}`}
                    type="number"
                    min={0}
                    max={key === "taeglichesTeilnahmeLimit" ? 100 : 100}
                    step={key === "taeglichesTeilnahmeLimit" ? 1 : 0.1}
                    value={values[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="pr-8"
                  />
                  {OPERATIVER_WERT_EINHEIT[key] && (
                    <span className="pointer-events-none absolute right-2.5 text-xs text-fg-muted">
                      {OPERATIVER_WERT_EINHEIT[key]}
                    </span>
                  )}
                </div>
              </Field>
            ))}
          </div>
        </CardBody>
      </Card>
    </FadeIn>
  );
}

/* ------------------------------------------------------------------ */
/* Bestätigungs-Modal für Stornieren/Abbrechen                         */
/* ------------------------------------------------------------------ */

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (grund: string) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
}

function ActionModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  loading,
}: ActionModalProps) {
  const [grund, setGrund] = useState("");

  function handleConfirm() {
    onConfirm(grund);
    setGrund("");
  }

  function handleClose() {
    setGrund("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Field label="Grund (optional)" htmlFor="action-grund">
        <Textarea
          id="action-grund"
          rows={3}
          placeholder="Begründung für diese Aktion …"
          value={grund}
          onChange={(e) => setGrund(e.target.value)}
        />
      </Field>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Haupt-Komponente                                                    */
/* ------------------------------------------------------------------ */

export interface LifecycleActionsProps {
  mission: Mission;
}

export function LifecycleActions({ mission }: LifecycleActionsProps) {
  const cancelMission = useMissionStore((s) => s.cancelMission);
  const abortMission = useMissionStore((s) => s.abortMission);
  const activateMission = useMissionStore((s) => s.activateMission);
  const endMission = useMissionStore((s) => s.endMission);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [abortOpen, setAbortOpen] = useState(false);

  const canCancel = kannStornieren(mission);
  const canAbort = kannAbbrechen(mission);
  const canActivate = kannAktivieren(mission);
  const canEnd = kannBeenden(mission);
  const canEditOperativ = kannOperativeWerteAendern(mission);

  const hasActions = canCancel || canAbort || canActivate || canEnd || canEditOperativ;

  if (!hasActions) return null;

  return (
    <div className="space-y-4">
      {/* UC12: Operative Werte live ändern */}
      <AnimatePresence>
        {canEditOperativ && (
          <motion.div
            key="operative-werte"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <OperativeWerteEditor mission={mission} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulations-Aktionen (veroeffentlicht) */}
      <AnimatePresence>
        {(canActivate || canCancel) && (
          <motion.div
            key="veroe-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Lebenszyklussteuerung</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                {canCancel && (
                  <div className="space-y-2">
                    <p className="text-sm text-fg-muted">
                      Die Mission ist veröffentlicht aber noch nicht aktiv. Sie kann
                      jetzt storniert werden (UC10).
                    </p>
                    <Callout tone="warning" title="Stornierung">
                      Eine stornierte Mission wird sofort aus Firebase entfernt und ist
                      nicht mehr in der App sichtbar. Die Stornierung kann nicht
                      rückgängig gemacht werden.
                    </Callout>
                    <div className="flex flex-wrap gap-2">
                      {canActivate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateMission(mission.id)}
                        >
                          ▶ Aktivieren (Simulation)
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setCancelOpen(true)}
                      >
                        Mission stornieren
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulations-Aktionen (aktiv) */}
      <AnimatePresence>
        {(canAbort || canEnd) && (
          <motion.div
            key="aktiv-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Aktive Mission steuern</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                {canAbort && (
                  <div className="space-y-2">
                    <Callout tone="danger" title="Vorzeitiger Abbruch">
                      Ein Abbruch beendet die Mission sofort. Firebase wird sofort auf
                      „nicht sichtbar" gesetzt. Bereits vergebene Coupon-Sofortgewinne
                      bleiben gültig (BR-UC10-002/003). Dieser Schritt ist
                      unwiderruflich.
                    </Callout>
                    <div className="flex flex-wrap gap-2">
                      {canEnd && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => endMission(mission.id)}
                        >
                          ✓ Regulär beenden (Simulation)
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setAbortOpen(true)}
                      >
                        Aktive Mission abbrechen
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ActionModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={(grund) => {
          cancelMission(mission.id, grund || undefined);
          setCancelOpen(false);
        }}
        title="Mission stornieren"
        description="Die Mission wird vor Aktivierung zurückgezogen. Firebase wird sofort aktualisiert. Optional kann ein Grund angegeben werden."
        confirmLabel="Stornieren"
        confirmVariant="danger"
      />

      <ActionModal
        open={abortOpen}
        onClose={() => setAbortOpen(false)}
        onConfirm={(grund) => {
          abortMission(mission.id, grund || undefined);
          setAbortOpen(false);
        }}
        title="Aktive Mission abbrechen"
        description="Die laufende Mission wird sofort abgebrochen. Firebase wird auf ‚nicht sichtbar' gesetzt. Bereits vergebene Coupons bleiben gültig."
        confirmLabel="Mission abbrechen"
        confirmVariant="danger"
      />
    </div>
  );
}
