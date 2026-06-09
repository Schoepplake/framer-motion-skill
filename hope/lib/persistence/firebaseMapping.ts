/**
 * Abbildung einer Mission auf das Firebase-/JSON-Modell, das die PENNY App liest
 * (REQ-GEN-008, REQ-UC03-004, REQ-UC08-007).
 *
 * Das konkrete Firebase-Feldmodell bleibt zunächst Referenz und wird mit dem
 * App-Team final geklärt (Grundannahme „Firebase-Felder“; OOS-010). Diese
 * Abbildung ist daher bewusst zentralisiert, damit spätere Änderungen am
 * JSON-Modell nachvollziehbar integriert werden können (NFR-MAINT-003).
 */

import type { Mission, MissionStatus, Stammdaten } from "../domain/types";
import { getRelevanteScreens } from "../domain/screens";

export interface FirebaseCouponPayload {
  id: string;
  promoItemId: string | null;
  promoItemName: string | null;
  couponMechanikId: string | null;
  couponMechanikName: string | null;
  ausspielungVon: string | null;
  ausspielungBis: string | null;
}

export interface FirebaseScreenPayload {
  id: string;
  name: string;
  felder: Record<string, string>;
}

export interface FirebasePayload {
  missionId: string;
  typ: string;
  status: MissionStatus;
  /** Ob die Mission in der App angezeigt werden soll (REQ-STA-008). */
  sichtbar: boolean;
  zeitraum: { von: string | null; bis: string | null };
  mechanik: string | null;
  ergebnisarten: {
    couponSofortgewinn: boolean;
    niete: boolean;
    lostopf: boolean;
  };
  operativeWerte: {
    gewinnwahrscheinlichkeit: number;
    sofortgewinngewichtung: number;
    taeglichesTeilnahmeLimit: number;
  };
  coupons: FirebaseCouponPayload[];
  lostopf: {
    aktiv: boolean;
    preise: { id: string; beschreibung: string; anzahlVerlosungen: number }[];
  };
  screens: FirebaseScreenPayload[];
  styling: { primaerfarbe: string; sekundaerfarbe: string };
  uebertragenAm: string;
}

export function buildFirebasePayload(
  mission: Mission,
  stammdaten: Stammdaten,
): FirebasePayload {
  const promoById = new Map(stammdaten.promoItems.map((p) => [p.id, p]));
  const mechById = new Map(stammdaten.couponMechaniken.map((m) => [m.id, m]));

  return {
    missionId: mission.id,
    typ: mission.typ,
    status: mission.status,
    sichtbar: mission.firebase.sichtbar,
    zeitraum: { ...mission.grunddaten.zeitraum },
    mechanik: mission.mechanik,
    ergebnisarten: {
      couponSofortgewinn: true,
      niete: mission.ergebnisarten.nieteAktiv,
      lostopf: mission.ergebnisarten.lostopfAktiv,
    },
    operativeWerte: { ...mission.operativeWerte },
    coupons: mission.couponSofortgewinne.map((c) => ({
      id: c.id,
      promoItemId: c.promoItemId,
      promoItemName: c.promoItemId ? (promoById.get(c.promoItemId)?.name ?? null) : null,
      couponMechanikId: c.couponMechanikId,
      couponMechanikName: c.couponMechanikId
        ? (mechById.get(c.couponMechanikId)?.name ?? null)
        : null,
      ausspielungVon: c.ausspielung.von,
      ausspielungBis: c.ausspielung.bis,
    })),
    lostopf: {
      aktiv: mission.lostopf.aktiv,
      preise: mission.lostopf.preise.map((p) => ({
        id: p.id,
        beschreibung: p.beschreibung,
        anzahlVerlosungen: p.anzahlVerlosungen,
      })),
    },
    screens: getRelevanteScreens(mission).map((s) => ({
      id: s.id,
      name: s.name,
      felder: mission.appContent.screens[s.id] ?? {},
    })),
    styling: { ...mission.appContent.styling },
    uebertragenAm: new Date().toISOString(),
  };
}
