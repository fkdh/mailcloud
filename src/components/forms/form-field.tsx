import type { ReactNode } from "react";
import { Label } from "../ui/label";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <Label className={error ? "text-destructive" : undefined} htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive" role="alert">{error}</p>}
    </div>
  );
}

function getFieldError(errors: unknown[]) {
  const first = errors[0];
  if (!first) return "";
  if (typeof first === "string") return first;
  if (Array.isArray(first)) return getFieldError(first);
  if (typeof first === "object" && first !== null && "message" in first) {
    return String(first.message);
  }
  return String(first);
}

function invalidFieldClass(error: string) {
  return error ? "border-destructive focus-visible:ring-destructive" : "";
}

export { FormField, getFieldError, invalidFieldClass };
