/**
 * Fabrikfunktionen für neue Domänenobjekte.
 */

import type {
  CouponSofortgewinn,
  LostopfPreis,
  Mission,
} from "./types";

export function neueId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

/** Menschlich lesbare Mission-ID, z. B. GWS-2026-AB12. */
export function neueMissionId(): string {
  const jahr = new Date().getFullYear();
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0].slice(0, 4).toUpperCase()
      : Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GWS-${jahr}-${suffix}`;
}

/**
 * Legt eine neue Gewinnspiel-Mission im Status „Entwurf“ an
 * (UC01, REQ-UC01-003/004, BR-UC01-001).
 */
export function neueMission(benutzer: string): Mission {
  const jetzt = new Date().toISOString();
  const id = neueMissionId();
  return {
    id,
    typ: "gewinnspiel",
    status: "entwurf",
    grunddaten: {
      missionsName: "",
      zeitraum: { von: null, bis: null },
      beschreibung: "",
      interneReferenz: "",
    },
    mechanik: null,
    couponSofortgewinne: [],
    ergebnisarten: { nieteAktiv: true, lostopfAktiv: false },
    operativeWerte: {
      gewinnwahrscheinlichkeit: 10,
      sofortgewinngewichtung: 50,
      taeglichesTeilnahmeLimit: 1,
    },
    lostopf: { aktiv: false, preise: [] },
    appContent: {
      screens: {},
      styling: { primaerfarbe: "#C8102E", sekundaerfarbe: "#FFD200" },
    },
    audit: [
      {
        id: neueId("audit"),
        zeitpunkt: jetzt,
        benutzer,
        aktion: "mission_erstellt",
        beschreibung: `Mission ${id} im Status „Entwurf“ angelegt.`,
      },
    ],
    erstelltAm: jetzt,
    erstelltVon: benutzer,
    geaendertAm: jetzt,
    geaendertVon: benutzer,
    veroeffentlichtAm: null,
    veroeffentlichtVon: null,
    storniertAm: null,
    storniertVon: null,
    stornierungsgrund: null,
    abgebrochenAm: null,
    abgebrochenVon: null,
    abbruchgrund: null,
    firebase: { zuletztUebertragenAm: null, sichtbar: false },
  };
}

export function neuerCoupon(): CouponSofortgewinn {
  return {
    id: neueId("coupon"),
    bezeichnung: "",
    promoItemId: null,
    couponMechanikId: null,
    ausspielung: { von: null, bis: null },
  };
}

export function neuerPreis(): LostopfPreis {
  return {
    id: neueId("preis"),
    beschreibung: "",
    anzahlVerlosungen: 1,
  };
}
