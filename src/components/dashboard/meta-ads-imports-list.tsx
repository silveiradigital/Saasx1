"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/kpi-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MetaAdsFormDialog } from "./import-meta-ads-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatarData, formatarMoeda, formatarNumero } from "@/lib/format";
import type { MetaAdsEntry } from "@/lib/types";

export function MetaAdsImportsList() {
  const metaAds = useAppStore((s) => s.metaAds);
  const removerMetaAds = useAppStore((s) => s.removerMetaAds);

  const [editando, setEditando] = useState<MetaAdsEntry | undefined>(undefined);
  const [formAberto, setFormAberto] = useState(false);
  const [excluindo, setExcluindo] = useState<MetaAdsEntry | undefined>(undefined);

  const ordenados = [...metaAds].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  function abrirEdicao(entry: MetaAdsEntry) {
    setEditando(entry);
    setFormAberto(true);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-medium">Importações Meta Ads</h3>

      {ordenados.length === 0 ? (
        <EmptyState
          title="Nenhuma importação ainda"
          description="Importe um print do Gerenciador de Anúncios para alimentar o dashboard."
        />
      ) : (
        <div className="flex flex-col divide-y divide-border/60">
          {ordenados.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{formatarData(entry.data)}</p>
                <p className="text-xs text-muted-foreground">
                  Gasto {formatarMoeda(entry.gasto)} · Compras {formatarNumero(entry.compras)} · Convertido{" "}
                  {formatarMoeda(entry.valorConvertido)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" title="Editar" onClick={() => abrirEdicao(entry)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Excluir"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  onClick={() => setExcluindo(entry)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MetaAdsFormDialog entry={editando} open={formAberto} onOpenChange={setFormAberto} />

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(v) => !v && setExcluindo(undefined)}
        title="Excluir importação"
        description={`Tem certeza que deseja excluir a importação de ${excluindo ? formatarData(excluindo.data) : ""}? Os valores serão removidos dos KPIs do dashboard.`}
        onConfirm={() => {
          if (excluindo) {
            removerMetaAds(excluindo.id);
            toast.success("Importação excluída.");
          }
        }}
      />
    </div>
  );
}
