"use client";

import { useEffect } from "react";
import { useMissionStore } from "@/lib/store/missionStore";

/** Lädt Missionen + Stammdaten beim ersten Mount (Client-seitig). */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const load = useMissionStore((s) => s.load);
  const loaded = useMissionStore((s) => s.loaded);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  return <>{children}</>;
}
