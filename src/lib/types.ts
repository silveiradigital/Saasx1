export const STATUS_PRINCIPAL = [
  "Novo",
  "Em aquecimento",
  "Aquecido",
  "Ativo",
  "Em observação",
  "Instável",
  "Banido",
  "Em recuperação",
  "Inativo",
  "Descartado",
] as const;

export type StatusPrincipal = (typeof STATUS_PRINCIPAL)[number];

export const STATUS_ADICIONAL = [
  "Nenhum",
  "Aquecimento",
  "Em operação",
  "Aguardando ativação",
  "Pendente de cadastro",
  "Cadastrado",
  "Banimento temporário",
  "Teste",
  "Backup",
  "Recuperação",
] as const;

export type StatusAdicional = (typeof STATUS_ADICIONAL)[number];

export interface HistoricoStatus {
  id: string;
  data: string; // ISO
  statusPrincipal: StatusPrincipal;
  statusAdicional: StatusAdicional;
}

export interface RegistroRecarga {
  id: string;
  data: string; // ISO
  observacao?: string;
}

export interface RegistroBanimento {
  id: string;
  data: string; // ISO
  motivo?: string;
}

export interface Chip {
  id: string;
  nome: string;
  numero: string;
  pin2: string;
  wpp: string;
  statusPrincipal: StatusPrincipal;
  statusAdicional: StatusAdicional;
  localizacao?: string;
  dataAtivacao?: string; // ISO
  inicioAquecimento?: string; // ISO
  metaDiasAquecimento: number;
  ultimaRecarga?: string; // ISO
  quedas: number;
  banimentos: number;
  responsavel?: string;
  operacaoVinculada?: string;
  observacoes?: string;
  historicoStatus: HistoricoStatus[];
  recargas: RegistroRecarga[];
  historicoBanimentos: RegistroBanimento[];
  criadoEm: string;
  atualizadoEm: string;
}

export const CONTINGENCIA_TIPOS = [
  "Chip",
  "Número WhatsApp",
  "Dispositivo",
  "Perfil Facebook",
  "Business Manager",
  "Conta de anúncio",
  "Página",
  "Pixel",
  "Domínio",
  "Instagram",
  "Email",
] as const;

export type ContingenciaTipo = (typeof CONTINGENCIA_TIPOS)[number];

export const CONTINGENCIA_STATUS = ["Disponível", "Em uso", "Reservado", "Inativo"] as const;
export type ContingenciaStatus = (typeof CONTINGENCIA_STATUS)[number];

export interface ContingenciaItem {
  id: string;
  nome: string;
  tipo: ContingenciaTipo;
  identificador: string;
  status: ContingenciaStatus;
  responsavel?: string;
  dataAtivacao?: string;
  operacaoVinculada?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export const FORMAS_PAGAMENTO = [
  "Pix",
  "Cartão de crédito",
  "Cartão de débito",
  "Boleto",
  "Dinheiro",
  "Outro",
] as const;
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

export interface Venda {
  id: string;
  data: string; // ISO
  valorRecebido: number;
  produto: string;
  cliente?: string;
  chipId?: string;
  vendedor?: string;
  origemLead?: string;
  formaPagamento: FormaPagamento;
  taxas: number;
  reembolso: number;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export const DESPESA_CATEGORIAS = [
  "Tráfego pago",
  "Ferramentas",
  "Chips",
  "Recargas",
  "Funcionários",
  "Comissões",
  "Outros",
] as const;
export type DespesaCategoria = (typeof DESPESA_CATEGORIAS)[number];

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: DespesaCategoria;
  data: string; // ISO
  operacaoVinculada?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MetaAdsEntry {
  id: string;
  data: string; // ISO (day the ad data refers to)
  gasto: number;
  compras: number;
  conversas: number;
  custoPorCompra: number;
  custoPorConversa: number;
  valorConvertido: number;
  roas: number;
  ctr: number;
  cpm: number;
  criadoEm: string;
}

export interface MetaMensal {
  id: string;
  mesAno: string; // YYYY-MM
  faturamento: number;
  lucro: number;
  numeroVendas: number;
  limiteGastos: number;
}

export interface Configuracoes {
  nomeNegocio: string;
  diasPadraoAquecimento: number;
  diasAlertaRecarga: number;
  notificacoesAtivas: boolean;
  notificarCritico: boolean;
  notificarImportante: boolean;
  notificarAtencao: boolean;
  notificarInformativo: boolean;
}

export type NivelAlerta = "Informativo" | "Atenção" | "Importante" | "Crítico";

export interface Alerta {
  id: string;
  nivel: NivelAlerta;
  titulo: string;
  descricao: string;
  data: string; // ISO
  origem: "chip" | "vendas" | "financeiro";
  referenciaId?: string;
}

export type PeriodoFiltro = "hoje" | "7dias" | "30dias" | "mes" | "personalizado";
