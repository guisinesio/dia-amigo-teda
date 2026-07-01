import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card bg-paper border border-line shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}
