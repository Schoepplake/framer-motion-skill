/**
 * Seed-Daten: bestehende HOPE-Stammdaten (Promo-Item-Pool, Coupon-Mechaniken)
 * sowie Demo-Missionen in unterschiedlichen Status für eine lebendige Demo.
 */

import type {
  Gewinnspielmechanik,
  Mission,
  Stammdaten,
} from "../domain/types";
import { getRelevanteScreens } from "../domain/screens";

export const STAMMDATEN: Stammdaten = {
  promoItems: [
    { id: "promo_kaffee", name: "PENNY Kaffee 500g – 0,50 € Rabatt", kategorie: "Lebensmittel" },
    { id: "promo_schoko", name: "Schokolade 100g gratis", kategorie: "Süßwaren" },
    { id: "promo_getraenk", name: "Erfrischungsgetränk 1L – 20 %", kategorie: "Getränke" },
    { id: "promo_backwaren", name: "Brötchen 6er – 0,30 € Rabatt", kategorie: "Backwaren" },
    { id: "promo_pfand", name: "2× Pfandbon-Bonus", kategorie: "Sonstiges" },
  ],
  couponMechaniken: [
    { id: "cm_sofort", name: "Sofort-Rabatt", beschreibung: "Direkt an der Kasse einlösbar." },
    { id: "cm_treue", name: "Treuepunkte-Bonus", beschreibung: "Zusätzliche Treuepunkte gutgeschrieben." },
    { id: "cm_prozent", name: "Prozentualer Rabatt", beschreibung: "Rabatt in Prozent auf den Artikel." },
    { id: "cm_gratis", name: "Gratis-Artikel", beschreibung: "Artikel komplett kostenlos." },
  ],
};

/* ------------------------------------------------------------------ */
/* Demo-Missionen                                                      */
/* ------------------------------------------------------------------ */

function fuelleScreens(mission: Mission): void {
  for (const screen of getRelevanteScreens(mission)) {
    const inhalt: Record<string, string> = {};
    for (const field of screen.fields) {
      switch (field.type) {
        case "url":
          inhalt[field.key] = "https://www.penny.de/teilnahmebedingungen";
          break;
        case "image":
          inhalt[field.key] = `asset://${mission.id}/${screen.id}/${field.key}.png`;
          break;
        case "button":
          inhalt[field.key] = field.placeholder?.replace(/^z\. B\. /, "") ?? "Weiter";
          break;
        case "legal":
          inhalt[field.key] =
            "Teilnahme ab 18 Jahren. Der Rechtsweg ist ausgeschlossen. Es gelten die vollständigen Teilnahmebedingungen.";
          break;
        default:
          inhalt[field.key] = field.placeholder?.replace(/^z\. B\. /, "") ?? "Beispielinhalt";
      }
    }
    mission.appContent.screens[screen.id] = inhalt;
  }
}

interface DemoOpts {
  id: string;
  name: string;
  status: Mission["status"];
  mechanik: Gewinnspielmechanik;
  von: string;
  bis: string;
  coupons: { promo: string; mech: string; von: string; bis: string }[];
  niete: boolean;
  lostopf: boolean;
  vollstaendig: boolean;
}

function demoMission(o: DemoOpts): Mission {
  const erstellt = "2026-05-20T09:30:00.000Z";
  const m: Mission = {
    id: o.id,
    typ: "gewinnspiel",
    status: o.status,
    grunddaten: {
      missionsName: o.name,
      zeitraum: { von: o.von, bis: o.bis },
      beschreibung: "Gewinnspiel-Mission für die PENNY App.",
      interneReferenz: o.id,
    },
    mechanik: o.mechanik,
    couponSofortgewinne: o.coupons.map((c, i) => ({
      id: `${o.id}_c${i + 1}`,
      bezeichnung: `Sofortgewinn ${i + 1}`,
      promoItemId: c.promo,
      couponMechanikId: c.mech,
      ausspielung: { von: c.von, bis: c.bis },
    })),
    ergebnisarten: { nieteAktiv: o.niete, lostopfAktiv: o.lostopf },
    operativeWerte: {
      gewinnwahrscheinlichkeit: 15,
      sofortgewinngewichtung: 60,
      taeglichesTeilnahmeLimit: 1,
    },
    lostopf: o.lostopf
      ? {
          aktiv: true,
          preise: [
            { id: `${o.id}_p1`, beschreibung: "PENNY Gutschein 250 €", anzahlVerlosungen: 3 },
            { id: `${o.id}_p2`, beschreibung: "Smart-TV 55\"", anzahlVerlosungen: 1 },
          ],
        }
      : { aktiv: false, preise: [] },
    appContent: {
      screens: {},
      styling: { primaerfarbe: "#C8102E", sekundaerfarbe: "#FFD200" },
    },
    audit: [
      {
        id: `${o.id}_a1`,
        zeitpunkt: erstellt,
        benutzer: "Sandra Berg",
        aktion: "mission_erstellt",
        beschreibung: `Mission ${o.id} im Status „Entwurf“ angelegt.`,
      },
    ],
    erstelltAm: erstellt,
    erstelltVon: "Sandra Berg",
    geaendertAm: "2026-05-28T14:10:00.000Z",
    geaendertVon: "Sandra Berg",
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

  if (o.vollstaendig) fuelleScreens(m);

  if (o.status === "veroeffentlicht" || o.status === "aktiv") {
    const ts = "2026-06-02T10:00:00.000Z";
    m.veroeffentlichtAm = ts;
    m.veroeffentlichtVon = "Sandra Berg";
    m.firebase = { zuletztUebertragenAm: ts, sichtbar: true };
    m.audit.push({
      id: `${o.id}_a2`,
      zeitpunkt: ts,
      benutzer: "Sandra Berg",
      aktion: "veroeffentlicht",
      beschreibung: "Mission veröffentlicht und an Firebase übergeben.",
    });
  }
  if (o.status === "aktiv") {
    m.audit.push({
      id: `${o.id}_a3`,
      zeitpunkt: o.von + "T00:00:00.000Z",
      benutzer: "System",
      aktion: "aktiviert",
      beschreibung: "Missionszeitraum erreicht — Status auf „Aktiv“ gesetzt.",
    });
  }

  return m;
}

export function seedMissions(): Mission[] {
  return [
    demoMission({
      id: "GWS-2026-SMR1",
      name: "Sommer-Gewinnspiel 2026",
      status: "entwurf",
      mechanik: "rubellos",
      von: "2026-07-01",
      bis: "2026-07-31",
      // Lücke 16.–31.07. → demonstriert Coupon-Zeitabdeckungs-Validierung
      coupons: [{ promo: "promo_kaffee", mech: "cm_sofort", von: "2026-07-01", bis: "2026-07-15" }],
      niete: true,
      lostopf: false,
      vollstaendig: false,
    }),
    demoMission({
      id: "GWS-2026-RBLW",
      name: "PENNY Rubbel-Wochen",
      status: "veroeffentlicht",
      mechanik: "rubellos",
      von: "2026-06-15",
      bis: "2026-06-30",
      coupons: [
        { promo: "promo_schoko", mech: "cm_gratis", von: "2026-06-15", bis: "2026-06-22" },
        { promo: "promo_getraenk", mech: "cm_prozent", von: "2026-06-23", bis: "2026-06-30" },
      ],
      niete: true,
      lostopf: true,
      vollstaendig: true,
    }),
    demoMission({
      id: "GWS-2026-SLOT",
      name: "Frühlings-Slot 2026",
      status: "aktiv",
      mechanik: "slot_machine",
      von: "2026-06-01",
      bis: "2026-06-20",
      coupons: [{ promo: "promo_backwaren", mech: "cm_sofort", von: "2026-06-01", bis: "2026-06-20" }],
      niete: true,
      lostopf: false,
      vollstaendig: true,
    }),
  ];
}
