"use client";

import { useState } from "react";
import Link from "next/link";
import { MECHANIK_LABEL } from "@/lib/domain/labels";
import { validateMission } from "@/lib/validation";
import { useStammdaten } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { formatDateRange, formatRelative } from "@/lib/format";
import type { Mission } from "@/lib/domain/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  StatusBadge,
  Badge,
  Button,
  Modal,
  cn,
} from "@/components/ui";

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMission = useMissionStore((s) => s.deleteMission);
  const stammdaten = useStammdaten();

  const validation = validateMission(mission, stammdaten);
  const errorCount = validation.errors.length;
  const isDraft = mission.status === "entwurf";

  const missionName =
    mission.grunddaten.missionsName.trim() || "Unbenannte Mission";
  const mechanikLabel = mission.mechanik ? MECHANIK_LABEL[mission.mechanik] : "—";
  const zeitraum = formatDateRange(
    mission.grunddaten.zeitraum.von,
    mission.grunddaten.zeitraum.bis,
  );
  const geaendert = formatRelative(mission.geaendertAm);

  function handleDelete() {
    deleteMission(mission.id);
    setDeleteOpen(false);
  }

  return (
    <>
      <Card className="group flex flex-col transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="min-w-0 flex-1">
            <Link
              href={`/missions/${mission.id}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              <CardTitle className="truncate text-base group-hover:text-primary transition-colors">
                {missionName}
              </CardTitle>
            </Link>
            <CardDescription className="mt-1 font-mono text-xs">
              {mission.id}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={mission.status} />
            {isDraft && (
              <button
                type="button"
                aria-label="Mission löschen"
                onClick={() => setDeleteOpen(true)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-fg-muted",
                  "opacity-0 transition-opacity group-hover:opacity-100",
                  "hover:bg-danger-soft hover:text-danger focus-visible:opacity-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-danger",
                )}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardBody className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                Mechanik
              </p>
              <p className="mt-0.5 text-fg">{mechanikLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                Zeitraum
              </p>
              <p className="mt-0.5 text-fg">{zeitraum}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
              Zuletzt geändert
            </p>
            <p className="mt-0.5 text-sm text-fg">{geaendert}</p>
          </div>
        </CardBody>

        <CardFooter className="justify-between">
          {isDraft ? (
            errorCount > 0 ? (
              <Badge tone="warning">
                <span className="font-semibold">{errorCount}</span>{" "}
                {errorCount === 1 ? "offener Punkt" : "offene Punkte"}
              </Badge>
            ) : (
              <Badge tone="success">bereit</Badge>
            )
          ) : (
            <span />
          )}
          <Link
            href={`/missions/${mission.id}`}
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium text-primary",
              "hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded",
            )}
          >
            Öffnen
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </CardFooter>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Entwurf löschen"
        description={`Möchten Sie den Entwurf „${missionName}" unwiderruflich löschen?`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Löschen
            </Button>
          </>
        }
      />
    </>
  );
}

/* ---------- Inline-Icons (lucide-ähnlich, kein extra Paket) ---------- */

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
