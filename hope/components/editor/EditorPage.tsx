"use client";

import { PageTransition } from "@/components/motion/PageTransition";
import { Callout } from "@/components/ui/Callout";

export interface EditorPageProps {
  ucId?: string;
  title: string;
  description?: string;
  /** Konfiguration schreibgeschützt (Mission nicht im Entwurf). */
  locked?: boolean;
  lockedHint?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Einheitliches Layout für eine Use-Case-Seite im Missions-Editor. */
export function EditorPage({
  ucId,
  title,
  description,
  locked,
  lockedHint,
  actions,
  children,
}: EditorPageProps) {
  return (
    <PageTransition>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {ucId && (
                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-fg-muted">
                  {ucId}
                </span>
              )}
              <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>
            </div>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-fg-muted">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>

        {locked && (
          <Callout tone="info" title="Schreibgeschützt">
            {lockedHint ??
              "Diese Mission ist nicht mehr im Entwurf. Die Konfiguration ist schreibgeschützt; operative Werte lassen sich unter „Review & Veröffentlichung“ anpassen."}
          </Callout>
        )}

        {children}
      </div>
    </PageTransition>
  );
}
