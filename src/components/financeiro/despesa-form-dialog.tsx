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
import { DESPESA_CATEGORIAS, type Despesa, type DespesaCategoria } from "@/lib/types";
import { useAppStore } from "@/lib/store/app-store";
import { paraInputDate } from "@/lib/format";

interface FormState {
  descricao: string;
  valor: string;
  categoria: DespesaCategoria;
  data: string;
  operacaoVinculada: string;
  observacoes: string;
}

function estadoInicial(despesa?: Despesa): FormState {
  return {
    descricao: despesa?.descricao ?? "",
    valor: String(despesa?.valor ?? ""),
    categoria: despesa?.categoria ?? "Outros",
    data: despesa?.data ? paraInputDate(despesa.data) : paraInputDate(new Date()),
    operacaoVinculada: despesa?.operacaoVinculada ?? "",
    observacoes: despesa?.observacoes ?? "",
  };
}

export function DespesaFormDialog({
  despesa,
  open,
  onOpenChange,
}: {
  despesa?: Despesa;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          <DialogDescription>
            {despesa ? "Atualize os dados da despesa." : "Registre uma nova despesa."}
          </DialogDescription>
        </DialogHeader>
        {open && <DespesaFormFields key={despesa?.id ?? "nova"} despesa={despesa} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function DespesaFormFields({
  despesa,
  onOpenChange,
}: {
  despesa?: Despesa;
  onOpenChange: (open: boolean) => void;
}) {
  const adicionar = useAppStore((s) => s.adicionarDespesa);
  const atualizar = useAppStore((s) => s.atualizarDespesa);
  const [form, setForm] = useState<FormState>(() => estadoInicial(despesa));

  function campo<K extends keyof FormState>(chave: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  function salvar() {
    if (!form.descricao.trim() || !form.valor) {
      toast.error("Preencha ao menos a descrição e o valor.");
      return;
    }
    const payload = {
      descricao: form.descricao.trim(),
      valor: parseFloat(form.valor) || 0,
      categoria: form.categoria,
      data: form.data ? new Date(form.data).toISOString() : new Date().toISOString(),
      operacaoVinculada: form.operacaoVinculada.trim(),
      observacoes: form.observacoes.trim(),
    };
    if (despesa) {
      atualizar(despesa.id, payload);
      toast.success("Despesa atualizada.");
    } else {
      adicionar(payload);
      toast.success("Despesa registrada.");
    }
    onOpenChange(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="despesa-descricao">Descrição</Label>
            <Input
              id="despesa-descricao"
              value={form.descricao}
              onChange={(e) => campo("descricao", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="despesa-valor">Valor</Label>
            <Input
              id="despesa-valor"
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => campo("valor", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="despesa-data">Data</Label>
            <Input id="despesa-data" type="date" value={form.data} onChange={(e) => campo("data", e.target.value)} />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Categoria</Label>
            <Select value={form.categoria} onValueChange={(v) => campo("categoria", v as DespesaCategoria)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {DESPESA_CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="despesa-operacao">Operação vinculada</Label>
            <Input
              id="despesa-operacao"
              value={form.operacaoVinculada}
              onChange={(e) => campo("operacaoVinculada", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="despesa-observacoes">Observações</Label>
            <Textarea
              id="despesa-observacoes"
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
        <Button onClick={salvar}>{despesa ? "Salvar alterações" : "Registrar despesa"}</Button>
      </DialogFooter>
    </>
  );
}
