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
import {
  CONTINGENCIA_TIPOS,
  CONTINGENCIA_STATUS,
  type ContingenciaItem,
  type ContingenciaTipo,
  type ContingenciaStatus,
} from "@/lib/types";
import { useAppStore } from "@/lib/store/app-store";
import { paraInputDate } from "@/lib/format";

interface FormState {
  nome: string;
  tipo: ContingenciaTipo;
  identificador: string;
  status: ContingenciaStatus;
  responsavel: string;
  dataAtivacao: string;
  operacaoVinculada: string;
  observacoes: string;
}

function estadoInicial(item?: ContingenciaItem): FormState {
  return {
    nome: item?.nome ?? "",
    tipo: item?.tipo ?? "Chip",
    identificador: item?.identificador ?? "",
    status: item?.status ?? "Disponível",
    responsavel: item?.responsavel ?? "",
    dataAtivacao: paraInputDate(item?.dataAtivacao),
    operacaoVinculada: item?.operacaoVinculada ?? "",
    observacoes: item?.observacoes ?? "",
  };
}

export function ContingenciaFormDialog({
  item,
  open,
  onOpenChange,
}: {
  item?: ContingenciaItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Editar ativo" : "Novo ativo de contingência"}</DialogTitle>
          <DialogDescription>
            {item ? "Atualize as informações do ativo." : "Preencha os dados do ativo de contingência."}
          </DialogDescription>
        </DialogHeader>
        {open && <ContingenciaFormFields key={item?.id ?? "novo"} item={item} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function ContingenciaFormFields({
  item,
  onOpenChange,
}: {
  item?: ContingenciaItem;
  onOpenChange: (open: boolean) => void;
}) {
  const adicionar = useAppStore((s) => s.adicionarContingencia);
  const atualizar = useAppStore((s) => s.atualizarContingencia);
  const [form, setForm] = useState<FormState>(() => estadoInicial(item));

  function campo<K extends keyof FormState>(chave: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  function salvar() {
    if (!form.nome.trim() || !form.identificador.trim()) {
      toast.error("Preencha ao menos o nome e o identificador.");
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      identificador: form.identificador.trim(),
      status: form.status,
      responsavel: form.responsavel.trim(),
      dataAtivacao: form.dataAtivacao ? new Date(form.dataAtivacao).toISOString() : undefined,
      operacaoVinculada: form.operacaoVinculada.trim(),
      observacoes: form.observacoes.trim(),
    };
    if (item) {
      atualizar(item.id, payload);
      toast.success("Ativo de contingência atualizado.");
    } else {
      adicionar(payload);
      toast.success("Ativo de contingência criado.");
    }
    onOpenChange(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="cont-nome">Nome</Label>
            <Input id="cont-nome" value={form.nome} onChange={(e) => campo("nome", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cont-identificador">Identificador</Label>
            <Input
              id="cont-identificador"
              value={form.identificador}
              onChange={(e) => campo("identificador", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => campo("tipo", v as ContingenciaTipo)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CONTINGENCIA_TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => campo("status", v as ContingenciaStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CONTINGENCIA_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cont-responsavel">Responsável</Label>
            <Input
              id="cont-responsavel"
              value={form.responsavel}
              onChange={(e) => campo("responsavel", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cont-data">Data de ativação</Label>
            <Input
              id="cont-data"
              type="date"
              value={form.dataAtivacao}
              onChange={(e) => campo("dataAtivacao", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="cont-operacao">Operação vinculada</Label>
            <Input
              id="cont-operacao"
              value={form.operacaoVinculada}
              onChange={(e) => campo("operacaoVinculada", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="cont-observacoes">Observações</Label>
            <Textarea
              id="cont-observacoes"
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
        <Button onClick={salvar}>{item ? "Salvar alterações" : "Criar ativo"}</Button>
      </DialogFooter>
    </>
  );
}
