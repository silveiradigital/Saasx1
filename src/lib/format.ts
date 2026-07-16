import { format as formatDateFns } from "date-fns";
import { ptBR } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return currencyFormatter.format(valor || 0);
}

export function formatarData(data: string | Date | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  if (Number.isNaN(d.getTime())) return "—";
  return formatDateFns(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatarDataHora(data: string | Date | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  if (Number.isNaN(d.getTime())) return "—";
  return formatDateFns(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatarNumero(valor: number, casasDecimais = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor || 0);
}

export function formatarPercentual(valor: number, casasDecimais = 1): string {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor || 0)}%`;
}

export function paraInputDate(data: string | Date | null | undefined): string {
  if (!data) return "";
  const d = typeof data === "string" ? new Date(data) : data;
  if (Number.isNaN(d.getTime())) return "";
  return formatDateFns(d, "yyyy-MM-dd");
}
