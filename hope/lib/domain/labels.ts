/**
 * Fachlich verständliche deutsche Beschriftungen für Enums und Schlüssel
 * (NFR-USAB-007: eindeutige, fachlich verständliche Beschriftung).
 */

import type {
  AuditAction,
  Ergebnisart,
  Gewinnspielmechanik,
  MissionStatus,
  OperativerWertKey,
} from "./types";

export const STATUS_LABEL: Record<MissionStatus, string> = {
  entwurf: "Entwurf",
  veroeffentlicht: "Veröffentlicht",
  aktiv: "Aktiv",
  beendet: "Beendet",
  storniert: "Storniert",
  abgebrochen: "Abgebrochen",
};

export const STATUS_BESCHREIBUNG: Record<MissionStatus, string> = {
  entwurf: "Mission ist in Bearbeitung und noch nicht veröffentlicht.",
  veroeffentlicht:
    "Mission wurde freigegeben und an Firebase übergeben, ist aber noch nicht aktiv.",
  aktiv: "Mission läuft aktuell.",
  beendet: "Mission ist regulär abgeschlossen.",
  storniert: "Veröffentlichte Mission wurde vor Aktivierung zurückgezogen.",
  abgebrochen: "Aktive Mission wurde vorzeitig beendet.",
};

/** Semantische Tönung für StatusBadge & Co. */
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export const STATUS_TONE: Record<MissionStatus, StatusTone> = {
  entwurf: "neutral",
  veroeffentlicht: "info",
  aktiv: "success",
  beendet: "neutral",
  storniert: "warning",
  abgebrochen: "danger",
};

export const MECHANIK_LABEL: Record<Gewinnspielmechanik, string> = {
  rubellos: "Rubellos",
  slot_machine: "Slot-Machine",
};

export const MECHANIK_BESCHREIBUNG: Record<Gewinnspielmechanik, string> = {
  rubellos:
    "Der Kunde rubbelt in der PENNY App eine Fläche frei und erfährt sein Ergebnis.",
  slot_machine:
    "Der Kunde startet in der PENNY App eine Slot-Machine und erfährt sein Ergebnis.",
};

export const ERGEBNISART_LABEL: Record<Ergebnisart, string> = {
  coupon_sofortgewinn: "Coupon-Sofortgewinn",
  niete: "Niete",
  lostopf: "Lostopf / Sachpreisverlosung",
};

export const ERGEBNISART_BESCHREIBUNG: Record<Ergebnisart, string> = {
  coupon_sofortgewinn: "Kunde gewinnt direkt einen Coupon.",
  niete: "Kunde erhält keinen Coupon und keinen Lostopf-Eintrag.",
  lostopf:
    "Kunde erhält keinen Coupon, wird aber in eine Sachpreisverlosung aufgenommen.",
};

export const OPERATIVER_WERT_LABEL: Record<OperativerWertKey, string> = {
  gewinnwahrscheinlichkeit: "Gewinnwahrscheinlichkeit",
  sofortgewinngewichtung: "Sofortgewinngewichtung",
  taeglichesTeilnahmeLimit: "Tägliches Teilnahme-Limit pro Teilnehmer",
};

export const OPERATIVER_WERT_EINHEIT: Record<OperativerWertKey, string> = {
  gewinnwahrscheinlichkeit: "%",
  sofortgewinngewichtung: "%",
  taeglichesTeilnahmeLimit: "",
};

export const OPERATIVER_WERT_HILFE: Record<OperativerWertKey, string> = {
  gewinnwahrscheinlichkeit:
    "Wahrscheinlichkeit eines Gewinns je Spielaktion. Wert zwischen 0 und 100 %.",
  sofortgewinngewichtung:
    "Gewichtung des Sofortgewinns. Wert zwischen 0 und 100 %.",
  taeglichesTeilnahmeLimit:
    "Maximale Anzahl Teilnahmen pro Teilnehmer und Tag. Wert zwischen 0 und 100.",
};

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  mission_erstellt: "Mission erstellt",
  grunddaten_geaendert: "Grunddaten geändert",
  mechanik_geaendert: "Gewinnspielmechanik geändert",
  coupon_hinzugefuegt: "Coupon-Sofortgewinn hinzugefügt",
  coupon_geaendert: "Coupon-Sofortgewinn geändert",
  coupon_entfernt: "Coupon-Sofortgewinn entfernt",
  ergebnisarten_geaendert: "Ergebnisarten geändert",
  lostopf_geaendert: "Lostopf geändert",
  inhalte_geaendert: "App-Inhalte geändert",
  operative_werte_geaendert: "Operative Werte geändert",
  veroeffentlicht: "Veröffentlicht",
  storniert: "Storniert",
  abgebrochen: "Abgebrochen",
  aktiviert: "Aktiviert",
  beendet: "Beendet",
  validierung_fehlgeschlagen: "Validierung fehlgeschlagen",
};

/** Fachliche Bereiche der Konfiguration (für Navigation & Validierungs-Zuordnung). */
export type EditorBereich =
  | "grunddaten"
  | "mechanik"
  | "coupons"
  | "ergebnisarten"
  | "lostopf"
  | "inhalte"
  | "vorschau"
  | "operativ"
  | "review"
  | "audit";

export const BEREICH_LABEL: Record<EditorBereich, string> = {
  grunddaten: "Grunddaten",
  mechanik: "Mechanik",
  coupons: "Coupon-Sofortgewinne",
  ergebnisarten: "Ergebnisarten",
  lostopf: "Lostopf",
  inhalte: "App-Inhalte",
  vorschau: "Vorschau",
  operativ: "Operative Werte",
  review: "Review & Veröffentlichung",
  audit: "Audit Trail",
};
