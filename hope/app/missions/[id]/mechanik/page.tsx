"use client";

import { motion } from "framer-motion";
import { useMission, useValidation } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { isKonfigurationEditierbar } from "@/lib/domain/status";
import { GEWINNSPIELMECHANIKEN, type Gewinnspielmechanik } from "@/lib/domain/types";
import { MECHANIK_LABEL, MECHANIK_BESCHREIBUNG } from "@/lib/domain/labels";
import { EditorPage } from "@/components/editor/EditorPage";
import { IssueList } from "@/components/editor/IssueList";
import { Card, CardBody } from "@/components/ui/Card";
import { Callout } from "@/components/ui/Callout";
import { cn } from "@/components/ui/cn";
import { StaggerList, StaggerItem } from "@/components/motion/Stagger";

/** Icon-Pfade pro Mechanik */
const MECHANIK_ICON: Record<Gewinnspielmechanik, string> = {
  rubellos: "🎟️",
  slot_machine: "🎰",
};

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const setMechanik = useMissionStore((s) => s.setMechanik);
  // Hooks müssen vor jedem bedingten Return aufgerufen werden (React-Regeln).
  const validation = useValidation(mission);

  if (!mission) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const mechanikIssues = validation?.byArea.mechanik ?? [];

  function handleSelect(mechanik: Gewinnspielmechanik) {
    if (!editierbar) return;
    setMechanik(params.id, mechanik);
  }

  return (
    <EditorPage
      ucId="UC03"
      title="Gewinnspielmechanik"
      description="Legt fest, wie der Kunde in der PENNY App an der Mission teilnimmt. Genau eine Mechanik je Mission."
      locked={!editierbar}
    >
      <StaggerList className="space-y-5">
        {/* Hinweis: HOPE konfiguriert, App führt aus */}
        <StaggerItem>
          <Callout tone="info" title="Konfiguration vs. Spielaktion">
            HOPE konfiguriert die Gewinnspielmechanik für die PENNY App. Die eigentliche
            Spielaktion (Rubbeln bzw. Slot starten) führt der Nutzer in der PENNY App
            durch — HOPE selbst führt keine Spielaktion aus (BR-UC03-002/003/004,
            REQ-UC03-007).
          </Callout>
        </StaggerItem>

        {/* Auswahl-Karten */}
        <StaggerItem>
          <div
            className="grid gap-4 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Gewinnspielmechanik auswählen"
          >
            {GEWINNSPIELMECHANIKEN.map((mechanik) => {
              const selected = mission.mechanik === mechanik;
              return (
                <MechanikCard
                  key={mechanik}
                  mechanik={mechanik}
                  selected={selected}
                  disabled={!editierbar}
                  onSelect={handleSelect}
                />
              );
            })}
          </div>
        </StaggerItem>

        {/* Validierungsfehler (VAL-005: keine Mechanik gewählt) */}
        {mechanikIssues.length > 0 && (
          <StaggerItem>
            <IssueList issues={mechanikIssues} />
          </StaggerItem>
        )}

        {/* Erweiterbarkeitshinweis (REQ-UC03-006) */}
        <StaggerItem>
          <Callout tone="neutral">
            Weitere Mechaniken (z. B. Glücksrad, Quizspiel) können künftig ergänzt werden,
            ohne bestehende Konfigurationen zu beeinflussen (REQ-UC03-006).
          </Callout>
        </StaggerItem>
      </StaggerList>
    </EditorPage>
  );
}

/* ------------------------------------------------------------------ */
/* Private Unterkomponente: eine Mechanik-Auswahlkarte                 */
/* ------------------------------------------------------------------ */

interface MechanikCardProps {
  mechanik: Gewinnspielmechanik;
  selected: boolean;
  disabled: boolean;
  onSelect: (m: Gewinnspielmechanik) => void;
}

function MechanikCard({ mechanik, selected, disabled, onSelect }: MechanikCardProps) {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        role="radio"
        aria-checked={selected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => onSelect(mechanik)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(mechanik);
          }
        }}
        className={cn(
          "relative cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          selected
            ? "border-primary ring-2 ring-primary ring-offset-1 shadow-lg"
            : "hover:border-primary/40 hover:shadow-md",
          disabled && "cursor-not-allowed opacity-60 pointer-events-none",
        )}
      >
        <CardBody className="flex flex-col gap-3 p-5">
          {/* Auswahl-Indikator */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-3xl" aria-hidden>
              {MECHANIK_ICON[mechanik]}
            </span>

            {/* Animierter Check-Kreis */}
            <motion.div
              initial={false}
              animate={
                selected
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.7, opacity: 0 }
              }
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow"
              aria-hidden
            >
              ✓
            </motion.div>
          </div>

          {/* Label */}
          <div>
            <p
              className={cn(
                "text-base font-semibold",
                selected ? "text-primary" : "text-fg",
              )}
            >
              {MECHANIK_LABEL[mechanik]}
            </p>
            <p className="mt-1 text-sm text-fg-muted leading-relaxed">
              {MECHANIK_BESCHREIBUNG[mechanik]}
            </p>
          </div>

          {/* Ausgewählt-Banner */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              <span aria-hidden>●</span> Ausgewählt
            </motion.div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
