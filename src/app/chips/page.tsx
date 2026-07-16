"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ChipsFilters, type FiltroRapido } from "@/components/chips/chips-filters";
import { ChipsTable } from "@/components/chips/chips-table";
import { ChipFormDialog } from "@/components/chips/chip-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { isAquecendo } from "@/lib/status";
import { chipSemRecargaCritico } from "@/lib/calculations";
import type { Chip } from "@/lib/types";

export default function ChipsPage() {
  const hidratado = useAppStore((s) => s.hidratado);
  const chips = useAppStore((s) => s.chips);
  const configuracoes = useAppStore((s) => s.configuracoes);
  const registrarRecarga = useAppStore((s) => s.registrarRecarga);
  const removerChip = useAppStore((s) => s.removerChip);
  const restaurarChipsPadrao = useAppStore((s) => s.restaurarChipsPadrao);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroRapido>("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [chipEditando, setChipEditando] = useState<Chip | undefined>(undefined);
  const [chipExcluindo, setChipExcluindo] = useState<Chip | undefined>(undefined);

  const chipsFiltrados = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase();
    return chips.filter((chip) => {
      if (buscaLower) {
        const alvo = `${chip.nome} ${chip.numero} ${chip.wpp}`.toLowerCase();
        if (!alvo.includes(buscaLower)) return false;
      }
      switch (filtro) {
        case "ativos":
          return chip.statusPrincipal === "Ativo";
        case "aquecendo":
          return isAquecendo(chip);
        case "aquecidos":
          return chip.statusPrincipal === "Aquecido";
        case "banidos":
          return chip.statusPrincipal === "Banido";
        case "instaveis":
          return chip.statusPrincipal === "Instável";
        case "sem-recarga":
          return chipSemRecargaCritico(chip, configuracoes.diasAlertaRecarga);
        default:
          return true;
      }
    });
  }, [chips, busca, filtro, configuracoes.diasAlertaRecarga]);

  function abrirNovo() {
    setChipEditando(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(chip: Chip) {
    setChipEditando(chip);
    setFormAberto(true);
  }

  function recarregar(chip: Chip) {
    registrarRecarga(chip.id);
    toast.success(`Recarga registrada para ${chip.nome}.`);
  }

  function restaurarPadrao() {
    const { adicionados, atualizados } = restaurarChipsPadrao();
    if (adicionados === 0 && atualizados === 0) {
      toast.info("Nenhum chip de recuperação para restaurar.");
    } else {
      const partes = [];
      if (adicionados > 0) partes.push(`${adicionados} adicionado(s)`);
      if (atualizados > 0) partes.push(`${atualizados} atualizado(s)`);
      toast.success(`Chips de recuperação: ${partes.join(", ")}.`);
    }
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
        title="Chips"
        description="Gerencie os chips, status de aquecimento e recargas"
        actions={
          <>
            <Button variant="outline" onClick={restaurarPadrao} className="gap-2">
              <RotateCcw className="size-4" />
              Restaurar chips padrão
            </Button>
            <Button onClick={abrirNovo} className="gap-2">
              <Plus className="size-4" />
              Novo chip
            </Button>
          </>
        }
      />

      <ChipsFilters busca={busca} onBuscaChange={setBusca} filtro={filtro} onFiltroChange={setFiltro} />

      <ChipsTable
        chips={chipsFiltrados}
        diasAlertaRecarga={configuracoes.diasAlertaRecarga}
        onRecarga={recarregar}
        onEditar={abrirEdicao}
        onExcluir={setChipExcluindo}
        acaoVazio={
          chips.length === 0 ? (
            <Button variant="outline" onClick={restaurarPadrao} className="gap-2">
              <RotateCcw className="size-4" />
              Restaurar chips padrão
            </Button>
          ) : undefined
        }
      />

      <ChipFormDialog chip={chipEditando} open={formAberto} onOpenChange={setFormAberto} />

      <ConfirmDialog
        open={!!chipExcluindo}
        onOpenChange={(v) => !v && setChipExcluindo(undefined)}
        title="Excluir chip"
        description={`Tem certeza que deseja excluir "${chipExcluindo?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          if (chipExcluindo) {
            removerChip(chipExcluindo.id);
            toast.success("Chip excluído.");
          }
        }}
      />
    </PageContainer>
  );
}
