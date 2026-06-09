/**
 * localStorage-Implementierung der Persistenz- und Firebase-Schnittstellen (Mock).
 *
 * Dient als Default für die Demo. Über das Adapter-Muster kann später ein echtes
 * Backend bzw. Firebase eingehängt werden, ohne UI/Store zu ändern.
 */

import type { Mission, Stammdaten } from "../domain/types";
import type { FirebaseGateway, PersistenceAdapter } from "./adapter";
import type { FirebasePayload } from "./firebaseMapping";
import { STAMMDATEN, seedMissions } from "./seed";

const MISSIONS_KEY = "hope.missions.v1";
const FIREBASE_KEY = "hope.firebase.v1";
const SEED_FLAG = "hope.seeded.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readMissions(): Mission[] {
  if (!hasStorage()) return seedMissions();
  const raw = window.localStorage.getItem(MISSIONS_KEY);
  if (!raw) {
    const seeded = seedMissions();
    window.localStorage.setItem(MISSIONS_KEY, JSON.stringify(seeded));
    window.localStorage.setItem(SEED_FLAG, "1");
    return seeded;
  }
  try {
    return JSON.parse(raw) as Mission[];
  } catch {
    return [];
  }
}

function writeMissions(missions: Mission[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
}

export class LocalStoragePersistence implements PersistenceAdapter {
  async listMissions(): Promise<Mission[]> {
    return readMissions();
  }

  async getMission(id: string): Promise<Mission | null> {
    return readMissions().find((m) => m.id === id) ?? null;
  }

  async saveMission(mission: Mission): Promise<void> {
    const all = readMissions();
    const idx = all.findIndex((m) => m.id === mission.id);
    if (idx >= 0) all[idx] = mission;
    else all.unshift(mission);
    writeMissions(all);
  }

  async deleteMission(id: string): Promise<void> {
    writeMissions(readMissions().filter((m) => m.id !== id));
  }

  async getStammdaten(): Promise<Stammdaten> {
    return STAMMDATEN;
  }
}

/* ------------------------------------------------------------------ */
/* Firebase-Spiegel (Mock)                                             */
/* ------------------------------------------------------------------ */

function readFirebase(): Record<string, FirebasePayload> {
  if (!hasStorage()) return {};
  const raw = window.localStorage.getItem(FIREBASE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, FirebasePayload>;
  } catch {
    return {};
  }
}

function writeFirebase(state: Record<string, FirebasePayload>): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(FIREBASE_KEY, JSON.stringify(state));
}

export class LocalFirebaseGateway implements FirebaseGateway {
  async publish(payload: FirebasePayload): Promise<void> {
    const state = readFirebase();
    state[payload.missionId] = payload;
    writeFirebase(state);
    // eslint-disable-next-line no-console
    console.info("[Firebase-Mock] publish", payload.missionId, payload);
  }

  async setSichtbarkeit(missionId: string, sichtbar: boolean): Promise<void> {
    const state = readFirebase();
    if (state[missionId]) {
      state[missionId] = { ...state[missionId], sichtbar };
      writeFirebase(state);
    }
    // eslint-disable-next-line no-console
    console.info("[Firebase-Mock] setSichtbarkeit", missionId, sichtbar);
  }

  async read(missionId: string): Promise<FirebasePayload | null> {
    return readFirebase()[missionId] ?? null;
  }
}
