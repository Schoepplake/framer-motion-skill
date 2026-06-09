/**
 * Komfort-Hooks rund um den Mission-Store. Diese sind die bevorzugte
 * Schnittstelle für UI-Komponenten.
 */

"use client";

import { useMemo } from "react";
import type { Mission } from "../domain/types";
import {
  computeCouponCoverage,
  type CoverageResult,
  validateMission,
  type ValidationResult,
} from "../validation";
import { useMissionStore } from "./missionStore";

/** Eine Mission anhand ihrer ID (oder undefined). */
export function useMission(id: string): Mission | undefined {
  return useMissionStore((s) => s.missions.find((m) => m.id === id));
}

export function useStammdaten() {
  return useMissionStore((s) => s.stammdaten);
}

export function useCurrentUser() {
  return useMissionStore((s) => s.currentUser);
}

export function useLoaded() {
  return useMissionStore((s) => s.loaded);
}

/** Vollständiges Validierungsergebnis einer Mission (memoisiert). */
export function useValidation(mission: Mission | undefined): ValidationResult | null {
  const stammdaten = useStammdaten();
  return useMemo(
    () => (mission ? validateMission(mission, stammdaten) : null),
    [mission, stammdaten],
  );
}

/** Coupon-Zeitabdeckung einer Mission (memoisiert). */
export function useCoverage(mission: Mission | undefined): CoverageResult | null {
  return useMemo(
    () => (mission ? computeCouponCoverage(mission) : null),
    [mission],
  );
}
