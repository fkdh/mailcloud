import type { ChangeEvent } from "react";
import { FormField, getFieldError, invalidFieldClass } from "./form-field";
import { Input } from "../ui/input";
import { PasswordInput } from "./password-input";

type StringFieldApi = {
  name: string;
  state: { value: string; meta: { errors: unknown[] } };
  handleChange: (updater: string | ((previous: string) => string)) => void;
  handleBlur: () => void;
};

type ControlledFieldProps = {
  field: StringFieldApi;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
};

function ControlledField({ field, label, type = "text", placeholder }: ControlledFieldProps) {
  const error = getFieldError(field.state.meta.errors);
  const props = {
    id: field.name,
    name: field.name,
    value: field.state.value,
    placeholder,
    onChange: (event: ChangeEvent<HTMLInputElement>) => field.handleChange(event.target.value),
    onBlur: field.handleBlur,
    "aria-invalid": Boolean(error),
    className: invalidFieldClass(error),
  };

  return <FormField label={label} htmlFor={field.name} error={error}>{type === "password" ? <PasswordInput {...props} /> : <Input {...props} type={type} />}</FormField>;
}

export { ControlledField, type StringFieldApi };
