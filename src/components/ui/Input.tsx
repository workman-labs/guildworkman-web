import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="flex flex-col gap-1.5 text-sm" htmlFor={inputId}>
        {label && <span className="font-medium text-ink">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-xl border px-4 py-3 text-ink placeholder:text-muted bg-white outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 ${
            error ? "border-err" : "border-line"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-err text-xs">{error}</span>}
      </label>
    );
  }
);
Input.displayName = "Input";

export default Input;
