import * as React from "react";
import { cn } from "@/lib/utils";
function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "destructive" | "outline" }) {
  const vars: Record<string, string> = {
    default: "bg-black text-white", success: "bg-green-100 text-green-800", warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800", outline: "border border-gray-300 text-gray-600",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", vars[variant], className)} {...props} />;
}
export { Badge };
