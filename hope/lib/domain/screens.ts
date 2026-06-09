/**
 * Schema der apprelevanten Screens und Felder (UC07).
 *
 * Die relevanten Screens hängen von der gewählten Mechanik und den aktivierten
 * Ergebnisarten ab (BR-UC03-005). Dieses Schema ist die gemeinsame Referenz für
 * Inhaltspflege (UC07), Vorschau (UC08), Review (UC09) und Validierung.
 */

import type { AppFieldType, Mission } from "./types";
import { MECHANIK_LABEL } from "./labels";

export interface FieldDef {
  key: string;
  label: string;
  type: AppFieldType;
  required: boolean;
  help?: string;
  placeholder?: string;
}

export interface ScreenDef {
  id: string;
  name: string;
  beschreibung: string;
  /** Icon-Hinweis für die UI (lucide-artiger Name, frei interpretierbar). */
  icon: string;
  fields: FieldDef[];
}

/* ------------------------------------------------------------------ */
/* Statische Screen-Definitionen                                       */
/* ------------------------------------------------------------------ */

const INTRO: ScreenDef = {
  id: "intro",
  name: "Intro / Start",
  beschreibung: "Einstieg in das Gewinnspiel in der PENNY App.",
  icon: "play",
  fields: [
    { key: "titel", label: "Titel", type: "text", required: true, placeholder: "z. B. Großes PENNY Gewinnspiel" },
    { key: "beschreibung", label: "Beschreibungstext", type: "longtext", required: true },
    { key: "heroBild", label: "Hero-Bild", type: "image", required: true, help: "Großflächiges Bild auf dem Start-Screen." },
    { key: "startButton", label: "Start-Button", type: "button", required: true, placeholder: "z. B. Jetzt mitspielen" },
  ],
};

const SPIEL: ScreenDef = {
  id: "spiel",
  name: "Spiel",
  beschreibung: "Der Screen, auf dem die Spielaktion in der App stattfindet.",
  icon: "sparkles",
  fields: [
    { key: "anleitung", label: "Anleitungstext", type: "longtext", required: true, help: "Erklärt dem Kunden, wie die Spielaktion funktioniert." },
    { key: "aktionBild", label: "Aktions-/Hintergrundbild", type: "image", required: false },
    { key: "aktionButton", label: "Aktions-Button", type: "button", required: true, placeholder: "z. B. Rubbeln / Drehen" },
  ],
};

const GEWINN: ScreenDef = {
  id: "gewinn",
  name: "Gewinn (Coupon)",
  beschreibung: "Ergebnis-Screen bei einem Coupon-Sofortgewinn.",
  icon: "gift",
  fields: [
    { key: "titel", label: "Titel", type: "text", required: true, placeholder: "z. B. Glückwunsch!" },
    { key: "text", label: "Gewinntext", type: "longtext", required: true },
    { key: "couponHinweis", label: "Coupon-Hinweis", type: "longtext", required: false, help: "Hinweis zur Einlösung des Coupons." },
    { key: "bild", label: "Bild", type: "image", required: false },
    { key: "button", label: "Button", type: "button", required: true, placeholder: "z. B. Coupon ansehen" },
  ],
};

const NIETE: ScreenDef = {
  id: "niete",
  name: "Niete",
  beschreibung: "Ergebnis-Screen, wenn kein Gewinn erzielt wurde.",
  icon: "frown",
  fields: [
    { key: "titel", label: "Titel", type: "text", required: true, placeholder: "z. B. Leider kein Gewinn" },
    { key: "text", label: "Text", type: "longtext", required: true },
    { key: "button", label: "Button", type: "button", required: true, placeholder: "z. B. Schließen" },
  ],
};

const LOSTOPF: ScreenDef = {
  id: "lostopf",
  name: "Lostopf-Ergebnis",
  beschreibung:
    "Eigener apprelevanter Screen für die Lostopf-Teilnahme (REQ-UC05-010).",
  icon: "ticket",
  fields: [
    { key: "titel", label: "Titel", type: "text", required: true, placeholder: "z. B. Du bist im Lostopf!" },
    { key: "text", label: "Text", type: "longtext", required: true },
    { key: "teilnahmeHinweis", label: "Teilnahmehinweis", type: "longtext", required: true, help: "Erklärt die Teilnahme an der Sachpreisverlosung." },
    { key: "button", label: "Button", type: "button", required: true, placeholder: "z. B. Verstanden" },
  ],
};

const RECHTLICHES: ScreenDef = {
  id: "rechtliches",
  name: "Rechtliches",
  beschreibung: "Teilnahmebedingungen und rechtliche Hinweise.",
  icon: "scale",
  fields: [
    { key: "teilnahmebedingungen", label: "Teilnahmebedingungen", type: "legal", required: true },
    { key: "teilnahmebedingungenUrl", label: "Teilnahmebedingungen (URL)", type: "url", required: false, placeholder: "https://…" },
    { key: "datenschutzUrl", label: "Datenschutz (URL)", type: "url", required: true, placeholder: "https://…" },
  ],
};

/**
 * Liefert die für die konkrete Mission relevanten Screens.
 * - Intro, Spiel, Gewinn (Coupon immer möglich) und Rechtliches immer.
 * - Niete-Screen nur, wenn Niete aktiv ist.
 * - Lostopf-Screen nur, wenn Lostopf aktiv ist.
 */
export function getRelevanteScreens(mission: Mission): ScreenDef[] {
  const screens: ScreenDef[] = [INTRO, mechanikSpielScreen(mission), GEWINN];
  if (mission.ergebnisarten.nieteAktiv) screens.push(NIETE);
  if (mission.lostopf.aktiv) screens.push(LOSTOPF);
  screens.push(RECHTLICHES);
  return screens;
}

/** Spiel-Screen mit mechanikabhängiger Beschriftung. */
function mechanikSpielScreen(mission: Mission): ScreenDef {
  if (!mission.mechanik) return SPIEL;
  const mechanikName = MECHANIK_LABEL[mission.mechanik];
  return {
    ...SPIEL,
    name: `Spiel · ${mechanikName}`,
    beschreibung: `Spielaktion „${mechanikName}“ in der PENNY App.`,
  };
}

export const ALLE_SCREEN_DEFS: ScreenDef[] = [
  INTRO,
  SPIEL,
  GEWINN,
  NIETE,
  LOSTOPF,
  RECHTLICHES,
];
