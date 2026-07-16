"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/shared/kpi-card";
import { DespesasTable } from "@/components/financeiro/despesas-table";
import { DespesaFormDialog } from "@/components/financeiro/despesa-form-dialog";
import { MetasMensaisCard } from "@/components/financeiro/metas-mensais-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatarMoeda } from "@/lib/format";
import type { Despesa } from "@/lib/types";

export default function FinanceiroPage() {
  const hidratado = useAppStore((s) => s.hidratado);
  const despesas = useAppStore((s) => s.despesas);
  const removerDespesa = useAppStore((s) => s.removerDespesa);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Despesa | undefined>(undefined);
  const [excluindo, setExcluindo] = useState<Despesa | undefined>(undefined);

  const totalGastos = useMemo(() => despesas.reduce((acc, d) => acc + d.valor, 0), [despesas]);

  function abrirNovo() {
    setEditando(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(despesa: Despesa) {
    setEditando(despesa);
    setFormAberto(true);
  }

  if (!hidratado) {
    return (
      <PageContainer>
        <div className="h-96 animate-pulse rounded-2xl bg-card/40" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Financeiro"
        description="Despesas e metas mensais da operação"
        actions={
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="size-4" />
            Nova despesa
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Total de despesas" value={String(despesas.length)} />
        <KpiCard label="Gastos totais" value={formatarMoeda(totalGastos)} tone="negative" />
      </div>

      <div className="mb-6">
        <MetasMensaisCard />
      </div>

      <DespesasTable despesas={despesas} onEditar={abrirEdicao} onExcluir={setExcluindo} />

      <DespesaFormDialog despesa={editando} open={formAberto} onOpenChange={setFormAberto} />

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(v) => !v && setExcluindo(undefined)}
        title="Excluir despesa"
        description={`Tem certeza que deseja excluir "${excluindo?.descricao}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          if (excluindo) {
            removerDespesa(excluindo.id);
            toast.success("Despesa excluída.");
          }
        }}
      />
    </PageContainer>
  );
}
