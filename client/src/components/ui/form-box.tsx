import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import {
    Controller,
    type Control,
    type FieldError as FieldErrorType,
    type FieldValues,
    type Path,
    type RegisterOptions,
    type UseFormRegister
} from "react-hook-form";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "./field";
import { Input } from "./input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";

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
  inputType?: "input" | "textarea" | "select" | "switch" | "radio" | "otp";
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
  control,
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
        case 'otp':
          return (
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  containerClassName="w-full"
                  className={cn(errors ? 'aria-invalid:border-destructive' : '')}
                >
                  <InputOTPGroup className="w-full flex gap-2">
                    <InputOTPSlot className="flex-1 h-14 rounded-md border text-lg" index={0} />
                    <InputOTPSlot className="flex-1 h-14 rounded-md border text-lg" index={1} />
                    <InputOTPSlot className="flex-1 h-14 rounded-md border text-lg" index={2} />
                    <InputOTPSlot className="flex-1 h-14 rounded-md border text-lg" index={3} />
                    <InputOTPSlot className="flex-1 h-14 rounded-md border text-lg" index={4} />
                    <InputOTPSlot className="flex-1 h-14 rounded-md border text-lg" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          )
      default:
        return (
          <div className="relative">
            <Input
              type={isVisible ? "text" : type}
              placeholder={placeholder}
              className={cn(
                " focus:outline-blue-500 focus:ring-blue-500 py-5.5",
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
