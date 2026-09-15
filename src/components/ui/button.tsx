"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-[0_12px_30px_rgba(232,89,12,.20)] hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_16px_36px_rgba(232,89,12,.26)] active:translate-y-0",
        secondary: "bg-dark text-white shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-dark-800 hover:shadow-xl active:translate-y-0",
        outline: "border border-dark-200 bg-white/80 text-dark-800 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary-50 hover:text-primary active:translate-y-0",
        ghost: "text-dark-700 hover:bg-dark-50 hover:text-dark-900",
        link: "rounded-none p-0 text-primary underline-offset-4 hover:underline",
        destructive: "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:-translate-y-0.5 hover:bg-red-700",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-sm",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || isLoading} {...props}>
        {isLoading ? (
          <>
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-3 2.647z" />
            </svg>
            <span>Memproses...</span>
          </>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
