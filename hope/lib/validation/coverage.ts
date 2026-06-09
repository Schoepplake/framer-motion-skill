/**
 * Coupon-Zeitabdeckung (REQ-GEN-011, REQ-UC04-008/009, VAL-023/024).
 *
 * Über den gesamten Missionszeitraum muss zu jedem Zeitpunkt mindestens ein
 * Coupon-Sofortgewinn gültig/möglich sein. Reine Niete-/Lostopf-Zeiträume sind
 * nicht erlaubt (BR-UC04-010/011, BR-UC05-012, OOS-012).
 *
 * Granularität: Tag (sinnvoller Default; finale technische Granularität ist mit
 * Entwicklung/App-Team festzulegen — BR-UC04-013). Berechnung in UTC-Tagen.
 */

import type { Mission } from "../domain/types";

export interface CoverageSegment {
  von: string; // ISO-Datum (inklusive)
  bis: string; // ISO-Datum (inklusive)
  abgedeckt: boolean;
  couponIds: string[];
  tage: number;
}

export interface CoverageResult {
  /** Missionszeitraum ist vollständig und gültig gepflegt. */
  zeitraumGueltig: boolean;
  /** Lückenlos durch mindestens einen Coupon abgedeckt. */
  vollstaendigAbgedeckt: boolean;
  /** Unabgedeckte Zeitfenster (Lücken). */
  luecken: { von: string; bis: string; tage: number }[];
  /** Zusammenhängende Segmente über den Missionszeitraum (für Timeline). */
  segmente: CoverageSegment[];
  tageGesamt: number;
  tageAbgedeckt: number;
}

const MS_PRO_TAG = 86_400_000;
const MAX_TAGE = 100_000; // Schutz gegen pathologische Eingaben

function toDayIndex(dateStr: string): number | null {
  const ms = Date.parse(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / MS_PRO_TAG);
}

function fromDayIndex(idx: number): string {
  return new Date(idx * MS_PRO_TAG).toISOString().slice(0, 10);
}

const LEER: CoverageResult = {
  zeitraumGueltig: false,
  vollstaendigAbgedeckt: false,
  luecken: [],
  segmente: [],
  tageGesamt: 0,
  tageAbgedeckt: 0,
};

/** Ein Coupon zählt für die Abdeckung, wenn er einen gültigen Zeitraum besitzt. */
interface ClippedCoupon {
  id: string;
  start: number;
  end: number;
}

export function computeCouponCoverage(mission: Mission): CoverageResult {
  const { von, bis } = mission.grunddaten.zeitraum;
  if (!von || !bis) return LEER;

  const mStart = toDayIndex(von);
  const mEnd = toDayIndex(bis);
  if (mStart === null || mEnd === null || mEnd < mStart) return LEER;

  const tageGesamt = mEnd - mStart + 1;
  if (tageGesamt > MAX_TAGE) return { ...LEER, zeitraumGueltig: true };

  // Coupons mit gültigem Zeitraum auf den Missionszeitraum zuschneiden.
  const clipped: ClippedCoupon[] = [];
  for (const c of mission.couponSofortgewinne) {
    if (!c.ausspielung.von || !c.ausspielung.bis) continue;
    const cs = toDayIndex(c.ausspielung.von);
    const ce = toDayIndex(c.ausspielung.bis);
    if (cs === null || ce === null || ce < cs) continue;
    const start = Math.max(cs, mStart);
    const end = Math.min(ce, mEnd);
    if (end < start) continue; // keine Überschneidung mit Missionszeitraum
    clipped.push({ id: c.id, start, end });
  }

  // Pro Tag die abdeckenden Coupons bestimmen, dann zu Segmenten gruppieren.
  const segmente: CoverageSegment[] = [];
  let tageAbgedeckt = 0;
  let segStart = mStart;
  let prevKey: string | null = null;
  let prevIds: string[] = [];

  const idsForDay = (day: number): string[] =>
    clipped.filter((c) => day >= c.start && day <= c.end).map((c) => c.id);

  const pushSegment = (start: number, end: number, ids: string[]) => {
    const tage = end - start + 1;
    segmente.push({
      von: fromDayIndex(start),
      bis: fromDayIndex(end),
      abgedeckt: ids.length > 0,
      couponIds: ids,
      tage,
    });
    if (ids.length > 0) tageAbgedeckt += tage;
  };

  for (let day = mStart; day <= mEnd; day++) {
    const ids = idsForDay(day);
    const key = ids.length > 0 ? ids.slice().sort().join(",") : "__leer__";
    if (prevKey === null) {
      prevKey = key;
      prevIds = ids;
      segStart = day;
    } else if (key !== prevKey) {
      pushSegment(segStart, day - 1, prevIds);
      segStart = day;
      prevKey = key;
      prevIds = ids;
    }
  }
  if (prevKey !== null) pushSegment(segStart, mEnd, prevIds);

  const luecken = segmente
    .filter((s) => !s.abgedeckt)
    .map((s) => ({ von: s.von, bis: s.bis, tage: s.tage }));

  return {
    zeitraumGueltig: true,
    vollstaendigAbgedeckt: luecken.length === 0,
    luecken,
    segmente,
    tageGesamt,
    tageAbgedeckt,
  };
}
