"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  Field,
  Input,
  Textarea,
  ProgressBar,
  cn,
} from "@/components/ui";
import { Collapse } from "@/components/motion";
import type { ScreenDef } from "@/lib/domain/screens";
import type { ValidationIssue } from "@/lib/validation";

/* ------------------------------------------------------------------ */
/* Screen-Icon mapping (simple SVG-inline icons via unicode/emoji)     */
/* ------------------------------------------------------------------ */

const SCREEN_ICONS: Record<string, string> = {
  play: "▶",
  sparkles: "✦",
  gift: "🎁",
  frown: "☹",
  ticket: "🎟",
  scale: "⚖",
};

function getScreenIcon(icon: string): string {
  return SCREEN_ICONS[icon] ?? "◉";
}

/* ------------------------------------------------------------------ */
/* Per-field control                                                    */
/* ------------------------------------------------------------------ */

interface FieldControlProps {
  field: import("@/lib/domain/screens").FieldDef;
  value: string;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: string) => void;
}

function FieldControl({ field, value, disabled, invalid, onChange }: FieldControlProps) {
  const common = {
    id: `${field.key}`,
    value,
    disabled,
    invalid,
    placeholder: field.placeholder ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
  };

  if (field.type === "longtext") {
    return (
      <Textarea
        {...common}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === "legal") {
    return (
      <Textarea
        {...common}
        rows={8}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === "url") {
    return (
      <Input
        {...common}
        type="url"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === "image") {
    return (
      <div className="space-y-1.5">
        <Input
          {...common}
          type="text"
          placeholder={field.placeholder ?? "Asset-Pfad oder URL"}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="text-xs text-fg-muted">
          Assets werden extern bereitgestellt (BR-UC06-004). Hier den Bezeichner oder URL eintragen.
        </p>
      </div>
    );
  }

  // text and button
  return (
    <Input
      {...common}
      type="text"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* ScreenCard                                                           */
/* ------------------------------------------------------------------ */

export interface ScreenCardProps {
  screen: ScreenDef;
  content: Record<string, string>;
  issues: ValidationIssue[];
  disabled: boolean;
  onFieldChange: (fieldKey: string, value: string) => void;
}

export function ScreenCard({
  screen,
  content,
  issues,
  disabled,
  onFieldChange,
}: ScreenCardProps) {
  const [open, setOpen] = useState(true);

  const requiredFields = screen.fields.filter((f) => f.required);
  const filledRequired = requiredFields.filter(
    (f) => (content[f.key] ?? "").trim().length > 0,
  );
  const total = requiredFields.length;
  const filled = filledRequired.length;
  const allComplete = total === 0 || filled === total;
  const progressValue = total === 0 ? 100 : Math.round((filled / total) * 100);

  const hasErrors = issues.some((i) => i.severity === "error");

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        hasErrors && "ring-1 ring-danger/30",
      )}
    >
      {/* Header — clickable to collapse */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <CardHeader className="cursor-pointer hover:bg-surface-2/60 transition-colors">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-base"
              aria-hidden
            >
              {getScreenIcon(screen.icon)}
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{screen.name}</CardTitle>
              <CardDescription className="line-clamp-1">{screen.beschreibung}</CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {/* Completeness indicator */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  allComplete ? "text-success" : "text-fg-muted",
                )}
              >
                {allComplete ? "Vollständig" : `${filled}/${total} Pflichtfelder`}
              </span>
              {total > 0 && (
                <ProgressBar
                  value={progressValue}
                  tone={allComplete ? "success" : hasErrors ? "danger" : "warning"}
                  className="w-24"
                />
              )}
            </div>
            {/* Chevron */}
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-fg-muted"
              aria-hidden
            >
              ▾
            </motion.span>
          </div>
        </CardHeader>
      </button>

      <Collapse open={open}>
        <CardBody className="space-y-4">
          {screen.fields.map((field) => {
            const fieldIssues = issues.filter(
              (i) => i.refId === screen.id && i.field === field.key,
            );
            const fieldErrors = fieldIssues
              .filter((i) => i.severity === "error")
              .map((i) => i.message);

            return (
              <Field
                key={field.key}
                htmlFor={`${screen.id}-${field.key}`}
                label={field.label}
                required={field.required}
                help={field.help}
                error={fieldErrors.length > 0 ? fieldErrors : null}
              >
                <FieldControl
                  field={field}
                  value={content[field.key] ?? ""}
                  disabled={disabled}
                  invalid={fieldErrors.length > 0}
                  onChange={(v) => onFieldChange(field.key, v)}
                />
              </Field>
            );
          })}
        </CardBody>
      </Collapse>
    </Card>
  );
}
