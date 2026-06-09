import { cn } from "./cn";
import { InfoTooltip } from "./Tooltip";

export interface FieldProps {
  label: string;
  htmlFor?: string;
  /** Pflichtfeld-Kennzeichnung (NFR-USAB-008). */
  required?: boolean;
  /** Hilfetext als Tooltip (NFR-USAB-009). */
  help?: string;
  /** Beschreibung unter dem Label. */
  hint?: string;
  /** Fehlermeldung(en) — feldnah angezeigt (REQ-UC06-006, VAL-028). */
  error?: string | string[] | null;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  htmlFor,
  required,
  help,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  const errors = Array.isArray(error) ? error : error ? [error] : [];
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-medium text-fg"
      >
        <span>{label}</span>
        {required && (
          <span className="text-danger" aria-label="Pflichtfeld" title="Pflichtfeld">
            *
          </span>
        )}
        {help && <InfoTooltip text={help} />}
      </label>
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
      {children}
      {errors.map((e, i) => (
        <p key={i} className="flex items-start gap-1 text-xs font-medium text-danger">
          <span aria-hidden>⚠</span>
          <span>{e}</span>
        </p>
      ))}
    </div>
  );
}

export const labelClass = "text-sm font-medium text-fg";
