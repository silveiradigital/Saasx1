import { cn } from "@/lib/utils";
import { CLASSES_COR_STATUS, corDoStatusPrincipal, statusCombinado } from "@/lib/status";
import type { StatusAdicional, StatusPrincipal } from "@/lib/types";

export function StatusBadge({
  statusPrincipal,
  statusAdicional,
  className,
}: {
  statusPrincipal: StatusPrincipal;
  statusAdicional: StatusAdicional;
  className?: string;
}) {
  const cor = corDoStatusPrincipal(statusPrincipal);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        CLASSES_COR_STATUS[cor],
        className,
      )}
    >
      {statusCombinado(statusPrincipal, statusAdicional)}
    </span>
  );
}
