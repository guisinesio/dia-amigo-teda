import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-12 rounded-2xl border border-line bg-paper-soft px-4 text-[15px] text-ink",
            "placeholder:text-ink-faint outline-none transition-all duration-200",
            "focus:border-brand focus:bg-paper focus:ring-4 focus:ring-brand/10",
            error && "border-accent focus:border-accent focus:ring-accent/10",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-accent">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
