import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <label className="flex flex-col gap-1.5 text-sm" htmlFor={selectId}>
        {label && <span className="font-medium text-ink-700">{label}</span>}
        <select
          ref={ref}
          id={selectId}
          className={`rounded-xl border border-ink-100 px-4 py-3 text-ink-900 bg-white outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
          {...props}
        >
          {children}
        </select>
      </label>
    );
  }
);
Select.displayName = "Select";

export default Select;
