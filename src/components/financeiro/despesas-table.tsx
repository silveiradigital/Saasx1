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
import type { Despesa } from "@/lib/types";
import { formatarData, formatarMoeda } from "@/lib/format";

export function DespesasTable({
  despesas,
  onEditar,
  onExcluir,
}: {
  despesas: Despesa[];
  onEditar: (despesa: Despesa) => void;
  onExcluir: (despesa: Despesa) => void;
}) {
  if (despesas.length === 0) {
    return <EmptyState title="Nenhuma despesa registrada" description="Registre despesas para acompanhar os gastos da operação." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...despesas]
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell>{formatarData(despesa.data)}</TableCell>
                  <TableCell className="font-medium">{despesa.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{despesa.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                    {formatarMoeda(despesa.valor)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => onEditar(despesa)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => onExcluir(despesa)}
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
