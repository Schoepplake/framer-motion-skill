"use client";

import type { ScreenDef } from "@/lib/domain/screens";
import type { ValidationIssue } from "@/lib/validation";
import { cn } from "@/components/ui";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface ScreenPreviewProps {
  screen: ScreenDef;
  content: Record<string, string>;
  styling: {
    primaerfarbe: string;
    sekundaerfarbe: string;
  };
  issues: ValidationIssue[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const PENNY_RED = "#e2001a";
const FALLBACK_WHITE = "#ffffff";

function resolveColor(color: string | undefined, fallback: string): string {
  if (!color || color.trim() === "") return fallback;
  return color;
}

/** Heuristic: Is the background dark enough to need white text? */
function isDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/** Derive a muted background for an image placeholder based on primaerfarbe */
function imagePlaceholderStyle(primaer: string): React.CSSProperties {
  return {
    background: `linear-gradient(135deg, ${primaer}18, ${primaer}30)`,
    border: `1.5px dashed ${primaer}60`,
  };
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

interface PreviewTextProps {
  value: string;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
}

function PreviewText({ value, placeholder, className, style }: PreviewTextProps) {
  const empty = !value || value.trim() === "";
  return (
    <span
      className={cn(
        "block",
        empty ? "opacity-30 italic" : "",
        className,
      )}
      style={style}
    >
      {empty ? placeholder : value}
    </span>
  );
}

interface PreviewButtonProps {
  value: string;
  placeholder: string;
  primaer: string;
}

function PreviewButton({ value, placeholder, primaer }: PreviewButtonProps) {
  const empty = !value || value.trim() === "";
  const color = resolveColor(primaer, PENNY_RED);
  const textColor = isDark(color) ? FALLBACK_WHITE : "#1a1a1a";

  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-xl py-3 text-sm font-semibold shadow transition-opacity",
        empty && "opacity-40",
      )}
      style={{ backgroundColor: color, color: textColor }}
      disabled
      tabIndex={-1}
    >
      {empty ? placeholder : value}
    </button>
  );
}

interface ImagePlaceholderProps {
  value: string;
  label: string;
  primaer: string;
  className?: string;
}

function ImagePlaceholder({ value, label, primaer, className }: ImagePlaceholderProps) {
  const color = resolveColor(primaer, PENNY_RED);
  const hasValue = value && value.trim() !== "";

  if (hasValue) {
    // Attempt to render as image; fall back to placeholder on error
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt={label}
        className={cn("w-full rounded-lg object-cover", className)}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          (e.currentTarget.nextSibling as HTMLElement | null)?.style?.setProperty(
            "display",
            "flex",
          );
        }}
        style={{ minHeight: 120, maxHeight: 200 }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[120px] w-full items-center justify-center rounded-lg",
        className,
      )}
      style={imagePlaceholderStyle(color)}
    >
      <div className="flex flex-col items-center gap-1 text-center" style={{ color: `${color}99` }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-[11px] font-medium">{label}</span>
        <span className="text-[10px] opacity-70">Bild extern bereitgestellt</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen-specific layouts                                              */
/* ------------------------------------------------------------------ */

function IntroScreenPreview({
  content,
  primaer,
}: {
  content: Record<string, string>;
  primaer: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <ImagePlaceholder
        value={content.heroBild ?? ""}
        label="Hero-Bild"
        primaer={primaer}
        className="aspect-video"
      />
      <div className="space-y-2 text-center">
        <PreviewText
          value={content.titel ?? ""}
          placeholder="Titel"
          className="text-lg font-bold leading-tight text-neutral-900"
        />
        <PreviewText
          value={content.beschreibung ?? ""}
          placeholder="Beschreibungstext"
          className="text-sm leading-relaxed text-neutral-600"
        />
      </div>
      <PreviewButton
        value={content.startButton ?? ""}
        placeholder="Start-Button"
        primaer={primaer}
      />
    </div>
  );
}

function SpielScreenPreview({
  content,
  primaer,
  screenName,
}: {
  content: Record<string, string>;
  primaer: string;
  screenName: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* App-style mini nav label */}
      <div
        className="rounded-lg py-2 text-center text-xs font-semibold uppercase tracking-widest"
        style={{ backgroundColor: `${resolveColor(primaer, PENNY_RED)}15`, color: resolveColor(primaer, PENNY_RED) }}
      >
        {screenName}
      </div>
      <ImagePlaceholder
        value={content.aktionBild ?? ""}
        label="Aktionsbild"
        primaer={primaer}
        className="aspect-square"
      />
      <PreviewText
        value={content.anleitung ?? ""}
        placeholder="Anleitungstext"
        className="text-sm leading-relaxed text-neutral-600 text-center"
      />
      <PreviewButton
        value={content.aktionButton ?? ""}
        placeholder="Aktions-Button"
        primaer={primaer}
      />
    </div>
  );
}

function GewinnScreenPreview({
  content,
  primaer,
}: {
  content: Record<string, string>;
  primaer: string;
}) {
  const color = resolveColor(primaer, PENNY_RED);
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Trophy decoration */}
      <div
        className="flex items-center justify-center rounded-2xl py-6"
        style={{ backgroundColor: `${color}12` }}
      >
        <span className="text-5xl" aria-hidden>
          🎉
        </span>
      </div>
      <div className="space-y-2 text-center">
        <PreviewText
          value={content.titel ?? ""}
          placeholder="Glückwunsch!"
          className="text-xl font-bold text-neutral-900"
          style={{ color }}
        />
        <PreviewText
          value={content.text ?? ""}
          placeholder="Gewinntext"
          className="text-sm leading-relaxed text-neutral-600"
        />
      </div>
      {(content.bild ?? "").trim() !== "" && (
        <ImagePlaceholder
          value={content.bild ?? ""}
          label="Bild"
          primaer={primaer}
        />
      )}
      {(content.couponHinweis ?? "").trim() !== "" && (
        <div
          className="rounded-xl px-4 py-3 text-xs text-neutral-600"
          style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}
        >
          <PreviewText
            value={content.couponHinweis ?? ""}
            placeholder="Coupon-Hinweis"
            className="text-xs"
          />
        </div>
      )}
      <PreviewButton
        value={content.button ?? ""}
        placeholder="Coupon ansehen"
        primaer={primaer}
      />
    </div>
  );
}

function NieteScreenPreview({
  content,
  primaer,
}: {
  content: Record<string, string>;
  primaer: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-center rounded-2xl bg-neutral-100 py-6">
        <span className="text-5xl" aria-hidden>
          😔
        </span>
      </div>
      <div className="space-y-2 text-center">
        <PreviewText
          value={content.titel ?? ""}
          placeholder="Leider kein Gewinn"
          className="text-xl font-bold text-neutral-900"
        />
        <PreviewText
          value={content.text ?? ""}
          placeholder="Text"
          className="text-sm leading-relaxed text-neutral-600"
        />
      </div>
      <PreviewButton
        value={content.button ?? ""}
        placeholder="Schließen"
        primaer={primaer}
      />
    </div>
  );
}

function LostopfScreenPreview({
  content,
  primaer,
}: {
  content: Record<string, string>;
  primaer: string;
}) {
  const color = resolveColor(primaer, PENNY_RED);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div
        className="flex items-center justify-center rounded-2xl py-6"
        style={{ backgroundColor: `${color}12` }}
      >
        <span className="text-5xl" aria-hidden>
          🎟
        </span>
      </div>
      <div className="space-y-2 text-center">
        <PreviewText
          value={content.titel ?? ""}
          placeholder="Du bist im Lostopf!"
          className="text-xl font-bold text-neutral-900"
          style={{ color }}
        />
        <PreviewText
          value={content.text ?? ""}
          placeholder="Text"
          className="text-sm leading-relaxed text-neutral-600"
        />
      </div>
      {(content.teilnahmeHinweis ?? "").trim() !== "" && (
        <div
          className="rounded-xl px-4 py-3 text-xs text-neutral-600"
          style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}
        >
          <PreviewText
            value={content.teilnahmeHinweis ?? ""}
            placeholder="Teilnahmehinweis"
            className="text-xs"
          />
        </div>
      )}
      <PreviewButton
        value={content.button ?? ""}
        placeholder="Verstanden"
        primaer={primaer}
      />
    </div>
  );
}

function RechtlichesScreenPreview({
  content,
  primaer,
}: {
  content: Record<string, string>;
  primaer: string;
}) {
  const color = resolveColor(primaer, PENNY_RED);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center">
          <span className="text-3xl" aria-hidden>
            ⚖
          </span>
        </div>
        <p className="text-sm font-semibold text-neutral-800">Rechtliche Hinweise</p>
      </div>
      {(content.teilnahmebedingungen ?? "").trim() !== "" ? (
        <div className="max-h-48 overflow-y-auto rounded-xl bg-neutral-50 p-3 text-[10px] leading-relaxed text-neutral-600">
          {content.teilnahmebedingungen}
        </div>
      ) : (
        <div className="rounded-xl bg-neutral-50 p-3 text-center text-[10px] text-neutral-400 italic">
          Teilnahmebedingungen (noch nicht gepflegt)
        </div>
      )}
      <div className="flex flex-col gap-2">
        {(content.teilnahmebedingungenUrl ?? "").trim() !== "" && (
          <div
            className="truncate rounded-lg px-3 py-2 text-center text-xs font-medium"
            style={{ color, backgroundColor: `${color}10` }}
          >
            TB-URL: {content.teilnahmebedingungenUrl}
          </div>
        )}
        {(content.datenschutzUrl ?? "").trim() !== "" && (
          <div
            className="truncate rounded-lg px-3 py-2 text-center text-xs font-medium"
            style={{ color, backgroundColor: `${color}10` }}
          >
            Datenschutz-URL: {content.datenschutzUrl}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main ScreenPreview component                                         */
/* ------------------------------------------------------------------ */

export function ScreenPreview({ screen, content, styling, issues }: ScreenPreviewProps) {
  const primaer = resolveColor(styling.primaerfarbe, PENNY_RED);
  const hasIssues = issues.some((i) => i.severity === "error" || i.severity === "warning");

  function renderScreenContent() {
    switch (screen.id) {
      case "intro":
        return <IntroScreenPreview content={content} primaer={primaer} />;
      case "spiel":
        return (
          <SpielScreenPreview content={content} primaer={primaer} screenName={screen.name} />
        );
      case "gewinn":
        return <GewinnScreenPreview content={content} primaer={primaer} />;
      case "niete":
        return <NieteScreenPreview content={content} primaer={primaer} />;
      case "lostopf":
        return <LostopfScreenPreview content={content} primaer={primaer} />;
      case "rechtliches":
        return <RechtlichesScreenPreview content={content} primaer={primaer} />;
      default:
        return (
          <div className="flex flex-col gap-3 p-4">
            {screen.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  {field.label}
                </p>
                <PreviewText
                  value={content[field.key] ?? ""}
                  placeholder={field.placeholder ?? field.label}
                  className="text-sm text-neutral-700"
                />
              </div>
            ))}
          </div>
        );
    }
  }

  return (
    <div className="relative h-full">
      {/* Screen PENNY app header strip */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: primaer }}
      >
        {/* Back button placeholder */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-white opacity-90">
          PENNY App
        </span>
        {/* Info icon placeholder */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      </div>

      {/* Validation issues overlay badge */}
      {hasIssues && (
        <div className="absolute right-2 top-12 z-10">
          <div className="flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            <span aria-hidden>!</span>
            <span>
              {issues.filter((i) => i.severity === "error").length > 0
                ? `${issues.filter((i) => i.severity === "error").length} Fehler`
                : `${issues.filter((i) => i.severity === "warning").length} Hinweis${issues.filter((i) => i.severity === "warning").length === 1 ? "" : "e"}`}
            </span>
          </div>
        </div>
      )}

      {/* Screen body */}
      <div className="bg-white">{renderScreenContent()}</div>
    </div>
  );
}
