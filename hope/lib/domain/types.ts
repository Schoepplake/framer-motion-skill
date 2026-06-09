/**
 * HOPE — Domänenmodell für Gewinnspiel-Missionen.
 *
 * Single source of truth für die gesamte Anwendung. Bildet die fachlichen
 * Anforderungen aus dem Anforderungsdokument (REQ-/BR-/VAL-IDs) ab.
 */

/* ------------------------------------------------------------------ */
/* Statusmodell (Statusmodell, REQ-STA-*)                              */
/* ------------------------------------------------------------------ */

export type MissionStatus =
  | "entwurf" // in Bearbeitung, noch nicht veröffentlicht
  | "veroeffentlicht" // freigegeben + an Firebase übergeben, noch nicht aktiv
  | "aktiv" // läuft aktuell
  | "beendet" // regulär abgeschlossen
  | "storniert" // veröffentlicht, vor Aktivierung zurückgezogen
  | "abgebrochen"; // aktive Mission vorzeitig beendet

export const MISSION_STATUS: MissionStatus[] = [
  "entwurf",
  "veroeffentlicht",
  "aktiv",
  "beendet",
  "storniert",
  "abgebrochen",
];

/* ------------------------------------------------------------------ */
/* Missionstyp & Mechanik                                              */
/* ------------------------------------------------------------------ */

/** Initial nur „Gewinnspiel“ (REQ-UC01-002), erweiterbar gehalten. */
export type MissionType = "gewinnspiel";

/** Gewinnspielmechanik (UC03). Erweiterbar (REQ-UC03-006, NFR-MAINT-001). */
export type Gewinnspielmechanik = "rubellos" | "slot_machine";

export const GEWINNSPIELMECHANIKEN: Gewinnspielmechanik[] = [
  "rubellos",
  "slot_machine",
];

/* ------------------------------------------------------------------ */
/* Ergebnisarten (UC05)                                                */
/* ------------------------------------------------------------------ */

export type Ergebnisart = "coupon_sofortgewinn" | "niete" | "lostopf";

/**
 * Konfiguration der möglichen Ergebnisarten.
 * Coupon-Sofortgewinn ist immer möglich (VAL-023) und daher nicht abschaltbar.
 */
export interface ErgebnisartenConfig {
  /** Niete als mögliches Ergebnis (BR-UC05-006). */
  nieteAktiv: boolean;
  /**
   * Lostopf/Sachpreisverlosung als Ergebnis (UC06). Im initialen Scope
   * gegenseitig ausschließend zum Coupon-Sofortgewinn für denselben Kunden
   * (BR-UC05-003/004, VAL-018) — wird in der App-Spiellogik aufgelöst.
   */
  lostopfAktiv: boolean;
}

/* ------------------------------------------------------------------ */
/* Zeiträume                                                           */
/* ------------------------------------------------------------------ */

/** ISO-Datum (yyyy-mm-dd) oder null, solange noch nicht gepflegt. */
export interface DateRange {
  von: string | null;
  bis: string | null;
}

/* ------------------------------------------------------------------ */
/* Grunddaten (UC02)                                                   */
/* ------------------------------------------------------------------ */

export interface Grunddaten {
  /** Pflichtfeld (BR-UC02-001, VAL-001). */
  missionsName: string;
  /** Missionszeitraum von/bis (BR-UC02-002, VAL-002/003/004). */
  zeitraum: DateRange;
  /** Allgemeine fachliche Metadaten (REQ-UC02-005). */
  beschreibung: string;
  interneReferenz: string;
}

/* ------------------------------------------------------------------ */
/* Promo-Item-Pool & Coupon-Mechanik (bestehende HOPE-Module)          */
/* ------------------------------------------------------------------ */

export interface PromoItem {
  id: string;
  name: string;
  kategorie: string;
}

export interface CouponMechanik {
  id: string;
  name: string;
  beschreibung: string;
}

/* ------------------------------------------------------------------ */
/* Coupon-Sofortgewinn / Missionsziel (UC04)                           */
/* ------------------------------------------------------------------ */

/**
 * Ein Coupon-Sofortgewinn (im Anforderungsdokument auch „Missionsziel“):
 * Promo-Item + Coupon-Mechanik + eigener Ausspielungszeitraum.
 */
export interface CouponSofortgewinn {
  id: string;
  bezeichnung: string;
  /** Promo-Item aus dem Promo-Item-Pool (VAL-011, BR-UC04-002). */
  promoItemId: string | null;
  /** Coupon-Mechanik (VAL-012, BR-UC04-003). */
  couponMechanikId: string | null;
  /** Eigener Ausspielungszeitraum (REQ-UC04-005, VAL-019/020). */
  ausspielung: DateRange;
}

/* ------------------------------------------------------------------ */
/* Operative Werte (UC05/UC12)                                         */
/* ------------------------------------------------------------------ */

/**
 * Operative Werte, die auch nach Veröffentlichung / während aktiver Mission
 * änderbar sind (UC12, REQ-UC11-*). Klar abgegrenzt von der nicht änderbaren
 * Kampagnenkonfiguration (REQ-UC11-008).
 */
export interface OperativeWerte {
  /** Gewinnwahrscheinlichkeit 0–100 % (VAL-015, BR-UC05-008). */
  gewinnwahrscheinlichkeit: number;
  /** Sofortgewinngewichtung 0–100 % (VAL-016, BR-UC05-009). */
  sofortgewinngewichtung: number;
  /** Tägliches Teilnahme-Limit pro Teilnehmer 0–100 (VAL-017, BR-UC05-010). */
  taeglichesTeilnahmeLimit: number;
}

export const OPERATIVE_WERT_KEYS = [
  "gewinnwahrscheinlichkeit",
  "sofortgewinngewichtung",
  "taeglichesTeilnahmeLimit",
] as const;

export type OperativerWertKey = (typeof OPERATIVE_WERT_KEYS)[number];

/* ------------------------------------------------------------------ */
/* Lostopf / Sachpreisverlosung (UC06)                                 */
/* ------------------------------------------------------------------ */

export interface LostopfPreis {
  /** Preis-ID (REQ-UC05-006). */
  id: string;
  /** Preisbeschreibung (REQ-UC05-007). */
  beschreibung: string;
  /** Anzahl Verlosungen, > 0 für Veröffentlichung (VAL-014, BR-UC05-005). */
  anzahlVerlosungen: number;
}

export interface Lostopf {
  /** Lostopf ist optional (BR-UC05-001). Max. 1 pro Mission (BR-UC05-002). */
  aktiv: boolean;
  /** Mehrere Preise möglich (REQ-UC05-005). */
  preise: LostopfPreis[];
}

/* ------------------------------------------------------------------ */
/* App-Inhalte & Screens (UC07)                                        */
/* ------------------------------------------------------------------ */

export type AppFieldType =
  | "text"
  | "longtext"
  | "image"
  | "url"
  | "button"
  | "legal";

/** Inhalte eines Screens: feldKey -> Wert. */
export type ScreenContent = Record<string, string>;

export interface AppContent {
  /** screenId -> { feldKey: wert }. */
  screens: Record<string, ScreenContent>;
  /** Styling-Informationen (REQ-UC06-003). */
  styling: {
    primaerfarbe: string;
    sekundaerfarbe: string;
  };
}

/* ------------------------------------------------------------------ */
/* Audit Trail (UC13)                                                  */
/* ------------------------------------------------------------------ */

export type AuditAction =
  | "mission_erstellt"
  | "grunddaten_geaendert"
  | "mechanik_geaendert"
  | "coupon_hinzugefuegt"
  | "coupon_geaendert"
  | "coupon_entfernt"
  | "ergebnisarten_geaendert"
  | "lostopf_geaendert"
  | "inhalte_geaendert"
  | "operative_werte_geaendert"
  | "veroeffentlicht"
  | "storniert"
  | "abgebrochen"
  | "aktiviert"
  | "beendet"
  | "validierung_fehlgeschlagen";

export interface AuditEntry {
  id: string;
  zeitpunkt: string; // ISO-Zeitstempel
  benutzer: string;
  aktion: AuditAction;
  beschreibung: string;
  details?: string;
}

/* ------------------------------------------------------------------ */
/* Mission (Aggregat)                                                  */
/* ------------------------------------------------------------------ */

export interface FirebaseSyncState {
  /** Zeitpunkt der letzten Übergabe an Firebase (REQ-GEN-008). */
  zuletztUebertragenAm: string | null;
  /** Ob die Mission aktuell in der App sichtbar ist (REQ-STA-008). */
  sichtbar: boolean;
}

export interface Mission {
  /** Eindeutige Mission-ID (REQ-UC01-003). */
  id: string;
  /** Missionstyp (REQ-UC01-002). */
  typ: MissionType;
  /** Aktueller Status (REQ-STA-001). Initial „entwurf“ (REQ-UC01-004). */
  status: MissionStatus;

  grunddaten: Grunddaten;
  /** Genau eine Mechanik je Mission (REQ-UC03-003, BR-UC03-001). */
  mechanik: Gewinnspielmechanik | null;
  couponSofortgewinne: CouponSofortgewinn[];
  ergebnisarten: ErgebnisartenConfig;
  operativeWerte: OperativeWerte;
  lostopf: Lostopf;
  appContent: AppContent;

  audit: AuditEntry[];

  /* Lebenszyklus-Metadaten (UC13) */
  erstelltAm: string;
  erstelltVon: string;
  geaendertAm: string;
  geaendertVon: string;
  veroeffentlichtAm: string | null;
  veroeffentlichtVon: string | null;
  storniertAm: string | null;
  storniertVon: string | null;
  stornierungsgrund: string | null;
  abgebrochenAm: string | null;
  abgebrochenVon: string | null;
  abbruchgrund: string | null;

  firebase: FirebaseSyncState;
}

/** Katalog bestehender HOPE-Stammdaten (Promo-Item-Pool, Coupon-Mechaniken). */
export interface Stammdaten {
  promoItems: PromoItem[];
  couponMechaniken: CouponMechanik[];
}
