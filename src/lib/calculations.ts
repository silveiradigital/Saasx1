import { differenceInCalendarDays, addDays, startOfDay, endOfDay, startOfMonth, subDays } from "date-fns";
import type { Chip, Venda, MetaAdsEntry, Despesa, PeriodoFiltro } from "./types";

export function diasAquecidos(chip: Chip, referencia: Date = new Date()): number | null {
  if (!chip.inicioAquecimento) return null;
  return Math.max(0, differenceInCalendarDays(referencia, new Date(chip.inicioAquecimento)));
}

export function progressoAquecimento(chip: Chip, referencia: Date = new Date()): number | null {
  const dias = diasAquecidos(chip, referencia);
  if (dias === null || !chip.metaDiasAquecimento) return null;
  return Math.min(100, Math.round((dias / chip.metaDiasAquecimento) * 100));
}

export function diasAtivo(chip: Chip, referencia: Date = new Date()): number | null {
  if (!chip.dataAtivacao) return null;
  return Math.max(0, differenceInCalendarDays(referencia, new Date(chip.dataAtivacao)));
}

export function diasSemRecarga(chip: Chip, referencia: Date = new Date()): number | null {
  if (!chip.ultimaRecarga) return null;
  return Math.max(0, differenceInCalendarDays(referencia, new Date(chip.ultimaRecarga)));
}

export function proximaRecargaRecomendada(
  chip: Chip,
  diasAlerta: number = 30,
): Date | null {
  if (!chip.ultimaRecarga) return null;
  return addDays(new Date(chip.ultimaRecarga), diasAlerta);
}

export function chipSemRecargaCritico(chip: Chip, diasLimite: number = 30): boolean {
  const dias = diasSemRecarga(chip);
  return dias !== null && dias > diasLimite;
}

export interface PeriodoRange {
  inicio: Date;
  fim: Date;
}

export function periodoParaRange(
  periodo: PeriodoFiltro,
  personalizado?: { inicio: Date; fim: Date },
  referencia: Date = new Date(),
): PeriodoRange {
  switch (periodo) {
    case "hoje":
      return { inicio: startOfDay(referencia), fim: endOfDay(referencia) };
    case "7dias":
      return { inicio: startOfDay(subDays(referencia, 6)), fim: endOfDay(referencia) };
    case "30dias":
      return { inicio: startOfDay(subDays(referencia, 29)), fim: endOfDay(referencia) };
    case "mes":
      return { inicio: startOfMonth(referencia), fim: endOfDay(referencia) };
    case "personalizado":
      if (personalizado) {
        return { inicio: startOfDay(personalizado.inicio), fim: endOfDay(personalizado.fim) };
      }
      return { inicio: startOfMonth(referencia), fim: endOfDay(referencia) };
  }
}

function dentroDoPeriodo(dataISO: string, periodo: PeriodoRange): boolean {
  const d = new Date(dataISO);
  return d >= periodo.inicio && d <= periodo.fim;
}

export interface KpisDashboard {
  faturamento: number;
  gastos: number;
  lucro: number;
  totalVendas: number;
  ticketMedio: number;
}

export function calcularKpis(
  vendas: Venda[],
  despesas: Despesa[],
  metaAds: MetaAdsEntry[],
  periodo: PeriodoRange,
): KpisDashboard {
  const vendasPeriodo = vendas.filter((v) => dentroDoPeriodo(v.data, periodo));
  const despesasPeriodo = despesas.filter((d) => dentroDoPeriodo(d.data, periodo));
  const metaAdsPeriodo = metaAds.filter((m) => dentroDoPeriodo(m.data, periodo));

  const faturamentoVendas = vendasPeriodo.reduce(
    (acc, v) => acc + v.valorRecebido - v.reembolso,
    0,
  );
  const faturamentoMetaAds = metaAdsPeriodo.reduce((acc, m) => acc + m.valorConvertido, 0);
  const faturamento = faturamentoVendas + faturamentoMetaAds;

  const gastosDespesas = despesasPeriodo.reduce((acc, d) => acc + d.valor, 0);
  const gastosMetaAds = metaAdsPeriodo.reduce((acc, m) => acc + m.gasto, 0);
  const gastos = gastosDespesas + gastosMetaAds;

  const lucro = faturamento - gastos;

  const totalVendas =
    vendasPeriodo.length + metaAdsPeriodo.reduce((acc, m) => acc + m.compras, 0);

  const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;

  return { faturamento, gastos, lucro, totalVendas, ticketMedio };
}

export function projecaoFimDoMes(
  valorAtual: number,
  dataReferencia: Date = new Date(),
): number {
  const dia = dataReferencia.getDate();
  const diasNoMes = new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth() + 1,
    0,
  ).getDate();
  if (dia === 0) return valorAtual;
  const mediaDiaria = valorAtual / dia;
  return mediaDiaria * diasNoMes;
}

export function mediaDiariaNecessaria(
  meta: number,
  valorAtual: number,
  dataReferencia: Date = new Date(),
): number {
  const diasNoMes = new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth() + 1,
    0,
  ).getDate();
  const diaAtual = dataReferencia.getDate();
  const diasRestantes = Math.max(1, diasNoMes - diaAtual);
  const restante = Math.max(0, meta - valorAtual);
  return restante / diasRestantes;
}
