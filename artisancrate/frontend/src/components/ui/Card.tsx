import { HTMLAttributes, forwardRef } from "react";
import { cn } from "./Button";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden",
          !noPadding && "p-6",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export { Card };
