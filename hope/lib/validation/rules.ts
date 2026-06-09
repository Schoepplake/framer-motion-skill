/**
 * Veröffentlichungsrelevante Validierungsregeln (VAL-001 … VAL-025).
 *
 * Zentral und konsistent abgebildet (NFR-MAINT-004). Jede Regel erzeugt
 * selbsterklärende Meldungen, die den betroffenen Bereich/das Feld benennen
 * (VAL-027/028/029).
 */

import type { Mission, Stammdaten } from "../domain/types";
import { getRelevanteScreens } from "../domain/screens";
import { formatDateRange } from "../format";
import type { CoverageResult } from "./coverage";
import type { ValidationIssue } from "./types";

function istUrlGueltig(wert: string): boolean {
  try {
    const u = new URL(wert.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function leer(wert: string | undefined | null): boolean {
  return !wert || wert.trim().length === 0;
}

export function runRules(
  mission: Mission,
  stammdaten: Stammdaten,
  coverage: CoverageResult,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (i: ValidationIssue) => issues.push(i);

  /* ---------------- Grunddaten (UC02) ---------------- */
  const { missionsName, zeitraum } = mission.grunddaten;

  if (leer(missionsName)) {
    add({
      code: "VAL-001",
      severity: "error",
      area: "grunddaten",
      field: "missionsName",
      message: "Der Missionsname ist ein Pflichtfeld und muss gefüllt sein.",
    });
  }
  if (leer(zeitraum.von)) {
    add({
      code: "VAL-002",
      severity: "error",
      area: "grunddaten",
      field: "zeitraumVon",
      message: "Der Missionszeitraum „von“ muss gefüllt sein.",
    });
  }
  if (leer(zeitraum.bis)) {
    add({
      code: "VAL-003",
      severity: "error",
      area: "grunddaten",
      field: "zeitraumBis",
      message: "Der Missionszeitraum „bis“ muss gefüllt sein.",
    });
  }
  if (zeitraum.von && zeitraum.bis && zeitraum.bis < zeitraum.von) {
    add({
      code: "VAL-004",
      severity: "error",
      area: "grunddaten",
      field: "zeitraumBis",
      message:
        "Der Missionszeitraum „bis“ darf nicht vor dem Zeitraum „von“ liegen.",
    });
  }

  /* ---------------- Mechanik (UC03) ---------------- */
  if (!mission.mechanik) {
    add({
      code: "VAL-005",
      severity: "error",
      area: "mechanik",
      message: "Es muss eine Gewinnspielmechanik ausgewählt sein.",
    });
  }

  /* ---------------- Coupon-Sofortgewinne (UC04) ---------------- */
  const promoIds = new Set(stammdaten.promoItems.map((p) => p.id));
  const mechIds = new Set(stammdaten.couponMechaniken.map((m) => m.id));

  if (mission.couponSofortgewinne.length === 0) {
    add({
      code: "VAL-010",
      severity: "error",
      area: "coupons",
      message:
        "Es muss mindestens ein Coupon-Sofortgewinn (Missionsziel) konfiguriert sein.",
    });
  }

  mission.couponSofortgewinne.forEach((c, idx) => {
    const name = c.bezeichnung?.trim() || `Coupon-Sofortgewinn ${idx + 1}`;

    if (!c.promoItemId || !promoIds.has(c.promoItemId)) {
      add({
        code: "VAL-011",
        severity: "error",
        area: "coupons",
        refId: c.id,
        field: "promoItemId",
        message: `${name}: Es muss ein gültiges Promo-Item zugeordnet sein.`,
      });
    }
    if (!c.couponMechanikId || !mechIds.has(c.couponMechanikId)) {
      add({
        code: "VAL-012",
        severity: "error",
        area: "coupons",
        refId: c.id,
        field: "couponMechanikId",
        message: `${name}: Es muss eine gültige Coupon-Mechanik zugeordnet sein.`,
      });
    }

    // VAL-019: gültiger Ausspielungszeitraum
    if (leer(c.ausspielung.von) || leer(c.ausspielung.bis)) {
      add({
        code: "VAL-019",
        severity: "error",
        area: "coupons",
        refId: c.id,
        field: "ausspielung",
        message: `${name}: Es muss ein vollständiger Ausspielungszeitraum (von/bis) gepflegt sein.`,
      });
    } else if (c.ausspielung.bis! < c.ausspielung.von!) {
      add({
        code: "VAL-019",
        severity: "error",
        area: "coupons",
        refId: c.id,
        field: "ausspielung",
        message: `${name}: Das Ausspielungsende darf nicht vor dem Ausspielungsbeginn liegen.`,
      });
    } else if (zeitraum.von && zeitraum.bis) {
      // VAL-020: innerhalb des Missionszeitraums
      if (c.ausspielung.von! < zeitraum.von || c.ausspielung.bis! > zeitraum.bis) {
        add({
          code: "VAL-020",
          severity: "error",
          area: "coupons",
          refId: c.id,
          field: "ausspielung",
          message: `${name}: Der Ausspielungszeitraum (${formatDateRange(
            c.ausspielung.von,
            c.ausspielung.bis,
          )}) muss innerhalb des Missionszeitraums (${formatDateRange(
            zeitraum.von,
            zeitraum.bis,
          )}) liegen.`,
        });
      }
    }
  });

  // VAL-023/024/025: lückenlose Coupon-Zeitabdeckung
  if (coverage.zeitraumGueltig && !coverage.vollstaendigAbgedeckt) {
    coverage.luecken.forEach((luecke) => {
      add({
        code: "VAL-024",
        severity: "error",
        area: "coupons",
        field: "coverage",
        message:
          `Im Zeitraum ${formatDateRange(luecke.von, luecke.bis)} ist kein ` +
          `Coupon-Sofortgewinn gültig. Reine Niete-/Lostopf-Zeiträume sind nicht ` +
          `erlaubt — dieser Zeitraum muss von mindestens einem Coupon abgedeckt werden.`,
      });
    });
  }

  /* ---------------- Lostopf (UC06) ---------------- */
  if (mission.lostopf.aktiv) {
    if (mission.lostopf.preise.length === 0) {
      add({
        code: "VAL-013",
        severity: "error",
        area: "lostopf",
        message:
          "Ein konfigurierter Lostopf benötigt für die Veröffentlichung mindestens einen Preis.",
      });
    }
    mission.lostopf.preise.forEach((p, idx) => {
      const name = p.beschreibung?.trim() || `Preis ${idx + 1}`;
      if (!(p.anzahlVerlosungen > 0)) {
        add({
          code: "VAL-014",
          severity: "error",
          area: "lostopf",
          refId: p.id,
          field: "anzahlVerlosungen",
          message: `${name}: Die Anzahl der Verlosungen muss größer als 0 sein.`,
        });
      }
      if (leer(p.beschreibung)) {
        add({
          code: "VAL-014",
          severity: "warning",
          area: "lostopf",
          refId: p.id,
          field: "beschreibung",
          message: `Preis ${idx + 1}: Es sollte eine Preisbeschreibung gepflegt werden.`,
        });
      }
    });
  }

  /* ---------------- Operative Werte (UC05/UC12) ---------------- */
  const ow = mission.operativeWerte;
  const bereich = (
    key: "gewinnwahrscheinlichkeit" | "sofortgewinngewichtung" | "taeglichesTeilnahmeLimit",
    code: string,
    label: string,
  ) => {
    const wert = ow[key];
    if (typeof wert !== "number" || Number.isNaN(wert) || wert < 0 || wert > 100) {
      add({
        code,
        severity: "error",
        area: "operativ",
        field: key,
        message: `${label} muss ein Wert zwischen 0 und 100 sein.`,
      });
    }
  };
  bereich("gewinnwahrscheinlichkeit", "VAL-015", "Die Gewinnwahrscheinlichkeit");
  bereich("sofortgewinngewichtung", "VAL-016", "Die Sofortgewinngewichtung");
  bereich("taeglichesTeilnahmeLimit", "VAL-017", "Das tägliche Teilnahme-Limit");

  /* ---------------- App-Inhalte & Screens (UC07) ---------------- */
  // VAL-006/007/008/009: relevante Screens vollständig, Texte/Bilder/URLs gültig.
  const screens = getRelevanteScreens(mission);
  for (const screen of screens) {
    const content = mission.appContent.screens[screen.id] ?? {};
    for (const field of screen.fields) {
      const wert = content[field.key];
      if (field.required && leer(wert)) {
        const code = field.type === "image" ? "VAL-008" : "VAL-007";
        add({
          code,
          severity: "error",
          area: "inhalte",
          refId: screen.id,
          field: field.key,
          message: `Screen „${screen.name}“: Das Pflichtfeld „${field.label}“ muss gefüllt sein.`,
        });
      }
      if (field.type === "url" && !leer(wert) && !istUrlGueltig(wert!)) {
        add({
          code: "VAL-009",
          severity: "error",
          area: "inhalte",
          refId: screen.id,
          field: field.key,
          message: `Screen „${screen.name}“: Die URL im Feld „${field.label}“ ist nicht formal gültig (erwartet http:// oder https://).`,
        });
      }
    }
  }

  return issues;
}
