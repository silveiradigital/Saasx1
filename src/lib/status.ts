import {
  STATUS_PRINCIPAL,
  STATUS_ADICIONAL,
  type StatusPrincipal,
  type StatusAdicional,
} from "./types";

const LEGACY_ADICIONAL_MAP: Record<string, StatusAdicional> = {
  ATIVAR: "Aguardando ativação",
  RODANDO: "Em operação",
  "BAN TEMP": "Banimento temporário",
  "PENDENTE DE CADASTRO": "Pendente de cadastro",
  CADASTRADO: "Cadastrado",
  AQUECIMENTO: "Aquecimento",
};

const LEGACY_PRINCIPAL_MAP: Record<string, StatusPrincipal> = {
  ATIVO: "Ativo",
  BANIDO: "Banido",
  NOVO: "Novo",
  INATIVO: "Inativo",
  INSTAVEL: "Instável",
  INSTÁVEL: "Instável",
};

export function normalizeStatusPrincipal(value: string | undefined | null): StatusPrincipal {
  if (!value) return "Novo";
  const trimmed = value.trim();
  const exact = STATUS_PRINCIPAL.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;
  const legacy = LEGACY_PRINCIPAL_MAP[trimmed.toUpperCase()];
  return legacy ?? "Novo";
}

export function normalizeStatusAdicional(value: string | undefined | null): StatusAdicional {
  if (!value) return "Nenhum";
  const trimmed = value.trim();
  const exact = STATUS_ADICIONAL.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;
  const legacy = LEGACY_ADICIONAL_MAP[trimmed.toUpperCase()];
  return legacy ?? "Nenhum";
}

export function statusCombinado(principal: StatusPrincipal, adicional: StatusAdicional): string {
  if (adicional === "Nenhum") return principal.toUpperCase();
  return `${principal.toUpperCase()} - ${adicional.toUpperCase()}`;
}

export type CorStatus = "verde" | "vermelho" | "ambar" | "cinza" | "azul";

export function corDoStatusPrincipal(status: StatusPrincipal): CorStatus {
  switch (status) {
    case "Ativo":
    case "Aquecido":
      return "verde";
    case "Banido":
    case "Descartado":
      return "vermelho";
    case "Em aquecimento":
    case "Novo":
      return "ambar";
    case "Instável":
    case "Em recuperação":
      return "ambar";
    case "Em observação":
      return "azul";
    case "Inativo":
    default:
      return "cinza";
  }
}

export const CLASSES_COR_STATUS: Record<CorStatus, string> = {
  verde:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  vermelho:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  ambar:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  cinza:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
  azul: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};

export function isAquecendo(chip: { statusPrincipal: StatusPrincipal; statusAdicional: StatusAdicional }): boolean {
  return chip.statusPrincipal === "Em aquecimento" || chip.statusAdicional === "Aquecimento";
}
