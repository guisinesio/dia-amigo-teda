import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "brand" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  neutral: "bg-mist text-ink-soft",
  brand: "bg-brand-soft text-brand-dark",
  accent: "bg-accent-soft text-accent",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
