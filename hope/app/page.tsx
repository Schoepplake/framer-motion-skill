"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMissionStore } from "@/lib/store/missionStore";
import { useLoaded } from "@/lib/store/hooks";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerList, StaggerItem } from "@/components/motion/Stagger";
import { Button, EmptyState, Input, cn } from "@/components/ui";
import { MissionCard } from "@/components/dashboard/MissionCard";
import { StatsHeader } from "@/components/dashboard/StatsHeader";
import { StatusFilter, type StatusFilterValue } from "@/components/dashboard/StatusFilter";

/* ------------------------------------------------------------------ */
/* Skeleton card shown while the store is still loading                */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card animate-pulse">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded-md bg-surface-2" />
          <div className="h-3 w-2/5 rounded-md bg-surface-2" />
        </div>
        <div className="h-5 w-20 rounded-full bg-surface-2" />
      </div>
      <div className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="h-3 w-14 rounded bg-surface-2" />
            <div className="h-4 w-20 rounded bg-surface-2" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-14 rounded bg-surface-2" />
            <div className="h-4 w-28 rounded bg-surface-2" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-20 rounded bg-surface-2" />
          <div className="h-4 w-24 rounded bg-surface-2" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="h-5 w-24 rounded-full bg-surface-2" />
        <div className="h-4 w-16 rounded bg-surface-2" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Search icon                                                          */
/* ------------------------------------------------------------------ */

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard page                                                       */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const router = useRouter();
  const missions = useMissionStore((s) => s.missions);
  const createMission = useMissionStore((s) => s.createMission);
  const loaded = useLoaded();

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("alle");
  const [searchQuery, setSearchQuery] = useState("");

  function handleCreate() {
    const id = createMission();
    router.push(`/missions/${id}/grunddaten`);
  }

  const filteredMissions = useMemo(() => {
    let result = missions;

    if (statusFilter !== "alle") {
      result = result.filter((m) => m.status === statusFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((m) =>
        m.grunddaten.missionsName.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q),
      );
    }

    return result;
  }, [missions, statusFilter, searchQuery]);

  const createButton = (
    <Button variant="primary" size="md" onClick={handleCreate}>
      <PlusIcon className="h-4 w-4" />
      Neue Gewinnspiel-Mission
    </Button>
  );

  return (
    <div className="space-y-8">
      {/* ---- Page header ---- */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              Gewinnspiel-Missionen
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              Übersicht, Verwaltung und Konfiguration aller Gewinnspiel-Missionen
              für die PENNY App.
            </p>
          </div>
          <div className="shrink-0">{createButton}</div>
        </div>
      </FadeIn>

      {/* ---- Stats row ---- */}
      {loaded && missions.length > 0 && (
        <FadeIn delay={0.05}>
          <StatsHeader missions={missions} />
        </FadeIn>
      )}

      {/* ---- Filters ---- */}
      {loaded && missions.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            <div className="relative w-full sm:w-64">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <Input
                placeholder="Mission suchen …"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Missionen nach Name oder ID suchen"
              />
            </div>
          </div>
        </FadeIn>
      )}

      {/* ---- Loading skeletons ---- */}
      {!loaded && (
        <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <StaggerItem key={i}>
              <SkeletonCard />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {/* ---- Empty state (no missions at all) ---- */}
      {loaded && missions.length === 0 && (
        <FadeIn delay={0.1}>
          <EmptyState
            icon="🎰"
            title="Noch keine Missionen vorhanden"
            description="Erstellen Sie Ihre erste Gewinnspiel-Mission und konfigurieren Sie Mechanik, Gewinne und App-Inhalte."
            action={createButton}
          />
        </FadeIn>
      )}

      {/* ---- Empty state (filtered, but there are missions) ---- */}
      {loaded && missions.length > 0 && filteredMissions.length === 0 && (
        <FadeIn delay={0.05}>
          <EmptyState
            icon="🔍"
            title="Keine Missionen gefunden"
            description={
              searchQuery
                ? `Keine Mission enthält „${searchQuery}" im Namen oder der ID.`
                : "Für den gewählten Status gibt es keine Missionen."
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("alle");
                  setSearchQuery("");
                }}
              >
                Filter zurücksetzen
              </Button>
            }
          />
        </FadeIn>
      )}

      {/* ---- Mission grid ---- */}
      {loaded && filteredMissions.length > 0 && (
        <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMissions.map((mission) => (
            <StaggerItem key={mission.id}>
              <MissionCard mission={mission} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
