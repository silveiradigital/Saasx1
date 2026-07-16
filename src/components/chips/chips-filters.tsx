"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type FiltroRapido =
  | "todos"
  | "ativos"
  | "aquecendo"
  | "aquecidos"
  | "banidos"
  | "instaveis"
  | "sem-recarga";

const OPCOES: { valor: FiltroRapido; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "ativos", label: "Ativos" },
  { valor: "aquecendo", label: "Aquecendo" },
  { valor: "aquecidos", label: "Aquecidos" },
  { valor: "banidos", label: "Banidos" },
  { valor: "instaveis", label: "Instáveis" },
  { valor: "sem-recarga", label: "Sem recarga" },
];

export function ChipsFilters({
  busca,
  onBuscaChange,
  filtro,
  onFiltroChange,
}: {
  busca: string;
  onBuscaChange: (v: string) => void;
  filtro: FiltroRapido;
  onFiltroChange: (f: FiltroRapido) => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, número ou WPP..."
          className="pl-9"
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit">
        {OPCOES.map((op) => (
          <button
            key={op.valor}
            onClick={() => onFiltroChange(op.valor)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filtro === op.valor
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}
