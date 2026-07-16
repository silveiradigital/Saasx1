"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { PeriodoFiltro } from "@/lib/types";
import { paraInputDate } from "@/lib/format";

const OPCOES: { valor: PeriodoFiltro; label: string }[] = [
  { valor: "hoje", label: "Hoje" },
  { valor: "7dias", label: "Últimos 7 dias" },
  { valor: "30dias", label: "Últimos 30 dias" },
  { valor: "mes", label: "Este mês" },
  { valor: "personalizado", label: "Personalizado" },
];

export function DateRangeFilter({
  periodo,
  onPeriodoChange,
  personalizado,
  onPersonalizadoChange,
}: {
  periodo: PeriodoFiltro;
  onPeriodoChange: (p: PeriodoFiltro) => void;
  personalizado: { inicio: Date; fim: Date };
  onPersonalizadoChange: (r: { inicio: Date; fim: Date }) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-card p-1">
        {OPCOES.map((op) => (
          <button
            key={op.valor}
            onClick={() => onPeriodoChange(op.valor)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              periodo === op.valor
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {op.label}
          </button>
        ))}
      </div>
      {periodo === "personalizado" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-auto"
            value={paraInputDate(personalizado.inicio)}
            onChange={(e) =>
              onPersonalizadoChange({ ...personalizado, inicio: new Date(e.target.value) })
            }
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="date"
            className="w-auto"
            value={paraInputDate(personalizado.fim)}
            onChange={(e) =>
              onPersonalizadoChange({ ...personalizado, fim: new Date(e.target.value) })
            }
          />
        </div>
      )}
    </div>
  );
}
