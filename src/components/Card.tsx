import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm bg-surface p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
