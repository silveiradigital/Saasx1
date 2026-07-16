"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/shared/kpi-card";
import { VendasTable } from "@/components/vendas/vendas-table";
import { VendaFormDialog } from "@/components/vendas/venda-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatarMoeda } from "@/lib/format";
import type { Venda } from "@/lib/types";

export default function VendasPage() {
  const hidratado = useAppStore((s) => s.hidratado);
  const vendas = useAppStore((s) => s.vendas);
  const chips = useAppStore((s) => s.chips);
  const removerVenda = useAppStore((s) => s.removerVenda);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Venda | undefined>(undefined);
  const [excluindo, setExcluindo] = useState<Venda | undefined>(undefined);

  const faturamento = useMemo(
    () => vendas.reduce((acc, v) => acc + v.valorRecebido - v.reembolso, 0),
    [vendas],
  );
  const ticketMedio = vendas.length > 0 ? faturamento / vendas.length : 0;

  function abrirNovo() {
    setEditando(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(venda: Venda) {
    setEditando(venda);
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
        title="Vendas"
        description="Todas as vendas registradas"
        actions={
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="size-4" />
            Nova venda
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total de vendas" value={String(vendas.length)} />
        <KpiCard label="Faturamento total" value={formatarMoeda(faturamento)} tone="positive" />
        <KpiCard label="Ticket médio" value={formatarMoeda(ticketMedio)} />
      </div>

      <VendasTable vendas={vendas} chips={chips} onEditar={abrirEdicao} onExcluir={setExcluindo} />

      <VendaFormDialog venda={editando} open={formAberto} onOpenChange={setFormAberto} />

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(v) => !v && setExcluindo(undefined)}
        title="Excluir venda"
        description={`Tem certeza que deseja excluir a venda de "${excluindo?.produto}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          if (excluindo) {
            removerVenda(excluindo.id);
            toast.success("Venda excluída.");
          }
        }}
      />
    </PageContainer>
  );
}
