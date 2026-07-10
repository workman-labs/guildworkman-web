import { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "gold"
  | "ghost"
  | "outline"
  | "outline-inverse"
  | "sand";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  // navy = trust = the default action across the product
  primary: "bg-navy text-white hover:bg-navy-2 disabled:opacity-50 shadow-card",
  secondary: "bg-navy-ink text-white hover:bg-navy disabled:opacity-50",
  gold: "bg-gold text-navy-ink hover:bg-gold-2 disabled:opacity-50",
  ghost: "bg-transparent text-ink hover:bg-line/60",
  outline: "bg-transparent text-ink border border-line hover:border-navy-2",
  "outline-inverse":
    "bg-transparent text-white border border-white/40 hover:bg-white/10",
  // for use on terracotta / dark bands
  sand: "bg-[#fbf3e9] text-terra-deep hover:bg-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
};

/** Shared button styling — use for <button> (via <Button/>) and for
    navigation controls that must render as <a>/<Link>. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = ""
): string {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
    );
  }
);
Button.displayName = "Button";

export default Button;
