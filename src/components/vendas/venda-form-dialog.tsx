"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMAS_PAGAMENTO, type Venda, type FormaPagamento } from "@/lib/types";
import { useAppStore } from "@/lib/store/app-store";
import { paraInputDate } from "@/lib/format";

interface FormState {
  data: string;
  valorRecebido: string;
  produto: string;
  cliente: string;
  chipId: string;
  vendedor: string;
  origemLead: string;
  formaPagamento: FormaPagamento;
  taxas: string;
  reembolso: string;
  observacoes: string;
}

function estadoInicial(venda?: Venda): FormState {
  return {
    data: venda?.data ? paraInputDate(venda.data) : paraInputDate(new Date()),
    valorRecebido: String(venda?.valorRecebido ?? ""),
    produto: venda?.produto ?? "",
    cliente: venda?.cliente ?? "",
    chipId: venda?.chipId ?? "",
    vendedor: venda?.vendedor ?? "",
    origemLead: venda?.origemLead ?? "",
    formaPagamento: venda?.formaPagamento ?? "Pix",
    taxas: String(venda?.taxas ?? 0),
    reembolso: String(venda?.reembolso ?? 0),
    observacoes: venda?.observacoes ?? "",
  };
}

export function VendaFormDialog({
  venda,
  open,
  onOpenChange,
}: {
  venda?: Venda;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{venda ? "Editar venda" : "Nova venda"}</DialogTitle>
          <DialogDescription>
            {venda ? "Atualize os dados da venda." : "Registre uma nova venda."}
          </DialogDescription>
        </DialogHeader>
        {open && <VendaFormFields key={venda?.id ?? "nova"} venda={venda} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function VendaFormFields({
  venda,
  onOpenChange,
}: {
  venda?: Venda;
  onOpenChange: (open: boolean) => void;
}) {
  const adicionar = useAppStore((s) => s.adicionarVenda);
  const atualizar = useAppStore((s) => s.atualizarVenda);
  const chips = useAppStore((s) => s.chips);
  const [form, setForm] = useState<FormState>(() => estadoInicial(venda));

  function campo<K extends keyof FormState>(chave: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  function salvar() {
    if (!form.produto.trim() || !form.valorRecebido) {
      toast.error("Preencha ao menos o produto e o valor recebido.");
      return;
    }
    const payload = {
      data: form.data ? new Date(form.data).toISOString() : new Date().toISOString(),
      valorRecebido: parseFloat(form.valorRecebido) || 0,
      produto: form.produto.trim(),
      cliente: form.cliente.trim(),
      chipId: form.chipId || undefined,
      vendedor: form.vendedor.trim(),
      origemLead: form.origemLead.trim(),
      formaPagamento: form.formaPagamento,
      taxas: parseFloat(form.taxas) || 0,
      reembolso: parseFloat(form.reembolso) || 0,
      observacoes: form.observacoes.trim(),
    };
    if (venda) {
      atualizar(venda.id, payload);
      toast.success("Venda atualizada.");
    } else {
      adicionar(payload);
      toast.success("Venda registrada.");
    }
    onOpenChange(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="venda-data">Data</Label>
            <Input id="venda-data" type="date" value={form.data} onChange={(e) => campo("data", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="venda-valor">Valor recebido</Label>
            <Input
              id="venda-valor"
              type="number"
              step="0.01"
              value={form.valorRecebido}
              onChange={(e) => campo("valorRecebido", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="venda-produto">Produto</Label>
            <Input id="venda-produto" value={form.produto} onChange={(e) => campo("produto", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="venda-cliente">Cliente</Label>
            <Input id="venda-cliente" value={form.cliente} onChange={(e) => campo("cliente", e.target.value)} />
          </div>

          <div className="grid gap-1.5">
            <Label>Chip responsável</Label>
            <Select value={form.chipId || "none"} onValueChange={(v) => campo("chipId", !v || v === "none" ? "" : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {chips.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="venda-vendedor">Vendedor</Label>
            <Input id="venda-vendedor" value={form.vendedor} onChange={(e) => campo("vendedor", e.target.value)} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="venda-origem">Origem do lead</Label>
            <Input id="venda-origem" value={form.origemLead} onChange={(e) => campo("origemLead", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Forma de pagamento</Label>
            <Select value={form.formaPagamento} onValueChange={(v) => campo("formaPagamento", v as FormaPagamento)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGAMENTO.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="venda-taxas">Taxas</Label>
            <Input
              id="venda-taxas"
              type="number"
              step="0.01"
              value={form.taxas}
              onChange={(e) => campo("taxas", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="venda-reembolso">Reembolso</Label>
            <Input
              id="venda-reembolso"
              type="number"
              step="0.01"
              value={form.reembolso}
              onChange={(e) => campo("reembolso", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="venda-observacoes">Observações</Label>
            <Textarea
              id="venda-observacoes"
              rows={3}
              value={form.observacoes}
              onChange={(e) => campo("observacoes", e.target.value)}
            />
          </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={salvar}>{venda ? "Salvar alterações" : "Registrar venda"}</Button>
      </DialogFooter>
    </>
  );
}
