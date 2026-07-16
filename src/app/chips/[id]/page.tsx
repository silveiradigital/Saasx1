"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Zap } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { ChipFormDialog } from "@/components/chips/chip-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { diasAquecidos, diasAtivo, progressoAquecimento, diasSemRecarga, proximaRecargaRecomendada } from "@/lib/calculations";
import { formatarData, formatarMoeda } from "@/lib/format";

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{valor || "—"}</p>
    </div>
  );
}

export default function ChipDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hidratado = useAppStore((s) => s.hidratado);
  const chip = useAppStore((s) => s.chips.find((c) => c.id === params.id));
  const vendas = useAppStore((s) => s.vendas);
  const configuracoes = useAppStore((s) => s.configuracoes);
  const registrarRecarga = useAppStore((s) => s.registrarRecarga);
  const removerChip = useAppStore((s) => s.removerChip);

  const [editando, setEditando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const receita = useMemo(
    () =>
      chip
        ? vendas
            .filter((v) => v.chipId === chip.id)
            .reduce((acc, v) => acc + v.valorRecebido - v.reembolso, 0)
        : 0,
    [vendas, chip],
  );

  if (!hidratado) {
    return (
      <PageContainer>
        <div className="h-96 animate-pulse rounded-2xl bg-card/40" />
      </PageContainer>
    );
  }

  if (!chip) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">Chip não encontrado.</p>
        <Link href="/chips" className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="size-4" /> Voltar para chips
        </Link>
      </PageContainer>
    );
  }

  const dias = diasAquecidos(chip);
  const progresso = progressoAquecimento(chip);
  const semRecarga = diasSemRecarga(chip);
  const proxima = proximaRecargaRecomendada(chip, configuracoes.diasAlertaRecarga);
  const ativo = diasAtivo(chip);

  return (
    <PageContainer>
      <Link href="/chips" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{chip.nome}</h1>
            <StatusBadge statusPrincipal={chip.statusPrincipal} statusAdicional={chip.statusAdicional} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{chip.numero}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              registrarRecarga(chip.id);
              toast.success("Recarga registrada.");
            }}
          >
            <Zap className="size-4" />
            Recarga
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setEditando(true)}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setExcluindo(true)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-medium">Informações</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Campo label="PIN 2" valor={chip.pin2} />
            <Campo label="WPP vinculado" valor={chip.wpp} />
            <Campo label="Localização" valor={chip.localizacao ?? ""} />
            <Campo label="Responsável" valor={chip.responsavel ?? ""} />
            <Campo label="Operação vinculada" valor={chip.operacaoVinculada ?? ""} />
            <Campo label="Data de ativação" valor={formatarData(chip.dataAtivacao)} />
            <Campo label="Dias ativo" valor={ativo === null ? "—" : `${ativo} dia${ativo === 1 ? "" : "s"}`} />
            <Campo label="Quedas" valor={String(chip.quedas)} />
            <Campo label="Banimentos" valor={String(chip.banimentos)} />
            <Campo label="Receita gerada" valor={formatarMoeda(receita)} />
          </div>
          {chip.observacoes && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Observações</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{chip.observacoes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-medium">Aquecimento</h3>
            <p className="text-2xl font-semibold">{dias === null ? "—" : `${dias} dias`}</p>
            <p className="mb-2 text-xs text-muted-foreground">Meta: {chip.metaDiasAquecimento} dias</p>
            <Progress value={progresso ?? 0} />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-medium">Recarga</h3>
            <p className="text-2xl font-semibold">
              {semRecarga === null ? "—" : `${semRecarga} dia${semRecarga === 1 ? "" : "s"} sem recarga`}
            </p>
            <p className="text-xs text-muted-foreground">Última: {formatarData(chip.ultimaRecarga)}</p>
            <p className="text-xs text-muted-foreground">Próxima recomendada: {formatarData(proxima)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-medium">Histórico de status</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {[...chip.historicoStatus].reverse().map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
                <span>
                  {h.statusPrincipal}
                  {h.statusAdicional !== "Nenhum" ? ` · ${h.statusAdicional}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">{formatarData(h.data)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-medium">Recargas</h3>
          {chip.recargas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma recarga registrada.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {[...chip.recargas].reverse().map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
                  <span>{r.observacao || "Recarga"}</span>
                  <span className="text-xs text-muted-foreground">{formatarData(r.data)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-medium">Banimentos</h3>
          {chip.historicoBanimentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum banimento registrado.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {[...chip.historicoBanimentos].reverse().map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
                  <span>{b.motivo || "Banimento"}</span>
                  <span className="text-xs text-muted-foreground">{formatarData(b.data)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ChipFormDialog chip={chip} open={editando} onOpenChange={setEditando} />
      <ConfirmDialog
        open={excluindo}
        onOpenChange={setExcluindo}
        title="Excluir chip"
        description={`Tem certeza que deseja excluir "${chip.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          removerChip(chip.id);
          toast.success("Chip excluído.");
          router.push("/chips");
        }}
      />
    </PageContainer>
  );
}
