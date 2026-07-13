import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <label className="flex flex-col gap-1.5 text-sm" htmlFor={selectId}>
        {label && <span className="font-medium text-ink">{label}</span>}
        <select
          ref={ref}
          id={selectId}
          className={`rounded-xl border border-line px-4 py-3 text-ink bg-surface outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 ${className}`}
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
