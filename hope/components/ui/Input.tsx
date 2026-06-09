import { forwardRef } from "react";
import { cn } from "./cn";

const base =
  "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted/60 focus-ring transition-colors disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-muted";

function stateClass(invalid?: boolean) {
  return invalid
    ? "border-danger focus-visible:outline-danger"
    : "border-border hover:border-muted/40";
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...rest }, ref) => (
    <input ref={ref} className={cn(base, stateClass(invalid), className)} {...rest} />
  ),
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 3, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(base, "resize-y leading-relaxed", stateClass(invalid), className)}
      {...rest}
    />
  ),
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(base, "appearance-none bg-no-repeat pr-9", stateClass(invalid), className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.5rem center",
      }}
      {...rest}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
