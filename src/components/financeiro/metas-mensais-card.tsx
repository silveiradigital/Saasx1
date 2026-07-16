"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store/app-store";
import type { MetaMensal } from "@/lib/types";
import { calcularKpis, periodoParaRange, mediaDiariaNecessaria, projecaoFimDoMes } from "@/lib/calculations";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function mesAnoAtual(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{valor}</span>
    </div>
  );
}

export function MetasMensaisCard() {
  const vendas = useAppStore((s) => s.vendas);
  const despesas = useAppStore((s) => s.despesas);
  const metaAds = useAppStore((s) => s.metaAds);
  const metas = useAppStore((s) => s.metas);
  const definirMetaMensal = useAppStore((s) => s.definirMetaMensal);

  const mesAno = mesAnoAtual();
  const meta = metas.find((m) => m.mesAno === mesAno);

  const [editando, setEditando] = useState(false);

  const range = useMemo(() => periodoParaRange("mes"), []);
  const kpis = useMemo(() => calcularKpis(vendas, despesas, metaAds, range), [vendas, despesas, metaAds, range]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Target className="size-4" />
          Metas do mês
        </h3>
        <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
          {meta ? "Editar metas" : "Definir metas"}
        </Button>
      </div>

      {!meta ? (
        <p className="text-sm text-muted-foreground">Nenhuma meta definida para este mês ainda.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Faturamento</span>
              <span className="text-muted-foreground">
                {formatarMoeda(kpis.faturamento)} / {formatarMoeda(meta.faturamento)}
              </span>
            </div>
            <Progress value={meta.faturamento > 0 ? Math.min(100, (kpis.faturamento / meta.faturamento) * 100) : 0} />
            <Linha label="Restante" valor={formatarMoeda(Math.max(0, meta.faturamento - kpis.faturamento))} />
            <Linha label="Média diária necessária" valor={formatarMoeda(mediaDiariaNecessaria(meta.faturamento, kpis.faturamento))} />
            <Linha label="Projeção até fim do mês" valor={formatarMoeda(projecaoFimDoMes(kpis.faturamento))} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Lucro</span>
              <span className="text-muted-foreground">
                {formatarMoeda(kpis.lucro)} / {formatarMoeda(meta.lucro)}
              </span>
            </div>
            <Progress value={meta.lucro > 0 ? Math.min(100, (kpis.lucro / meta.lucro) * 100) : 0} />
            <Linha label="Restante" valor={formatarMoeda(Math.max(0, meta.lucro - kpis.lucro))} />
            <Linha label="Projeção até fim do mês" valor={formatarMoeda(projecaoFimDoMes(kpis.lucro))} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Número de vendas</span>
              <span className="text-muted-foreground">
                {formatarNumero(kpis.totalVendas)} / {formatarNumero(meta.numeroVendas)}
              </span>
            </div>
            <Progress value={meta.numeroVendas > 0 ? Math.min(100, (kpis.totalVendas / meta.numeroVendas) * 100) : 0} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Limite de gastos</span>
              <span className={kpis.gastos > meta.limiteGastos ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                {formatarMoeda(kpis.gastos)} / {formatarMoeda(meta.limiteGastos)}
              </span>
            </div>
            <Progress value={meta.limiteGastos > 0 ? Math.min(100, (kpis.gastos / meta.limiteGastos) * 100) : 0} />
          </div>
        </div>
      )}

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Metas do mês</DialogTitle>
            <DialogDescription>Defina as metas mensais de faturamento, lucro, vendas e gastos.</DialogDescription>
          </DialogHeader>
          {editando && (
            <MetaMensalForm
              key={mesAno}
              mesAno={mesAno}
              meta={meta}
              onSalvar={definirMetaMensal}
              onFechar={() => setEditando(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaMensalForm({
  mesAno,
  meta,
  onSalvar,
  onFechar,
}: {
  mesAno: string;
  meta?: MetaMensal;
  onSalvar: (meta: Omit<MetaMensal, "id">) => void;
  onFechar: () => void;
}) {
  const [form, setForm] = useState({
    faturamento: String(meta?.faturamento ?? 0),
    lucro: String(meta?.lucro ?? 0),
    numeroVendas: String(meta?.numeroVendas ?? 0),
    limiteGastos: String(meta?.limiteGastos ?? 0),
  });

  function salvar() {
    onSalvar({
      mesAno,
      faturamento: parseFloat(form.faturamento) || 0,
      lucro: parseFloat(form.lucro) || 0,
      numeroVendas: parseInt(form.numeroVendas, 10) || 0,
      limiteGastos: parseFloat(form.limiteGastos) || 0,
    });
    toast.success("Metas do mês atualizadas.");
    onFechar();
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="meta-faturamento">Faturamento</Label>
          <Input
            id="meta-faturamento"
            type="number"
            step="0.01"
            value={form.faturamento}
            onChange={(e) => setForm((f) => ({ ...f, faturamento: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="meta-lucro">Lucro</Label>
          <Input
            id="meta-lucro"
            type="number"
            step="0.01"
            value={form.lucro}
            onChange={(e) => setForm((f) => ({ ...f, lucro: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="meta-vendas">Número de vendas</Label>
          <Input
            id="meta-vendas"
            type="number"
            value={form.numeroVendas}
            onChange={(e) => setForm((f) => ({ ...f, numeroVendas: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="meta-limite">Limite de gastos</Label>
          <Input
            id="meta-limite"
            type="number"
            step="0.01"
            value={form.limiteGastos}
            onChange={(e) => setForm((f) => ({ ...f, limiteGastos: e.target.value }))}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onFechar}>
          Cancelar
        </Button>
        <Button onClick={salvar}>Salvar metas</Button>
      </DialogFooter>
    </>
  );
}
