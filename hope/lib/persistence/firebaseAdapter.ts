/**
 * Platzhalter für die echte Firebase-Anbindung.
 *
 * Implementiert dieselben Schnittstellen wie der localStorage-Mock. Sobald das
 * Firebase-Feldmodell mit dem App-Team final geklärt ist (Grundannahme
 * „Firebase-Felder“; OOS-010), kann diese Klasse die Konfiguration in den
 * App-Adapter (siehe `lib/store/missionStore.ts`) eingehängt werden — ohne
 * Änderungen an UI oder Store.
 *
 * Beispielhafte Skizze (Firestore):
 *
 *   import { initializeApp } from "firebase/app";
 *   import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";
 *   const db = getFirestore(initializeApp({ ...config }));
 *   await setDoc(doc(db, "missions", payload.missionId), payload);
 */

import type { Mission, Stammdaten } from "../domain/types";
import type { FirebaseGateway, PersistenceAdapter } from "./adapter";
import type { FirebasePayload } from "./firebaseMapping";

const NICHT_IMPLEMENTIERT =
  "Firebase-Adapter ist noch nicht angebunden. Firebase-Feldmodell wird mit dem App-Team geklärt (OOS-010).";

export class FirebasePersistence implements PersistenceAdapter {
  async listMissions(): Promise<Mission[]> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
  async getMission(): Promise<Mission | null> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
  async saveMission(): Promise<void> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
  async deleteMission(): Promise<void> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
  async getStammdaten(): Promise<Stammdaten> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
}

export class FirebaseGatewayImpl implements FirebaseGateway {
  async publish(_payload: FirebasePayload): Promise<void> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
  async setSichtbarkeit(): Promise<void> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
  async read(): Promise<FirebasePayload | null> {
    throw new Error(NICHT_IMPLEMENTIERT);
  }
}
