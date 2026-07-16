"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/kpi-card";
import type { ContingenciaItem } from "@/lib/types";
import { formatarData } from "@/lib/format";
import { cn } from "@/lib/utils";

const CLASSES_STATUS: Record<string, string> = {
  Disponível:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  "Em uso":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Reservado:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Inativo:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
};

export function ContingenciaTable({
  itens,
  onEditar,
  onExcluir,
}: {
  itens: ContingenciaItem[];
  onEditar: (item: ContingenciaItem) => void;
  onExcluir: (item: ContingenciaItem) => void;
}) {
  if (itens.length === 0) {
    return (
      <EmptyState
        title="Nenhum ativo de contingência"
        description="Cadastre chips reserva, números, contas e outros ativos para contingência."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Identificador</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Ativação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell>{item.tipo}</TableCell>
                <TableCell className="font-mono text-xs">{item.identificador}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("border", CLASSES_STATUS[item.status])}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.responsavel || "—"}</TableCell>
                <TableCell>{formatarData(item.dataAtivacao)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => onEditar(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Excluir"
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      onClick={() => onExcluir(item)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
