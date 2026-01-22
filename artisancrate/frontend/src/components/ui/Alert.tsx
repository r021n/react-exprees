import { HTMLAttributes, forwardRef } from "react";
import { cn } from "./Button";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, children, ...props }, ref) => {
    const variants = {
      info: "bg-blue-50 text-blue-800 border-blue-200",
      success: "bg-green-50 text-green-800 border-green-200",
      warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
      error: "bg-red-50 text-red-800 border-red-200",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground pl-4",
          variants[variant],
          className,
        )}
        {...props}
      >
        {title && (
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    );
  },
);

Alert.displayName = "Alert";

export { Alert };
