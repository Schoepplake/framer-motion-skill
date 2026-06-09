/**
 * Persistenz- und Firebase-Schnittstellen.
 *
 * Die Implementierung ist austauschbar: initial gegen localStorage (Mock),
 * später gegen echte Backends/Firebase (Adapter-Muster). HOPE selbst speichert
 * Missionen; veröffentlichte Konfigurationen werden zusätzlich an Firebase
 * übergeben (REQ-GEN-008).
 */

import type { Mission, Stammdaten } from "../domain/types";
import type { FirebasePayload } from "./firebaseMapping";

export interface PersistenceAdapter {
  listMissions(): Promise<Mission[]>;
  getMission(id: string): Promise<Mission | null>;
  saveMission(mission: Mission): Promise<void>;
  deleteMission(id: string): Promise<void>;
  getStammdaten(): Promise<Stammdaten>;
}

/**
 * Gateway zur App-Datenbereitstellung (Firebase). Im SOLL übergibt HOPE
 * veröffentlichte Konfigurationen hierhin; bei Storno/Abbruch wird die Mission
 * so aktualisiert, dass sie nicht mehr angezeigt wird (REQ-STA-008).
 */
export interface FirebaseGateway {
  /** Übergibt/aktualisiert die veröffentlichte Konfiguration. */
  publish(payload: FirebasePayload): Promise<void>;
  /** Markiert eine Mission als nicht mehr sichtbar (Storno/Abbruch). */
  setSichtbarkeit(missionId: string, sichtbar: boolean): Promise<void>;
  /** Liest den aktuellen Firebase-Spiegel (für Inspektion in HOPE). */
  read(missionId: string): Promise<FirebasePayload | null>;
}
