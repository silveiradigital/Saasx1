import { eachDayOfInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Chip, Despesa, MetaAdsEntry, Venda } from "./types";
import type { PeriodoRange } from "./calculations";

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface PontoFaturamentoLucro {
  dia: string;
  faturamento: number;
  lucro: number;
}

export function serieFaturamentoLucro(
  vendas: Venda[],
  despesas: Despesa[],
  metaAds: MetaAdsEntry[],
  periodo: PeriodoRange,
): PontoFaturamentoLucro[] {
  const dias = eachDayOfInterval({ start: periodo.inicio, end: periodo.fim });
  return dias.map((dia) => {
    const vendasDia = vendas.filter((v) => mesmoDia(new Date(v.data), dia));
    const despesasDia = despesas.filter((d) => mesmoDia(new Date(d.data), dia));
    const metaAdsDia = metaAds.filter((m) => mesmoDia(new Date(m.data), dia));

    const faturamento =
      vendasDia.reduce((acc, v) => acc + v.valorRecebido - v.reembolso, 0) +
      metaAdsDia.reduce((acc, m) => acc + m.valorConvertido, 0);
    const gastos =
      despesasDia.reduce((acc, d) => acc + d.valor, 0) +
      metaAdsDia.reduce((acc, m) => acc + m.gasto, 0);

    return {
      dia: format(dia, "dd/MM", { locale: ptBR }),
      faturamento,
      lucro: faturamento - gastos,
    };
  });
}

export interface PontoVendasPorDia {
  dia: string;
  vendas: number;
}

export function serieVendasPorDia(
  vendas: Venda[],
  metaAds: MetaAdsEntry[],
  periodo: PeriodoRange,
): PontoVendasPorDia[] {
  const dias = eachDayOfInterval({ start: periodo.inicio, end: periodo.fim });
  return dias.map((dia) => {
    const vendasDia = vendas.filter((v) => mesmoDia(new Date(v.data), dia)).length;
    const comprasAds = metaAds
      .filter((m) => mesmoDia(new Date(m.data), dia))
      .reduce((acc, m) => acc + m.compras, 0);
    return { dia: format(dia, "dd/MM", { locale: ptBR }), vendas: vendasDia + comprasAds };
  });
}

export interface FatiaStatus {
  status: string;
  quantidade: number;
}

export function distribuicaoStatusChips(chips: Chip[]): FatiaStatus[] {
  const contagem = new Map<string, number>();
  for (const chip of chips) {
    contagem.set(chip.statusPrincipal, (contagem.get(chip.statusPrincipal) ?? 0) + 1);
  }
  return Array.from(contagem.entries()).map(([status, quantidade]) => ({ status, quantidade }));
}

export interface VendaPorChip {
  chip: string;
  total: number;
}

export function vendasPorChip(vendas: Venda[], chips: Chip[]): VendaPorChip[] {
  const nomePorId = new Map(chips.map((c) => [c.id, c.nome]));
  const totais = new Map<string, number>();
  for (const venda of vendas) {
    const nome = venda.chipId ? nomePorId.get(venda.chipId) ?? "Chip removido" : "Sem chip vinculado";
    totais.set(nome, (totais.get(nome) ?? 0) + venda.valorRecebido - venda.reembolso);
  }
  return Array.from(totais.entries())
    .map(([chip, total]) => ({ chip, total }))
    .sort((a, b) => b.total - a.total);
}
