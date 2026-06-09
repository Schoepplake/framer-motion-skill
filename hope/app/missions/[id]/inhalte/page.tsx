"use client";

import { useMission, useValidation } from "@/lib/store/hooks";
import { useMissionStore } from "@/lib/store/missionStore";
import { isKonfigurationEditierbar } from "@/lib/domain/status";
import { getRelevanteScreens } from "@/lib/domain/screens";
import { EditorPage } from "@/components/editor/EditorPage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  Field,
  Input,
  ButtonLink,
  Callout,
  ProgressBar,
  cn,
} from "@/components/ui";
import { FadeIn, StaggerList, StaggerItem } from "@/components/motion";
import { ScreenCard } from "@/components/inhalte/ScreenCard";

export default function Page({ params }: { params: { id: string } }) {
  const mission = useMission(params.id);
  const setScreenField = useMissionStore((s) => s.setScreenField);
  const setStyling = useMissionStore((s) => s.setStyling);
  const validation = useValidation(mission);

  if (!mission) return null;

  const editierbar = isKonfigurationEditierbar(mission);
  const inhalteIssues = validation?.byArea.inhalte ?? [];

  const screens = getRelevanteScreens(mission);

  // Overall completion summary
  const allRequiredFields = screens.flatMap((screen) =>
    screen.fields.filter((f) => f.required).map((f) => ({ screen, field: f })),
  );
  const filledRequiredFields = allRequiredFields.filter(({ screen, field }) =>
    (mission.appContent.screens[screen.id]?.[field.key] ?? "").trim().length > 0,
  );
  const missingCount = allRequiredFields.length - filledRequiredFields.length;
  const allComplete = missingCount === 0;
  const overallProgress =
    allRequiredFields.length === 0
      ? 100
      : Math.round((filledRequiredFields.length / allRequiredFields.length) * 100);

  const { styling } = mission.appContent;

  return (
    <EditorPage
      ucId="UC07"
      title="App-Inhalte & Screens"
      description="Pflegen Sie die Texte, Bilder und Schaltflächen für jeden Screen der PENNY App. Die Felder werden direkt in der App-Vorschau sichtbar."
      locked={!editierbar}
      actions={
        <ButtonLink
          href={`/missions/${params.id}/vorschau`}
          variant="outline"
          size="sm"
        >
          Vorschau ansehen →
        </ButtonLink>
      }
    >
      <StaggerList className="space-y-5">
        {/* Summary Callout */}
        <StaggerItem>
          <FadeIn>
            {allComplete ? (
              <Callout tone="success" title="Alle Pflichtfelder ausgefüllt">
                Alle {allRequiredFields.length} Pflichtfelder über{" "}
                {screens.length} Screens sind vollständig gepflegt.
                Die Mission kann veröffentlicht werden (BR-UC06-001/002).
              </Callout>
            ) : (
              <Callout tone="warning" title={`${missingCount} Pflichtfeld${missingCount === 1 ? "" : "er"} fehlen`}>
                <div className="space-y-2">
                  <p>
                    {filledRequiredFields.length} von {allRequiredFields.length} Pflichtfeldern sind
                    ausgefüllt. Bitte füllen Sie alle Pflichtfelder aus, bevor Sie die Mission veröffentlichen
                    (BR-UC06-001/002).
                  </p>
                  <ProgressBar
                    value={overallProgress}
                    tone={overallProgress < 50 ? "danger" : "warning"}
                    className="mt-2"
                  />
                </div>
              </Callout>
            )}
          </FadeIn>
        </StaggerItem>

        {/* Screen sections */}
        {screens.map((screen, idx) => {
          const screenContent = mission.appContent.screens[screen.id] ?? {};
          const screenIssues = inhalteIssues.filter(
            (i) => i.refId === screen.id,
          );

          return (
            <StaggerItem key={screen.id}>
              <FadeIn delay={idx * 0.04}>
                <ScreenCard
                  screen={screen}
                  content={screenContent}
                  issues={screenIssues}
                  disabled={!editierbar}
                  onFieldChange={(fieldKey, value) =>
                    setScreenField(params.id, screen.id, fieldKey, value)
                  }
                />
              </FadeIn>
            </StaggerItem>
          );
        })}

        {/* Styling section */}
        <StaggerItem>
          <FadeIn delay={screens.length * 0.04}>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>App-Styling</CardTitle>
                  <CardDescription>
                    Primär- und Sekundärfarbe für die Darstellung in der PENNY App (REQ-UC06-003).
                    Verwenden Sie Hex-Farben (#rrggbb).
                  </CardDescription>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Primärfarbe"
                    htmlFor="primaerfarbe"
                    help="Hauptfarbe für Buttons und Akzente in der App."
                  >
                    <div className="flex items-center gap-2">
                      <input
                        id="primaerfarbe-color"
                        type="color"
                        value={styling.primaerfarbe || "#e2001a"}
                        disabled={!editierbar}
                        className={cn(
                          "h-10 w-12 cursor-pointer rounded-lg border border-border bg-surface p-1 transition-opacity",
                          !editierbar && "cursor-not-allowed opacity-50",
                        )}
                        onChange={(e) =>
                          setStyling(params.id, { primaerfarbe: e.target.value })
                        }
                        aria-label="Primärfarbe Farbwähler"
                      />
                      <Input
                        id="primaerfarbe"
                        value={styling.primaerfarbe}
                        placeholder="#e2001a"
                        disabled={!editierbar}
                        onChange={(e) =>
                          setStyling(params.id, { primaerfarbe: e.target.value })
                        }
                      />
                    </div>
                  </Field>

                  <Field
                    label="Sekundärfarbe"
                    htmlFor="sekundaerfarbe"
                    help="Akzentfarbe für sekundäre Elemente und Hervorhebungen."
                  >
                    <div className="flex items-center gap-2">
                      <input
                        id="sekundaerfarbe-color"
                        type="color"
                        value={styling.sekundaerfarbe || "#ffffff"}
                        disabled={!editierbar}
                        className={cn(
                          "h-10 w-12 cursor-pointer rounded-lg border border-border bg-surface p-1 transition-opacity",
                          !editierbar && "cursor-not-allowed opacity-50",
                        )}
                        onChange={(e) =>
                          setStyling(params.id, { sekundaerfarbe: e.target.value })
                        }
                        aria-label="Sekundärfarbe Farbwähler"
                      />
                      <Input
                        id="sekundaerfarbe"
                        value={styling.sekundaerfarbe}
                        placeholder="#ffffff"
                        disabled={!editierbar}
                        onChange={(e) =>
                          setStyling(params.id, { sekundaerfarbe: e.target.value })
                        }
                      />
                    </div>
                  </Field>
                </div>

                {/* Styling preview strip */}
                <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/60 p-3">
                  <span className="text-xs text-fg-muted">Vorschau:</span>
                  <div
                    className="h-7 w-20 rounded-md text-xs font-medium leading-7 text-center text-white shadow-sm"
                    style={{ backgroundColor: styling.primaerfarbe || "#e2001a" }}
                  >
                    Button
                  </div>
                  <div
                    className="h-7 w-20 rounded-md border text-xs font-medium leading-7 text-center shadow-sm"
                    style={{
                      backgroundColor: styling.sekundaerfarbe || "#ffffff",
                      borderColor: styling.primaerfarbe || "#e2001a",
                      color: styling.primaerfarbe || "#e2001a",
                    }}
                  >
                    Sekundär
                  </div>
                </div>
              </CardBody>
            </Card>
          </FadeIn>
        </StaggerItem>

        {/* Link to preview */}
        <StaggerItem>
          <FadeIn delay={(screens.length + 1) * 0.04}>
            <div className="flex justify-end">
              <ButtonLink
                href={`/missions/${params.id}/vorschau`}
                variant="primary"
                size="md"
              >
                App-Vorschau ansehen →
              </ButtonLink>
            </div>
          </FadeIn>
        </StaggerItem>
      </StaggerList>
    </EditorPage>
  );
}
