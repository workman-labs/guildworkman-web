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
        {label && <span className="font-medium text-ink-700">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-xl border px-4 py-3 text-ink-900 placeholder:text-ink-300 bg-white outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
            error ? "border-error" : "border-ink-100"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-error text-xs">{error}</span>}
      </label>
    );
  }
);
Input.displayName = "Input";

export default Input;
