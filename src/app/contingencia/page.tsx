"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ContingenciaTable } from "@/components/contingencia/contingencia-table";
import { ContingenciaFormDialog } from "@/components/contingencia/contingencia-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import type { ContingenciaItem } from "@/lib/types";

export default function ContingenciaPage() {
  const hidratado = useAppStore((s) => s.hidratado);
  const itens = useAppStore((s) => s.contingencia);
  const removerContingencia = useAppStore((s) => s.removerContingencia);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<ContingenciaItem | undefined>(undefined);
  const [excluindo, setExcluindo] = useState<ContingenciaItem | undefined>(undefined);

  function abrirNovo() {
    setEditando(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(item: ContingenciaItem) {
    setEditando(item);
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
        title="Contingência"
        description="Ativos reserva para manter a operação funcionando"
        actions={
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="size-4" />
            Novo ativo
          </Button>
        }
      />

      <ContingenciaTable itens={itens} onEditar={abrirEdicao} onExcluir={setExcluindo} />

      <ContingenciaFormDialog item={editando} open={formAberto} onOpenChange={setFormAberto} />

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(v) => !v && setExcluindo(undefined)}
        title="Excluir ativo"
        description={`Tem certeza que deseja excluir "${excluindo?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          if (excluindo) {
            removerContingencia(excluindo.id);
            toast.success("Ativo excluído.");
          }
        }}
      />
    </PageContainer>
  );
}
