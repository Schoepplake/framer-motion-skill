/**
 * Statusmodell und zulässige Statuswechsel (Statusmodell, REQ-STA-002).
 *
 * Statuswechsel sind nur bei zulässigen Voraussetzungen erlaubt. Diese Datei
 * kapselt die erlaubten Übergänge sowie abgeleitete Berechtigungen (welche
 * Aktionen in welchem Status möglich sind).
 */

import type { Mission, MissionStatus } from "./types";

/** Erlaubte Statusübergänge. */
const TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  entwurf: ["veroeffentlicht"], // via UC09 (nach Validierung)
  veroeffentlicht: ["aktiv", "storniert"], // Aktivierung (Zeit) bzw. UC10
  aktiv: ["beendet", "abgebrochen"], // regulär bzw. UC11
  beendet: [],
  storniert: [],
  abgebrochen: [],
};

/** Endzustände — keine weiteren Übergänge möglich. */
export const TERMINAL_STATUSES: MissionStatus[] = [
  "beendet",
  "storniert",
  "abgebrochen",
];

export function isTerminal(status: MissionStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransition(from: MissionStatus, to: MissionStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/* ------------------------------------------------------------------ */
/* Abgeleitete Berechtigungen je Status                                */
/* ------------------------------------------------------------------ */

/** Konfiguration (Grunddaten, Mechanik, Coupons …) ist nur im Entwurf voll editierbar. */
export function isKonfigurationEditierbar(mission: Mission): boolean {
  return mission.status === "entwurf";
}

/** Veröffentlichen ist nur aus dem Entwurf möglich (UC09). */
export function kannVeroeffentlichen(mission: Mission): boolean {
  return mission.status === "entwurf";
}

/** Stornieren ist nur vor Aktivierung möglich (UC10, BR-UC09-001). */
export function kannStornieren(mission: Mission): boolean {
  return mission.status === "veroeffentlicht";
}

/** Abbrechen ist nur für aktive Missionen möglich (UC11, BR-UC10-001). */
export function kannAbbrechen(mission: Mission): boolean {
  return mission.status === "aktiv";
}

/**
 * Operative Werte sind nach Veröffentlichung bzw. während aktiver Mission
 * änderbar (UC12, REQ-UC11-001). Im Entwurf werden sie regulär über UC05
 * gepflegt.
 */
export function kannOperativeWerteAendern(mission: Mission): boolean {
  return (
    mission.status === "veroeffentlicht" || mission.status === "aktiv"
  );
}

/**
 * Simulierte zeitgesteuerte Statuswechsel (Aktivierung/Beendigung).
 * In der echten Welt würde ein Scheduler dies anhand des Missionszeitraums
 * auslösen (REQ-STA-006). Für die Demo bieten wir manuelle Trigger an.
 */
export function kannAktivieren(mission: Mission): boolean {
  return mission.status === "veroeffentlicht";
}

export function kannBeenden(mission: Mission): boolean {
  return mission.status === "aktiv";
}
