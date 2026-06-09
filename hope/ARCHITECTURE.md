# HOPE — Architektur & Implementierungs-Contract

Dieses Dokument ist die verbindliche Referenz für alle UI-Seiten. Die
Foundation (Domäne, Validierung, Store, Persistenz, Design-System) ist fertig
und typgeprüft. Seiten konsumieren **ausschließlich** die hier dokumentierte API.

## Stack & Konventionen

- Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind, framer-motion, zustand.
- **Alle Seiten sind Client Components** → erste Zeile `"use client";`.
- Seiten unter `app/missions/[id]/<seg>/page.tsx` erhalten `{ params }: { params: { id: string } }`.
- UI-Sprache: **Deutsch**. Fachlich verständliche Labels, Pflichtfeld-Markierung, Hilfetexte.
- Mutationen **nur** über Store-Actions. Niemals Objekte direkt mutieren.
- Editierbarkeit prüfen mit `isKonfigurationEditierbar(mission)`; bei `false`
  Inputs `disabled` setzen und `<EditorPage locked>` verwenden.
- Pfad-Alias: `@/` → Projektwurzel `hope/`.
- Path-Konvention: importiere aus den Unterpfaden (z. B. `@/components/ui/Button`)
  oder den Barrels `@/components/ui` und `@/components/motion`.

## Domänenmodell — `@/lib/domain/types`

```ts
type MissionStatus = "entwurf"|"veroeffentlicht"|"aktiv"|"beendet"|"storniert"|"abgebrochen";
type Gewinnspielmechanik = "rubellos"|"slot_machine";   // GEWINNSPIELMECHANIKEN: Gewinnspielmechanik[]
type Ergebnisart = "coupon_sofortgewinn"|"niete"|"lostopf";
interface DateRange { von: string|null; bis: string|null }  // ISO yyyy-mm-dd
interface Grunddaten { missionsName: string; zeitraum: DateRange; beschreibung: string; interneReferenz: string }
interface CouponSofortgewinn { id: string; bezeichnung: string; promoItemId: string|null; couponMechanikId: string|null; ausspielung: DateRange }
interface OperativeWerte { gewinnwahrscheinlichkeit: number; sofortgewinngewichtung: number; taeglichesTeilnahmeLimit: number }
// OPERATIVE_WERT_KEYS: ("gewinnwahrscheinlichkeit"|"sofortgewinngewichtung"|"taeglichesTeilnahmeLimit")[]
interface ErgebnisartenConfig { nieteAktiv: boolean; lostopfAktiv: boolean }
interface LostopfPreis { id: string; beschreibung: string; anzahlVerlosungen: number }
interface Lostopf { aktiv: boolean; preise: LostopfPreis[] }
interface AppContent { screens: Record<string, Record<string,string>>; styling: { primaerfarbe: string; sekundaerfarbe: string } }
interface AuditEntry { id: string; zeitpunkt: string; benutzer: string; aktion: AuditAction; beschreibung: string; details?: string }
interface PromoItem { id: string; name: string; kategorie: string }
interface CouponMechanik { id: string; name: string; beschreibung: string }
interface Stammdaten { promoItems: PromoItem[]; couponMechaniken: CouponMechanik[] }
interface Mission {
  id; typ: "gewinnspiel"; status: MissionStatus;
  grunddaten; mechanik: Gewinnspielmechanik|null; couponSofortgewinne: CouponSofortgewinn[];
  ergebnisarten: ErgebnisartenConfig; operativeWerte: OperativeWerte; lostopf: Lostopf; appContent: AppContent;
  audit: AuditEntry[];
  erstelltAm; erstelltVon; geaendertAm; geaendertVon;
  veroeffentlichtAm|null; veroeffentlichtVon|null; storniertAm|null; storniertVon|null; stornierungsgrund|null;
  abgebrochenAm|null; abgebrochenVon|null; abbruchgrund|null;
  firebase: { zuletztUebertragenAm: string|null; sichtbar: boolean };
}
```

## Labels — `@/lib/domain/labels`

`STATUS_LABEL`, `STATUS_BESCHREIBUNG`, `STATUS_TONE` (Record<MissionStatus,…>),
`MECHANIK_LABEL`, `MECHANIK_BESCHREIBUNG` (Record<Gewinnspielmechanik,string>),
`ERGEBNISART_LABEL`, `ERGEBNISART_BESCHREIBUNG` (Record<Ergebnisart,string>),
`OPERATIVER_WERT_LABEL`, `OPERATIVER_WERT_EINHEIT`, `OPERATIVER_WERT_HILFE` (Record<OperativerWertKey,string>),
`AUDIT_ACTION_LABEL` (Record<AuditAction,string>).

## App-Screens — `@/lib/domain/screens`

```ts
getRelevanteScreens(mission): ScreenDef[]   // hängt von Mechanik + Ergebnisarten ab
interface ScreenDef { id: string; name: string; beschreibung: string; icon: string; fields: FieldDef[] }
interface FieldDef { key: string; label: string; type: "text"|"longtext"|"image"|"url"|"button"|"legal"; required: boolean; help?: string; placeholder?: string }
```
Screen-Inhalte liegen in `mission.appContent.screens[screen.id]?.[field.key]` (string).

## Status-Helfer — `@/lib/domain/status`

`isKonfigurationEditierbar(m)` (nur Entwurf), `kannVeroeffentlichen(m)`,
`kannStornieren(m)` (veroeffentlicht), `kannAbbrechen(m)` (aktiv),
`kannOperativeWerteAendern(m)` (veroeffentlicht|aktiv), `kannAktivieren(m)`,
`kannBeenden(m)`, `isTerminal(status)`.

## Validierung — `@/lib/validation`

```ts
validateMission(m, stammdaten): ValidationResult
computeCouponCoverage(m): CoverageResult
interface ValidationIssue { code: string; severity: "error"|"warning"|"info"; area: ValidationArea; message: string; field?: string; refId?: string }
type ValidationArea = "grunddaten"|"mechanik"|"coupons"|"ergebnisarten"|"lostopf"|"inhalte"|"operativ";
interface ValidationResult { issues; errors; warnings; veroeffentlichbar: boolean; byArea: Record<ValidationArea, ValidationIssue[]> }
interface CoverageResult { zeitraumGueltig: boolean; vollstaendigAbgedeckt: boolean; luecken: {von;bis;tage:number}[]; segmente: CoverageSegment[]; tageGesamt: number; tageAbgedeckt: number }
interface CoverageSegment { von: string; bis: string; abgedeckt: boolean; couponIds: string[]; tage: number }
```
Issues für ein Feld filtern: `byArea.coupons.filter(i => i.refId === coupon.id && i.field === "promoItemId")`.

## Store & Hooks

`@/lib/store/hooks`: `useMission(id)`, `useStammdaten()`, `useCurrentUser()`,
`useLoaded()`, `useValidation(mission)` → ValidationResult|null, `useCoverage(mission)` → CoverageResult|null.

`@/lib/store/missionStore`: `useMissionStore(selector)`. Actions (Selektor `s => s.x`):
```
createMission(): string                      // legt Entwurf an, gibt neue id zurück (UC01)
deleteMission(id)
updateGrunddaten(id, patch: Partial<Grunddaten>)   // patch.zeitraum wird gemerged
setMechanik(id, mechanik)
addCoupon(id): string                        // gibt neue couponId zurück
updateCoupon(id, couponId, patch: Partial<CouponSofortgewinn>)  // patch.ausspielung wird gemerged
removeCoupon(id, couponId)
setErgebnisarten(id, patch: Partial<ErgebnisartenConfig>)   // lostopfAktiv hält lostopf.aktiv synchron
setOperativeWerte(id, patch: Partial<OperativeWerte>)       // nach Veröffentlichung: Audit + Firebase (UC12)
setLostopfAktiv(id, aktiv)
addPreis(id): string
updatePreis(id, preisId, patch: Partial<LostopfPreis>)
removePreis(id, preisId)
setScreenField(id, screenId, fieldKey, value)
setStyling(id, patch)
publish(id): ValidationResult                // validiert; bei Erfolg → veroeffentlicht + Firebase (UC09)
cancelMission(id, grund?)                     // → storniert (UC10)
abortMission(id, grund?)                      // → abgebrochen (UC11)
activateMission(id)                           // simuliert: veroeffentlicht → aktiv
endMission(id)                                // simuliert: aktiv → beendet
```

## Formatierung — `@/lib/format`

`formatDate(iso)`, `formatDateTime(iso)`, `formatDateRange(von,bis)`,
`formatRelative(iso)`, `formatNumber(n)`. (Alle null-sicher, liefern „—".)

## Design-System — `@/components/ui` (Barrel)

- `Button` props: `variant: "primary"|"secondary"|"outline"|"ghost"|"danger"`, `size: "sm"|"md"|"lg"|"icon"`, `loading`, plus native button props. (motion.button)
- `ButtonLink` props: `href`, `variant`, `size`, `className`, `children`. (Next-Link, gleicher Look)
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter`.
- `Badge` (`tone: StatusTone`), `Dot` (`tone`), `StatusBadge` (`status: MissionStatus`).
- `Field` props: `label`, `htmlFor?`, `required?`, `help?` (Tooltip), `hint?`, `error?: string|string[]|null`, `children`.
- `InfoTooltip` (`text`).
- `Input`, `Textarea`, `Select` — native props + `invalid?: boolean`. (Select-Kinder = `<option>`.)
- `Toggle` props: `checked`, `onChange: (b)=>void`, `disabled?`, `label?`, `id?`.
- `Modal` props: `open`, `onClose: ()=>void`, `title?`, `description?`, `footer?: ReactNode`, `size?: "sm"|"md"|"lg"`, `children`.
- `Callout` props: `tone: "info"|"success"|"warning"|"danger"|"neutral"`, `title?`, `children`.
- `EmptyState` props: `icon?`, `title`, `description?`, `action?`.
- `ProgressBar` props: `value` (0–100), `tone?: "primary"|"success"|"warning"|"danger"`.
- `cn(...classes)` Helfer.

## Motion — `@/components/motion` (Barrel)

`FadeIn`(`delay?`,`y?`), `FadeInView`, `StaggerList`, `StaggerItem`,
`PageTransition`, `AnimatedNumber`(`value`,`format?`), `Collapse`(`open`).
Alle respektieren reduzierte Bewegung. Nutze diese für Listen/Eingänge.

## Seiten-Gerüst — `@/components/editor`

- `EditorPage` (aus `@/components/editor/EditorPage`) — **jede Seite hiermit umschließen**:
  props `ucId?`, `title`, `description?`, `locked?`, `lockedHint?`, `actions?`, `children`.
- `IssueList` (aus `@/components/editor/IssueList`) — `issues: ValidationIssue[]` einheitlich darstellen.

Die Tab-Navigation, der Mission-Header und Not-Found/Loading werden bereits vom
Layout (`EditorChrome`) gerendert. Seiten rendern **nur ihren Inhalt** und sollten
bei `const mission = useMission(params.id); if (!mission) return null;` früh aussteigen.

## Muster für eine Editor-Seite

```tsx
"use client";
import { useMission } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { isKonfigurationEditierbar } from "@/lib/domain/status";
import { EditorPage } from "@/components/editor/EditorPage";

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const update = useMissionStore((s) => s.updateGrunddaten);
  if (!mission) return null;
  const editierbar = isKonfigurationEditierbar(mission);
  return (
    <EditorPage ucId="UC02" title="…" description="…" locked={!editierbar}>
      {/* Inhalt */}
    </EditorPage>
  );
}
```
