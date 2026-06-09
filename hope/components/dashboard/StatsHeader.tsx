"use client";

import type { Mission, MissionStatus } from "@/lib/domain/types";
import { MISSION_STATUS } from "@/lib/domain/types";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/domain/labels";
import { Badge, Dot } from "@/components/ui";
import { AnimatedNumber } from "@/components/motion";

interface StatsHeaderProps {
  missions: Mission[];
}

export function StatsHeader({ missions }: StatsHeaderProps) {
  const counts = MISSION_STATUS.reduce<Record<MissionStatus, number>>(
    (acc, s) => {
      acc[s] = missions.filter((m) => m.status === s).length;
      return acc;
    },
    {} as Record<MissionStatus, number>,
  );

  const nonZeroStatuses = MISSION_STATUS.filter((s) => counts[s] > 0);

  if (missions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Gesamt */}
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-fg-muted">
        <span className="font-semibold text-fg">
          <AnimatedNumber value={missions.length} />
        </span>
        <span>Gesamt</span>
      </div>

      {/* Pro Status */}
      {nonZeroStatuses.map((status) => (
        <Badge key={status} tone={STATUS_TONE[status]}>
          <Dot tone={STATUS_TONE[status]} />
          <AnimatedNumber value={counts[status]} />
          <span className="ml-0.5">{STATUS_LABEL[status]}</span>
        </Badge>
      ))}
    </div>
  );
}
