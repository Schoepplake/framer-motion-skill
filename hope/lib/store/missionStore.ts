/**
 * Zentraler Zustand (Zustand-Store) für Gewinnspiel-Missionen.
 *
 * Kapselt alle fachlichen Aktionen (UC01–UC13), den Audit Trail und die
 * Firebase-Übergabe. Persistenz und Firebase sind über das Adapter-Muster
 * austauschbar (siehe `lib/persistence`).
 */

"use client";

import { create } from "zustand";
import type {
  CouponSofortgewinn,
  ErgebnisartenConfig,
  Gewinnspielmechanik,
  Grunddaten,
  LostopfPreis,
  Mission,
  OperativeWerte,
  Stammdaten,
} from "../domain/types";
import {
  neueMission,
  neuerCoupon,
  neuerPreis,
} from "../domain/factory";
import {
  kannAbbrechen,
  kannAktivieren,
  kannBeenden,
  kannStornieren,
  kannVeroeffentlichen,
} from "../domain/status";
import { buildFirebasePayload } from "../persistence/firebaseMapping";
import {
  LocalFirebaseGateway,
  LocalStoragePersistence,
} from "../persistence/localStorageAdapter";
import type { FirebaseGateway, PersistenceAdapter } from "../persistence/adapter";
import {
  validateMission,
  type ValidationResult,
  VALIDATION_AREAS,
} from "../validation";
import { describeOperativeChanges, touch, withAudit } from "./audit";

/* ------------------------------------------------------------------ */
/* Adapter (austauschbar)                                              */
/* ------------------------------------------------------------------ */
// Für echtes Firebase: durch FirebasePersistence / FirebaseGatewayImpl ersetzen.
const persistence: PersistenceAdapter = new LocalStoragePersistence();
const firebase: FirebaseGateway = new LocalFirebaseGateway();

const LEERES_ERGEBNIS: ValidationResult = {
  issues: [],
  errors: [],
  warnings: [],
  veroeffentlichbar: false,
  byArea: VALIDATION_AREAS.reduce(
    (acc, a) => ({ ...acc, [a]: [] }),
    {} as ValidationResult["byArea"],
  ),
};

interface MissionState {
  missions: Mission[];
  stammdaten: Stammdaten;
  currentUser: string;
  loaded: boolean;

  load: () => Promise<void>;

  /* UC01 */
  createMission: () => string;
  deleteMission: (id: string) => void;

  /* UC02 */
  updateGrunddaten: (id: string, patch: Partial<Grunddaten>) => void;

  /* UC03 */
  setMechanik: (id: string, mechanik: Gewinnspielmechanik) => void;

  /* UC04 */
  addCoupon: (id: string) => string;
  updateCoupon: (
    id: string,
    couponId: string,
    patch: Partial<CouponSofortgewinn>,
  ) => void;
  removeCoupon: (id: string, couponId: string) => void;

  /* UC05 */
  setErgebnisarten: (id: string, patch: Partial<ErgebnisartenConfig>) => void;
  setOperativeWerte: (id: string, patch: Partial<OperativeWerte>) => void;

  /* UC06 */
  setLostopfAktiv: (id: string, aktiv: boolean) => void;
  addPreis: (id: string) => string;
  updatePreis: (id: string, preisId: string, patch: Partial<LostopfPreis>) => void;
  removePreis: (id: string, preisId: string) => void;

  /* UC07 */
  setScreenField: (
    id: string,
    screenId: string,
    fieldKey: string,
    value: string,
  ) => void;
  setStyling: (
    id: string,
    patch: Partial<Mission["appContent"]["styling"]>,
  ) => void;

  /* UC09 */
  publish: (id: string) => ValidationResult;

  /* UC10 / UC11 */
  cancelMission: (id: string, grund?: string) => void;
  abortMission: (id: string, grund?: string) => void;

  /* Simulierte zeitgesteuerte Übergänge */
  activateMission: (id: string) => void;
  endMission: (id: string) => void;
}

export const useMissionStore = create<MissionState>((set, get) => {
  /** Aktualisiert eine Mission im State und persistiert sie. */
  const commit = (next: Mission) => {
    set((s) => ({
      missions: s.missions.map((m) => (m.id === next.id ? next : m)),
    }));
    void persistence.saveMission(next);
  };

  /** Reine Konfig-Änderung im Entwurf: aktualisiert „zuletzt geändert“ (REQ-UC12-002). */
  const edit = (id: string, fn: (m: Mission) => Mission) => {
    const { missions, currentUser } = get();
    const m = missions.find((x) => x.id === id);
    if (!m) return;
    const ts = new Date().toISOString();
    commit(touch(fn(m), currentUser, ts));
  };

  return {
    missions: [],
    stammdaten: { promoItems: [], couponMechaniken: [] },
    currentUser: "Sandra Berg",
    loaded: false,

    load: async () => {
      const [missions, stammdaten] = await Promise.all([
        persistence.listMissions(),
        persistence.getStammdaten(),
      ]);
      set({ missions, stammdaten, loaded: true });
    },

    /* ---------------- UC01 ---------------- */
    createMission: () => {
      const m = neueMission(get().currentUser);
      set((s) => ({ missions: [m, ...s.missions] }));
      void persistence.saveMission(m);
      return m.id;
    },

    deleteMission: (id) => {
      const m = get().missions.find((x) => x.id === id);
      if (!m || m.status !== "entwurf") return; // nur Entwürfe verwerfbar
      set((s) => ({ missions: s.missions.filter((x) => x.id !== id) }));
      void persistence.deleteMission(id);
    },

    /* ---------------- UC02 ---------------- */
    updateGrunddaten: (id, patch) =>
      edit(id, (m) => ({
        ...m,
        grunddaten: {
          ...m.grunddaten,
          ...patch,
          zeitraum: patch.zeitraum
            ? { ...m.grunddaten.zeitraum, ...patch.zeitraum }
            : m.grunddaten.zeitraum,
        },
      })),

    /* ---------------- UC03 ---------------- */
    setMechanik: (id, mechanik) => edit(id, (m) => ({ ...m, mechanik })),

    /* ---------------- UC04 ---------------- */
    addCoupon: (id) => {
      const coupon = neuerCoupon();
      edit(id, (m) => ({
        ...m,
        couponSofortgewinne: [...m.couponSofortgewinne, coupon],
      }));
      return coupon.id;
    },
    updateCoupon: (id, couponId, patch) =>
      edit(id, (m) => ({
        ...m,
        couponSofortgewinne: m.couponSofortgewinne.map((c) =>
          c.id === couponId
            ? {
                ...c,
                ...patch,
                ausspielung: patch.ausspielung
                  ? { ...c.ausspielung, ...patch.ausspielung }
                  : c.ausspielung,
              }
            : c,
        ),
      })),
    removeCoupon: (id, couponId) =>
      edit(id, (m) => ({
        ...m,
        couponSofortgewinne: m.couponSofortgewinne.filter((c) => c.id !== couponId),
      })),

    /* ---------------- UC05 ---------------- */
    setErgebnisarten: (id, patch) =>
      edit(id, (m) => {
        const ergebnisarten = { ...m.ergebnisarten, ...patch };
        // Lostopf-Ergebnisart und Lostopf-Konfiguration synchron halten.
        const lostopf =
          patch.lostopfAktiv === false
            ? { ...m.lostopf, aktiv: false }
            : patch.lostopfAktiv === true
              ? { ...m.lostopf, aktiv: true }
              : m.lostopf;
        return { ...m, ergebnisarten, lostopf };
      }),

    setOperativeWerte: (id, patch) => {
      const { missions, currentUser, stammdaten } = get();
      const m = missions.find((x) => x.id === id);
      if (!m) return;
      const ts = new Date().toISOString();
      const operativeWerte = { ...m.operativeWerte, ...patch };
      let next = touch({ ...m, operativeWerte }, currentUser, ts);
      const istNachVeroeffentlichung =
        m.status === "veroeffentlicht" || m.status === "aktiv";
      if (istNachVeroeffentlichung) {
        const details = describeOperativeChanges(m.operativeWerte, operativeWerte);
        if (details) {
          next = withAudit(
            next,
            currentUser,
            ts,
            "operative_werte_geaendert",
            "Operative Werte während laufender Mission geändert.",
            details,
          );
          next = {
            ...next,
            firebase: { ...next.firebase, zuletztUebertragenAm: ts },
          };
        }
      }
      commit(next);
      if (istNachVeroeffentlichung) {
        void firebase.publish(buildFirebasePayload(next, stammdaten));
      }
    },

    /* ---------------- UC06 ---------------- */
    setLostopfAktiv: (id, aktiv) =>
      edit(id, (m) => ({
        ...m,
        lostopf: { ...m.lostopf, aktiv },
        ergebnisarten: { ...m.ergebnisarten, lostopfAktiv: aktiv },
      })),
    addPreis: (id) => {
      const preis = neuerPreis();
      edit(id, (m) => ({
        ...m,
        lostopf: { ...m.lostopf, preise: [...m.lostopf.preise, preis] },
      }));
      return preis.id;
    },
    updatePreis: (id, preisId, patch) =>
      edit(id, (m) => ({
        ...m,
        lostopf: {
          ...m.lostopf,
          preise: m.lostopf.preise.map((p) =>
            p.id === preisId ? { ...p, ...patch } : p,
          ),
        },
      })),
    removePreis: (id, preisId) =>
      edit(id, (m) => ({
        ...m,
        lostopf: {
          ...m.lostopf,
          preise: m.lostopf.preise.filter((p) => p.id !== preisId),
        },
      })),

    /* ---------------- UC07 ---------------- */
    setScreenField: (id, screenId, fieldKey, value) =>
      edit(id, (m) => ({
        ...m,
        appContent: {
          ...m.appContent,
          screens: {
            ...m.appContent.screens,
            [screenId]: {
              ...(m.appContent.screens[screenId] ?? {}),
              [fieldKey]: value,
            },
          },
        },
      })),
    setStyling: (id, patch) =>
      edit(id, (m) => ({
        ...m,
        appContent: { ...m.appContent, styling: { ...m.appContent.styling, ...patch } },
      })),

    /* ---------------- UC09 ---------------- */
    publish: (id) => {
      const { missions, stammdaten, currentUser } = get();
      const m = missions.find((x) => x.id === id);
      if (!m || !kannVeroeffentlichen(m)) return LEERES_ERGEBNIS;

      const result = validateMission(m, stammdaten);
      const ts = new Date().toISOString();

      if (!result.veroeffentlichbar) {
        // REQ-UC12-007: fehlgeschlagene Veröffentlichungsvalidierung nachvollziehbar machen
        const next = withAudit(
          touch(m, currentUser, ts),
          currentUser,
          ts,
          "validierung_fehlgeschlagen",
          `Veröffentlichung blockiert: ${result.errors.length} ${
            result.errors.length === 1 ? "Fehler" : "Fehler"
          } in der Konfiguration.`,
        );
        commit(next);
        return result;
      }

      let next: Mission = {
        ...m,
        status: "veroeffentlicht",
        veroeffentlichtAm: ts,
        veroeffentlichtVon: currentUser,
        geaendertAm: ts,
        geaendertVon: currentUser,
        firebase: { zuletztUebertragenAm: ts, sichtbar: true },
      };
      next = withAudit(
        next,
        currentUser,
        ts,
        "veroeffentlicht",
        "Mission veröffentlicht und an Firebase übergeben.",
      );
      commit(next);
      void firebase.publish(buildFirebasePayload(next, stammdaten));
      return result;
    },

    /* ---------------- UC10 ---------------- */
    cancelMission: (id, grund) => {
      const { missions, currentUser } = get();
      const m = missions.find((x) => x.id === id);
      if (!m || !kannStornieren(m)) return;
      const ts = new Date().toISOString();
      let next: Mission = {
        ...m,
        status: "storniert",
        storniertAm: ts,
        storniertVon: currentUser,
        stornierungsgrund: grund?.trim() || null,
        geaendertAm: ts,
        geaendertVon: currentUser,
        firebase: { ...m.firebase, sichtbar: false, zuletztUebertragenAm: ts },
      };
      next = withAudit(
        next,
        currentUser,
        ts,
        "storniert",
        grund?.trim()
          ? `Mission storniert. Grund: ${grund.trim()}`
          : "Mission vor Aktivierung storniert.",
      );
      commit(next);
      void firebase.setSichtbarkeit(id, false);
    },

    /* ---------------- UC11 ---------------- */
    abortMission: (id, grund) => {
      const { missions, currentUser } = get();
      const m = missions.find((x) => x.id === id);
      if (!m || !kannAbbrechen(m)) return;
      const ts = new Date().toISOString();
      let next: Mission = {
        ...m,
        status: "abgebrochen",
        abgebrochenAm: ts,
        abgebrochenVon: currentUser,
        abbruchgrund: grund?.trim() || null,
        geaendertAm: ts,
        geaendertVon: currentUser,
        firebase: { ...m.firebase, sichtbar: false, zuletztUebertragenAm: ts },
      };
      next = withAudit(
        next,
        currentUser,
        ts,
        "abgebrochen",
        grund?.trim()
          ? `Aktive Mission abgebrochen. Grund: ${grund.trim()} Bereits vergebene Coupon-Sofortgewinne bleiben gültig.`
          : "Aktive Mission abgebrochen. Bereits vergebene Coupon-Sofortgewinne bleiben gültig.",
      );
      commit(next);
      void firebase.setSichtbarkeit(id, false);
    },

    /* ---------------- Simulierte Übergänge ---------------- */
    activateMission: (id) => {
      const { missions, currentUser } = get();
      const m = missions.find((x) => x.id === id);
      if (!m || !kannAktivieren(m)) return;
      const ts = new Date().toISOString();
      let next: Mission = { ...m, status: "aktiv", geaendertAm: ts, geaendertVon: currentUser };
      next = withAudit(next, "System", ts, "aktiviert", "Mission aktiviert (Missionszeitraum erreicht).");
      commit(next);
    },
    endMission: (id) => {
      const { missions, currentUser } = get();
      const m = missions.find((x) => x.id === id);
      if (!m || !kannBeenden(m)) return;
      const ts = new Date().toISOString();
      let next: Mission = {
        ...m,
        status: "beendet",
        geaendertAm: ts,
        geaendertVon: currentUser,
        firebase: { ...m.firebase, sichtbar: false },
      };
      next = withAudit(next, "System", ts, "beendet", "Mission regulär beendet (Missionszeitraum abgelaufen).");
      commit(next);
      void firebase.setSichtbarkeit(id, false);
    },
  };
});
