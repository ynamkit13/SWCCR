import { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "coral" | "green" | "purple";
};

export function Badge({
  variant = "coral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
  const variants = {
    coral: "bg-coral text-white",
    green: "bg-primary text-white",
    purple: "bg-secondary text-foreground",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
