"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Info, AlertCircle, OctagonAlert } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/kpi-card";
import { useAppStore } from "@/lib/store/app-store";
import { gerarAlertas } from "@/lib/alerts";
import { formatarDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NivelAlerta } from "@/lib/types";

const NIVEIS: { valor: NivelAlerta | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "Crítico", label: "Crítico" },
  { valor: "Importante", label: "Importante" },
  { valor: "Atenção", label: "Atenção" },
  { valor: "Informativo", label: "Informativo" },
];

const CONFIG_NIVEL: Record<NivelAlerta, { icon: typeof Info; classes: string }> = {
  Crítico: {
    icon: OctagonAlert,
    classes: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  },
  Importante: {
    icon: AlertTriangle,
    classes:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  Atenção: {
    icon: AlertCircle,
    classes: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  },
  Informativo: {
    icon: Info,
    classes:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
  },
};

export default function AlertasPage() {
  const hidratado = useAppStore((s) => s.hidratado);
  const chips = useAppStore((s) => s.chips);
  const vendas = useAppStore((s) => s.vendas);
  const despesas = useAppStore((s) => s.despesas);
  const metaAds = useAppStore((s) => s.metaAds);
  const metas = useAppStore((s) => s.metas);
  const configuracoes = useAppStore((s) => s.configuracoes);

  const [filtro, setFiltro] = useState<NivelAlerta | "todos">("todos");

  const alertas = useMemo(
    () => gerarAlertas(chips, vendas, despesas, metaAds, metas, configuracoes),
    [chips, vendas, despesas, metaAds, metas, configuracoes],
  );

  const alertasFiltrados = filtro === "todos" ? alertas : alertas.filter((a) => a.nivel === filtro);

  if (!hidratado) {
    return (
      <PageContainer>
        <div className="h-96 animate-pulse rounded-2xl bg-card/40" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Alertas" description="Pontos de atenção gerados automaticamente pela operação" />

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit">
        {NIVEIS.map((n) => (
          <button
            key={n.valor}
            onClick={() => setFiltro(n.valor)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filtro === n.valor ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {n.label}
            {n.valor !== "todos" && (
              <span className="ml-1 opacity-70">({alertas.filter((a) => a.nivel === n.valor).length})</span>
            )}
          </button>
        ))}
      </div>

      {alertasFiltrados.length === 0 ? (
        <EmptyState title="Nenhum alerta" description="Tudo certo por aqui. Novos alertas aparecem automaticamente." />
      ) : (
        <div className="flex flex-col gap-3">
          {alertasFiltrados.map((alerta) => {
            const { icon: Icon, classes } = CONFIG_NIVEL[alerta.nivel];
            return (
              <div
                key={alerta.id}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border", classes)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{alerta.titulo}</p>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium", classes)}>
                      {alerta.nivel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{alerta.descricao}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatarDataHora(alerta.data)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
