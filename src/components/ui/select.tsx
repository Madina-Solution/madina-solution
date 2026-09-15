"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
};

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: Props) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-label={ariaLabel}
        className="h-11 w-full appearance-none rounded-2xl border border-black/[0.08] bg-white/90 px-4 pr-10 text-sm font-medium text-dark-800 shadow-sm transition-all hover:border-black/[0.12] focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
    </div>
  );
}
