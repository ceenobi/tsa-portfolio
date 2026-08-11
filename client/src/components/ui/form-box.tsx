import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import {
    type Control,
    type FieldError as FieldErrorType,
    type FieldValues,
    type Path,
    type RegisterOptions,
    type UseFormRegister
} from "react-hook-form";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "./field";
import { Input } from "./input";

export type SelectOption = {
  name: string;
  id: string | number;
  description?: string;
};

type FormFieldProps<T extends FieldValues> = {
  label: string;
  type: string;
  id: string;
  register: UseFormRegister<T>;
  errors?: FieldErrorType | undefined;
  placeholder?: string;
  isVisible?: boolean;
  setIsVisible?: (visible: boolean | ((prev: boolean) => boolean)) => void;
  name: Path<T>;
  classname?: string;
  disabled?: boolean;
  defaultValue?: string | Date | number | boolean;
  inputType?: "input" | "textarea" | "select" | "switch" | "radio";
  registerOptions?: RegisterOptions<T>;
  control?: Control<T>;
  options?: SelectOption[];
  styles?: string;
};

export function FormBox<T extends FieldValues>({
  isVisible,
  setIsVisible,
  label,
  type,
  placeholder,
  id,
  register,
  errors,
  name,
  classname,
  disabled = false,
  defaultValue,
  inputType,
  registerOptions,
  // control,
  // options,
  // styles,
}: FormFieldProps<T>) {
  const toggleVisibility = () => setIsVisible?.((prev: boolean) => !prev);
  const renderField = () => {
    switch (inputType ?? type) {
      case "textarea":
        return (
          <textarea
            rows={4}
            placeholder={placeholder}
            id={id}
            {...register(name, registerOptions)}
            disabled={disabled}
          />
        );
      default:
        return (
          <div className="relative">
            <Input
              type={isVisible ? "text" : type}
              placeholder={placeholder}
              className={cn(
                "focus:outline-blue-500 focus:ring-blue-500 py-5.5",
                errors ? "border-red-600" : "",
              )}
              id={id}
              {...register(name, registerOptions)}
              disabled={disabled}
              defaultValue={
                defaultValue instanceof Date
                  ? defaultValue.toISOString().split("T")[0]
                  : typeof defaultValue === "boolean"
                    ? String(defaultValue)
                    : defaultValue
              }
            />
            {type === "password" && (
              <button
                type="button"
                className="absolute inset-y-0 right-2 text-xs border-0 focus:outline-none font-semibold cursor-pointer text-gray-700 w-fit"
                onClick={toggleVisibility}
              >
                {isVisible ? <EyeOff /> : <Eye />}
              </button>
            )}
          </div>
        )
    }
  }

  return (
      <div className={`${classname}`}>
        <FieldSet>
          <FieldLegend className="w-full relative">
            <Field>
              <FieldLabel
                htmlFor={id}
                className={cn(
                  "text-sm text-SoftBlack",
                  errors ? "text-red-600" : "",
                )}
              >
                {label}
              </FieldLabel>
              {renderField()}
            </Field>
          </FieldLegend>
        </FieldSet>
        {errors?.message && (
          <FieldError className="text-xs text-destructive">
            {String(errors?.message)}
          </FieldError>
        )}
      </div>
    );
}
