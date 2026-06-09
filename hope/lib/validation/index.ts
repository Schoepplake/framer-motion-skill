/**
 * Validierungs-Orchestrator.
 *
 * Führt alle veröffentlichungsrelevanten Validierungen aus (REQ-UC08-003),
 * bestimmt die Veröffentlichbarkeit (REQ-UC08-004) und gruppiert Issues nach
 * Bereich für Tab-Badges und die Review-Sicht.
 */

import type { Mission, Stammdaten } from "../domain/types";
import { computeCouponCoverage, type CoverageResult } from "./coverage";
import { runRules } from "./rules";
import {
  VALIDATION_AREAS,
  type ValidationArea,
  type ValidationIssue,
  type ValidationResult,
} from "./types";

export * from "./types";
export { computeCouponCoverage } from "./coverage";
export type { CoverageResult, CoverageSegment } from "./coverage";

function emptyByArea(): Record<ValidationArea, ValidationIssue[]> {
  return VALIDATION_AREAS.reduce(
    (acc, area) => {
      acc[area] = [];
      return acc;
    },
    {} as Record<ValidationArea, ValidationIssue[]>,
  );
}

export function validateMission(
  mission: Mission,
  stammdaten: Stammdaten,
  coverage?: CoverageResult,
): ValidationResult {
  const cov = coverage ?? computeCouponCoverage(mission);
  const issues = runRules(mission, stammdaten, cov);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  const byArea = emptyByArea();
  for (const issue of issues) byArea[issue.area].push(issue);

  return {
    issues,
    errors,
    warnings,
    veroeffentlichbar: errors.length === 0,
    byArea,
  };
}

/** Komfort: nur die blockierenden Fehler eines Bereichs. */
export function fehlerImBereich(
  result: ValidationResult,
  area: ValidationArea,
): ValidationIssue[] {
  return result.byArea[area].filter((i) => i.severity === "error");
}
