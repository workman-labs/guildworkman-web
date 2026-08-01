import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id ?? props.name;
    return (
      <label className="flex flex-col gap-1.5 text-sm" htmlFor={textareaId}>
        {label && <span className="font-medium text-ink">{label}</span>}
        <textarea
          ref={ref}
          id={textareaId}
          className={`rounded-xl border px-4 py-3 text-ink placeholder:text-muted bg-surface outline-none transition-colors focus:border-navy-2 focus:ring-2 focus:ring-navy/15 min-h-[120px] resize-y ${
            error ? "border-err" : "border-line"
          } ${className}`}
          {...props}
        />
        {error && <span className="text-err text-xs">{error}</span>}
      </label>
    );
  }
);
Textarea.displayName = "Textarea";

export default Textarea;