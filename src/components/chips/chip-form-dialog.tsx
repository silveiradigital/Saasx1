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
import { STATUS_PRINCIPAL, STATUS_ADICIONAL, type Chip, type StatusPrincipal, type StatusAdicional } from "@/lib/types";
import { useAppStore } from "@/lib/store/app-store";
import { paraInputDate } from "@/lib/format";

interface FormState {
  nome: string;
  numero: string;
  pin2: string;
  wpp: string;
  statusPrincipal: StatusPrincipal;
  statusAdicional: StatusAdicional;
  localizacao: string;
  dataAtivacao: string;
  inicioAquecimento: string;
  metaDiasAquecimento: string;
  ultimaRecarga: string;
  quedas: string;
  banimentos: string;
  responsavel: string;
  operacaoVinculada: string;
  observacoes: string;
}

function estadoInicial(chip?: Chip): FormState {
  return {
    nome: chip?.nome ?? "",
    numero: chip?.numero ?? "",
    pin2: chip?.pin2 ?? "",
    wpp: chip?.wpp ?? "",
    statusPrincipal: chip?.statusPrincipal ?? "Novo",
    statusAdicional: chip?.statusAdicional ?? "Nenhum",
    localizacao: chip?.localizacao ?? "",
    dataAtivacao: paraInputDate(chip?.dataAtivacao),
    inicioAquecimento: paraInputDate(chip?.inicioAquecimento),
    metaDiasAquecimento: String(chip?.metaDiasAquecimento ?? 21),
    ultimaRecarga: paraInputDate(chip?.ultimaRecarga),
    quedas: String(chip?.quedas ?? 0),
    banimentos: String(chip?.banimentos ?? 0),
    responsavel: chip?.responsavel ?? "",
    operacaoVinculada: chip?.operacaoVinculada ?? "",
    observacoes: chip?.observacoes ?? "",
  };
}

export function ChipFormDialog({
  chip,
  open,
  onOpenChange,
}: {
  chip?: Chip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{chip ? "Editar chip" : "Novo chip"}</DialogTitle>
          <DialogDescription>
            {chip ? "Atualize as informações do chip." : "Preencha os dados para cadastrar um novo chip."}
          </DialogDescription>
        </DialogHeader>
        {open && <ChipFormFields key={chip?.id ?? "novo"} chip={chip} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function ChipFormFields({
  chip,
  onOpenChange,
}: {
  chip?: Chip;
  onOpenChange: (open: boolean) => void;
}) {
  const adicionarChip = useAppStore((s) => s.adicionarChip);
  const atualizarChip = useAppStore((s) => s.atualizarChip);
  const [form, setForm] = useState<FormState>(() => estadoInicial(chip));

  function campo<K extends keyof FormState>(chave: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  function salvar() {
    if (!form.nome.trim() || !form.numero.trim()) {
      toast.error("Preencha ao menos o nome e o número do chip.");
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      numero: form.numero.trim(),
      pin2: form.pin2.trim(),
      wpp: form.wpp.trim(),
      statusPrincipal: form.statusPrincipal,
      statusAdicional: form.statusAdicional,
      localizacao: form.localizacao.trim(),
      dataAtivacao: form.dataAtivacao ? new Date(form.dataAtivacao).toISOString() : undefined,
      inicioAquecimento: form.inicioAquecimento ? new Date(form.inicioAquecimento).toISOString() : undefined,
      metaDiasAquecimento: parseInt(form.metaDiasAquecimento, 10) || 0,
      ultimaRecarga: form.ultimaRecarga ? new Date(form.ultimaRecarga).toISOString() : undefined,
      quedas: parseInt(form.quedas, 10) || 0,
      banimentos: parseInt(form.banimentos, 10) || 0,
      responsavel: form.responsavel.trim(),
      operacaoVinculada: form.operacaoVinculada.trim(),
      observacoes: form.observacoes.trim(),
    };

    if (chip) {
      atualizarChip(chip.id, payload);
      toast.success("Chip atualizado.");
    } else {
      adicionarChip(payload);
      toast.success("Chip criado.");
    }
    onOpenChange(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="chip-nome">Nome</Label>
          <Input id="chip-nome" value={form.nome} onChange={(e) => campo("nome", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="chip-numero">Número</Label>
          <Input id="chip-numero" value={form.numero} onChange={(e) => campo("numero", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="chip-pin2">PIN 2</Label>
          <Input id="chip-pin2" value={form.pin2} onChange={(e) => campo("pin2", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="chip-wpp">WPP vinculado</Label>
          <Input id="chip-wpp" value={form.wpp} onChange={(e) => campo("wpp", e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <Label>Status principal</Label>
          <Select value={form.statusPrincipal} onValueChange={(v) => campo("statusPrincipal", v as StatusPrincipal)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_PRINCIPAL.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Status adicional</Label>
          <Select value={form.statusAdicional} onValueChange={(v) => campo("statusAdicional", v as StatusAdicional)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ADICIONAL.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="chip-localizacao">Localização</Label>
          <Input id="chip-localizacao" value={form.localizacao} onChange={(e) => campo("localizacao", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="chip-responsavel">Responsável</Label>
          <Input id="chip-responsavel" value={form.responsavel} onChange={(e) => campo("responsavel", e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="chip-data-ativacao">Data de ativação</Label>
          <Input
            id="chip-data-ativacao"
            type="date"
            value={form.dataAtivacao}
            onChange={(e) => campo("dataAtivacao", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="chip-inicio-aquecimento">Início do aquecimento</Label>
          <Input
            id="chip-inicio-aquecimento"
            type="date"
            value={form.inicioAquecimento}
            onChange={(e) => campo("inicioAquecimento", e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="chip-meta-aquecimento">Meta de dias de aquecimento</Label>
          <Input
            id="chip-meta-aquecimento"
            type="number"
            min={0}
            value={form.metaDiasAquecimento}
            onChange={(e) => campo("metaDiasAquecimento", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="chip-ultima-recarga">Última recarga</Label>
          <Input
            id="chip-ultima-recarga"
            type="date"
            value={form.ultimaRecarga}
            onChange={(e) => campo("ultimaRecarga", e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="chip-quedas">Quedas</Label>
          <Input id="chip-quedas" type="number" min={0} value={form.quedas} onChange={(e) => campo("quedas", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="chip-banimentos">Banimentos</Label>
          <Input
            id="chip-banimentos"
            type="number"
            min={0}
            value={form.banimentos}
            onChange={(e) => campo("banimentos", e.target.value)}
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="chip-operacao">Operação vinculada</Label>
          <Input
            id="chip-operacao"
            value={form.operacaoVinculada}
            onChange={(e) => campo("operacaoVinculada", e.target.value)}
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="chip-observacoes">Observações</Label>
          <Textarea
            id="chip-observacoes"
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
        <Button onClick={salvar}>{chip ? "Salvar alterações" : "Criar chip"}</Button>
      </DialogFooter>
    </>
  );
}
