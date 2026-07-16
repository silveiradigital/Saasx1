"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2, Zap, TriangleAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/kpi-card";
import type { Chip } from "@/lib/types";
import { diasAtivo, diasSemRecarga } from "@/lib/calculations";
import { formatarData } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ChipsTable({
  chips,
  diasAlertaRecarga,
  onRecarga,
  onEditar,
  onExcluir,
  acaoVazio,
}: {
  chips: Chip[];
  diasAlertaRecarga: number;
  onRecarga: (chip: Chip) => void;
  onEditar: (chip: Chip) => void;
  onExcluir: (chip: Chip) => void;
  acaoVazio?: React.ReactNode;
}) {
  if (chips.length === 0) {
    return (
      <EmptyState
        title="Nenhum chip encontrado"
        description="Ajuste os filtros ou cadastre um novo chip."
        action={acaoVazio}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chip</TableHead>
              <TableHead>PIN 2</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>WPP</TableHead>
              <TableHead>Operação</TableHead>
              <TableHead>Dias ativo</TableHead>
              <TableHead>Quedas</TableHead>
              <TableHead>Banimentos</TableHead>
              <TableHead>Recarga</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chips.map((chip) => {
              const dias = diasSemRecarga(chip);
              const critico = dias !== null && dias > diasAlertaRecarga;
              const ativo = diasAtivo(chip);
              return (
                <TableRow key={chip.id}>
                  <TableCell>
                    <div className="font-medium">{chip.nome}</div>
                    <div className="text-xs text-muted-foreground">{chip.numero}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{chip.pin2 || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge statusPrincipal={chip.statusPrincipal} statusAdicional={chip.statusAdicional} />
                  </TableCell>
                  <TableCell>{chip.wpp || "—"}</TableCell>
                  <TableCell>{chip.operacaoVinculada || "—"}</TableCell>
                  <TableCell>
                    <span className="text-sm">{ativo === null ? "—" : `${ativo} dia${ativo === 1 ? "" : "s"}`}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        chip.quedas > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
                      )}
                    >
                      {chip.quedas}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        chip.banimentos > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
                      )}
                    >
                      {chip.banimentos}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className={critico ? "flex items-center gap-1 text-red-600 dark:text-red-400" : ""}>
                      {critico && <TriangleAlert className="size-3.5" />}
                      <span className="text-sm">
                        {dias === null ? "Sem registro" : `${dias} dia${dias === 1 ? "" : "s"}`}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatarData(chip.ultimaRecarga)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ver"
                        nativeButton={false}
                        render={<Link href={`/chips/${chip.id}`} />}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Recarga" onClick={() => onRecarga(chip)}>
                        <Zap className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => onEditar(chip)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => onExcluir(chip)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
