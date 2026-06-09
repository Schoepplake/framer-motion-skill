/**
 * Typen für Validierungsergebnisse.
 *
 * Fehler (severity "error") blockieren die Veröffentlichung (REQ-UC08-004).
 * Hinweise/Warnungen blockieren nicht, machen aber auf Lücken aufmerksam.
 */

export type Severity = "error" | "warning" | "info";

/** Fachliche Bereiche, denen eine Validierung zugeordnet ist (= Editor-Tabs). */
export type ValidationArea =
  | "grunddaten"
  | "mechanik"
  | "coupons"
  | "ergebnisarten"
  | "lostopf"
  | "inhalte"
  | "operativ";

export interface ValidationIssue {
  /** Validierungs-Code aus dem Anforderungsdokument, z. B. "VAL-001". */
  code: string;
  severity: Severity;
  area: ValidationArea;
  /** Selbsterklärende, fachlich verständliche Meldung (VAL-027/028). */
  message: string;
  /** Betroffenes Feld für feldnahe Anzeige (REQ-UC06-006). */
  field?: string;
  /** Betroffene Entität (Coupon-, Preis- oder Screen-ID). */
  refId?: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  /** Nur blockierende Fehler (severity "error"). */
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  /** true, wenn keine blockierenden Fehler vorliegen (REQ-UC08-004). */
  veroeffentlichbar: boolean;
  /** Issues gruppiert nach Bereich (für Tab-Badges & Review-Sicht). */
  byArea: Record<ValidationArea, ValidationIssue[]>;
}

export const VALIDATION_AREAS: ValidationArea[] = [
  "grunddaten",
  "mechanik",
  "coupons",
  "ergebnisarten",
  "lostopf",
  "inhalte",
  "operativ",
];
