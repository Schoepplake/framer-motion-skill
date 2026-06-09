# HOPE — Gewinnspiel-Missionen

Konfiguration und Steuerung von **Gewinnspiel-Missionen** für die PENNY App.
HOPE löst die bisher getrennten Pflegeprozesse aus CI360 und Admin-UI in einem
Zielprozess ab, validiert alle veröffentlichungsrelevanten Angaben und übergibt
freigegebene Konfigurationen an Firebase, das die PENNY App ausliest.

> Umsetzung der Anforderungen aus „6. Anforderungen" (REQ-/BR-/VAL-/NFR-IDs).
> Prototyp mit lokaler Persistenz; die Firebase-Anbindung ist als austauschbarer
> Adapter vorbereitet.

## Tech-Stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript** (strict)
- **Tailwind CSS** (Design-System mit CSS-Variablen)
- **framer-motion** (Animationen, gemäß dem Framer-Motion-Skill dieses Repos)
- **zustand** (zentraler State)
- Persistenz: **localStorage** (Mock) hinter dem Adapter-Muster

## Starten

```bash
cd hope
npm install
npm run dev      # http://localhost:3000
```

Weitere Skripte: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

Beim ersten Start werden Demo-Missionen und Stammdaten (Promo-Item-Pool,
Coupon-Mechaniken) in den localStorage geseedet.

## Statusmodell

`Entwurf → Veröffentlicht → Aktiv → Beendet`, dazu `Storniert` (vor Aktivierung)
und `Abgebrochen` (aktive Mission). Übergänge sind in `lib/domain/status.ts`
gekapselt und werden erzwungen (REQ-STA-002).

## Use Cases

| UC | Thema | Route |
|----|-------|-------|
| UC01 | Mission anlegen | `/` (Dashboard) → `…/grunddaten` |
| UC02 | Grunddaten | `/missions/[id]/grunddaten` |
| UC03 | Gewinnspielmechanik | `/missions/[id]/mechanik` |
| UC04 | Coupon-Sofortgewinne (+ Zeitabdeckung) | `/missions/[id]/coupons` |
| UC05 | Ergebnisarten & operative Werte | `/missions/[id]/ergebnisarten` |
| UC06 | Lostopf / Sachpreisverlosung | `/missions/[id]/lostopf` |
| UC07 | App-Inhalte & Screens | `/missions/[id]/inhalte` |
| UC08 | Vorschau | `/missions/[id]/vorschau` |
| UC09 | Review & Veröffentlichung | `/missions/[id]/review` |
| UC10/11/12 | Stornieren / Abbrechen / Operative Werte ändern | `/missions/[id]/review` |
| UC13 | Audit Trail | `/missions/[id]/audit` |

## Architektur

```
hope/
├─ app/                     # Next.js App Router (Seiten = Use Cases)
├─ components/
│  ├─ ui/                   # Design-System (Button, Card, Field, Modal, …)
│  ├─ motion/               # Animations-Bausteine (framer-motion)
│  ├─ editor/               # EditorChrome (Tabs+Validierungs-Badges), EditorPage, IssueList
│  └─ …                     # fachliche Komponenten je Bereich
└─ lib/
   ├─ domain/               # Typen, Statusmodell, Screen-Schema, Labels, Factory
   ├─ validation/           # Validierungsengine (VAL-001…025) + Coupon-Zeitabdeckung
   ├─ store/                # zustand-Store (alle UC-Aktionen) + Audit
   └─ persistence/          # Adapter-Schnittstelle, localStorage-Mock, Firebase-Mapping/-Stub
```

Der verbindliche Implementierungs-Contract ist in [`ARCHITECTURE.md`](./ARCHITECTURE.md)
dokumentiert.

### Kernstück: Coupon-Zeitabdeckung

`lib/validation/coverage.ts` berechnet, ob über den **gesamten** Missionszeitraum
zu jedem Zeitpunkt mindestens ein Coupon-Sofortgewinn gültig ist. Lücken
(reine Niete-/Lostopf-Zeiträume) sind fachlich nicht erlaubt und blockieren die
Veröffentlichung (REQ-GEN-011, REQ-UC04-008/009, VAL-023/024, BR-UC04-010/011,
OOS-012). Das Ergebnis wird als Timeline visualisiert.

## Firebase-Anbindung austauschen

Persistenz und Firebase sind über Schnittstellen (`lib/persistence/adapter.ts`)
entkoppelt. Standard ist der localStorage-Mock. Für echtes Firebase die
Implementierungen in `lib/persistence/firebaseAdapter.ts` vervollständigen und in
`lib/store/missionStore.ts` die Instanzen austauschen — UI und Store bleiben
unverändert. Das JSON-/Firebase-Feldmodell ist zentral in
`lib/persistence/firebaseMapping.ts` abgebildet (final mit dem App-Team zu klären,
OOS-010).

## Out of Scope (initial)

Historische CI360-Migration, Ziehung/Kommunikation von Sachpreisgewinnern,
systemseitig erzwungenes Vier-Augen-Prinzip, feldgenaue Audit-Historie,
Gewichtung gleichzeitig gültiger Coupons (initial Gleichverteilung), Kombination
„Coupon-Sofortgewinn + Lostopf-Teilnahme" (OOS-001…012).
