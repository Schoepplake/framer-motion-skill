/**
 * Hilfsfunktionen rund um den Audit Trail (UC13).
 */

import type { AuditAction, AuditEntry, Mission, OperativeWerte } from "../domain/types";
import { neueId } from "../domain/factory";
import { OPERATIVER_WERT_LABEL } from "../domain/labels";

export function touch(mission: Mission, benutzer: string, zeitpunkt: string): Mission {
  return { ...mission, geaendertAm: zeitpunkt, geaendertVon: benutzer };
}

export function withAudit(
  mission: Mission,
  benutzer: string,
  zeitpunkt: string,
  aktion: AuditAction,
  beschreibung: string,
  details?: string,
): Mission {
  const entry: AuditEntry = {
    id: neueId("audit"),
    zeitpunkt,
    benutzer,
    aktion,
    beschreibung,
    details,
  };
  return { ...mission, audit: [...mission.audit, entry] };
}

/** Beschreibt Änderungen an operativen Werten für den Audit-Eintrag. */
export function describeOperativeChanges(
  alt: OperativeWerte,
  neu: OperativeWerte,
): string {
  const teile: string[] = [];
  (Object.keys(neu) as (keyof OperativeWerte)[]).forEach((key) => {
    if (alt[key] !== neu[key]) {
      teile.push(`${OPERATIVER_WERT_LABEL[key]}: ${alt[key]} → ${neu[key]}`);
    }
  });
  return teile.join("; ");
}
