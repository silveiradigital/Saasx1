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
import { EmptyState } from "@/components/shared/kpi-card";
import type { Chip, Venda } from "@/lib/types";
import { formatarData, formatarMoeda } from "@/lib/format";

export function VendasTable({
  vendas,
  chips,
  onEditar,
  onExcluir,
}: {
  vendas: Venda[];
  chips: Chip[];
  onEditar: (venda: Venda) => void;
  onExcluir: (venda: Venda) => void;
}) {
  if (vendas.length === 0) {
    return <EmptyState title="Nenhuma venda registrada" description="Registre vendas para acompanhar faturamento e ticket médio." />;
  }

  const nomePorChip = new Map(chips.map((c) => [c.id, c.nome]));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Chip</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...vendas]
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>{formatarData(venda.data)}</TableCell>
                  <TableCell className="font-medium">{venda.produto}</TableCell>
                  <TableCell>{venda.cliente || "—"}</TableCell>
                  <TableCell>{venda.chipId ? nomePorChip.get(venda.chipId) ?? "—" : "—"}</TableCell>
                  <TableCell>{venda.formaPagamento}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarMoeda(venda.valorRecebido - venda.reembolso)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => onEditar(venda)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => onExcluir(venda)}
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
