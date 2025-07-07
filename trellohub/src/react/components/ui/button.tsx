// src/components/ui/Button.tsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  variant = "default",
  size = "md",
  className,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";

  const base =
    "appearance-none rounded-lg font-medium flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 slate-100 text-white";

  const variants = {
    default:
      "slate-100 text-white hover:bg-neutral-800 focus:ring-white !slate-100 !text-white",
    ghost: "bg-transparent text-white hover:bg-white/10",
    outline: "border border-white text-white hover:bg-white/10",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};

export default Button;
