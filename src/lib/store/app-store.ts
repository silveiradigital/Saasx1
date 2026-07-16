import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Chip,
  ContingenciaItem,
  Venda,
  Despesa,
  MetaAdsEntry,
  MetaMensal,
  Configuracoes,
} from "../types";
import { criarChipsSeed, sincronizarChipsSeed } from "../seed";

function gerarId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const CONFIGURACOES_PADRAO: Configuracoes = {
  nomeNegocio: "Controle X1",
  diasPadraoAquecimento: 21,
  diasAlertaRecarga: 30,
  notificacoesAtivas: true,
  notificarCritico: true,
  notificarImportante: true,
  notificarAtencao: true,
  notificarInformativo: false,
};

interface AppState {
  chips: Chip[];
  contingencia: ContingenciaItem[];
  vendas: Venda[];
  despesas: Despesa[];
  metaAds: MetaAdsEntry[];
  metas: MetaMensal[];
  configuracoes: Configuracoes;
  hidratado: boolean;

  adicionarChip: (chip: Omit<Chip, "id" | "criadoEm" | "atualizadoEm" | "historicoStatus" | "recargas" | "historicoBanimentos">) => void;
  atualizarChip: (id: string, patch: Partial<Chip>) => void;
  removerChip: (id: string) => void;
  registrarRecarga: (chipId: string, observacao?: string) => void;
  registrarBanimento: (chipId: string, motivo?: string) => void;
  restaurarChipsPadrao: () => { adicionados: number; atualizados: number };

  adicionarContingencia: (item: Omit<ContingenciaItem, "id" | "criadoEm" | "atualizadoEm">) => void;
  atualizarContingencia: (id: string, patch: Partial<ContingenciaItem>) => void;
  removerContingencia: (id: string) => void;

  adicionarVenda: (venda: Omit<Venda, "id" | "criadoEm" | "atualizadoEm">) => void;
  atualizarVenda: (id: string, patch: Partial<Venda>) => void;
  removerVenda: (id: string) => void;

  adicionarDespesa: (despesa: Omit<Despesa, "id" | "criadoEm" | "atualizadoEm">) => void;
  atualizarDespesa: (id: string, patch: Partial<Despesa>) => void;
  removerDespesa: (id: string) => void;

  adicionarMetaAds: (entry: Omit<MetaAdsEntry, "id" | "criadoEm">) => void;
  atualizarMetaAds: (id: string, patch: Partial<Omit<MetaAdsEntry, "id" | "criadoEm">>) => void;
  removerMetaAds: (id: string) => void;

  definirMetaMensal: (meta: Omit<MetaMensal, "id">) => void;

  atualizarConfiguracoes: (patch: Partial<Configuracoes>) => void;

  apagarTodosOsDados: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      chips: [],
      contingencia: [],
      vendas: [],
      despesas: [],
      metaAds: [],
      metas: [],
      configuracoes: CONFIGURACOES_PADRAO,
      hidratado: false,

      adicionarChip: (chip) =>
        set((state) => {
          const agora = new Date().toISOString();
          const novo: Chip = {
            ...chip,
            id: gerarId(),
            historicoStatus: [
              {
                id: gerarId(),
                data: agora,
                statusPrincipal: chip.statusPrincipal,
                statusAdicional: chip.statusAdicional,
              },
            ],
            recargas: [],
            historicoBanimentos: [],
            criadoEm: agora,
            atualizadoEm: agora,
          };
          return { chips: [...state.chips, novo] };
        }),

      atualizarChip: (id, patch) =>
        set((state) => ({
          chips: state.chips.map((c) => {
            if (c.id !== id) return c;
            const agora = new Date().toISOString();
            const statusMudou =
              (patch.statusPrincipal && patch.statusPrincipal !== c.statusPrincipal) ||
              (patch.statusAdicional && patch.statusAdicional !== c.statusAdicional);
            const historicoStatus = statusMudou
              ? [
                  ...c.historicoStatus,
                  {
                    id: gerarId(),
                    data: agora,
                    statusPrincipal: patch.statusPrincipal ?? c.statusPrincipal,
                    statusAdicional: patch.statusAdicional ?? c.statusAdicional,
                  },
                ]
              : c.historicoStatus;
            return { ...c, ...patch, historicoStatus, atualizadoEm: agora };
          }),
        })),

      removerChip: (id) =>
        set((state) => ({ chips: state.chips.filter((c) => c.id !== id) })),

      restaurarChipsPadrao: () => {
        let resultado = { adicionados: 0, atualizados: 0 };
        set((state) => {
          const { chips, adicionados, atualizados } = sincronizarChipsSeed(state.chips);
          resultado = { adicionados, atualizados };
          return { chips };
        });
        return resultado;
      },

      registrarRecarga: (chipId, observacao) =>
        set((state) => ({
          chips: state.chips.map((c) => {
            if (c.id !== chipId) return c;
            const agora = new Date().toISOString();
            return {
              ...c,
              ultimaRecarga: agora,
              atualizadoEm: agora,
              recargas: [...c.recargas, { id: gerarId(), data: agora, observacao }],
            };
          }),
        })),

      registrarBanimento: (chipId, motivo) =>
        set((state) => ({
          chips: state.chips.map((c) => {
            if (c.id !== chipId) return c;
            const agora = new Date().toISOString();
            return {
              ...c,
              statusPrincipal: "Banido",
              banimentos: c.banimentos + 1,
              atualizadoEm: agora,
              historicoBanimentos: [...c.historicoBanimentos, { id: gerarId(), data: agora, motivo }],
              historicoStatus: [
                ...c.historicoStatus,
                { id: gerarId(), data: agora, statusPrincipal: "Banido", statusAdicional: c.statusAdicional },
              ],
            };
          }),
        })),

      adicionarContingencia: (item) =>
        set((state) => {
          const agora = new Date().toISOString();
          return {
            contingencia: [
              ...state.contingencia,
              { ...item, id: gerarId(), criadoEm: agora, atualizadoEm: agora },
            ],
          };
        }),
      atualizarContingencia: (id, patch) =>
        set((state) => ({
          contingencia: state.contingencia.map((c) =>
            c.id === id ? { ...c, ...patch, atualizadoEm: new Date().toISOString() } : c,
          ),
        })),
      removerContingencia: (id) =>
        set((state) => ({ contingencia: state.contingencia.filter((c) => c.id !== id) })),

      adicionarVenda: (venda) =>
        set((state) => {
          const agora = new Date().toISOString();
          return {
            vendas: [...state.vendas, { ...venda, id: gerarId(), criadoEm: agora, atualizadoEm: agora }],
          };
        }),
      atualizarVenda: (id, patch) =>
        set((state) => ({
          vendas: state.vendas.map((v) =>
            v.id === id ? { ...v, ...patch, atualizadoEm: new Date().toISOString() } : v,
          ),
        })),
      removerVenda: (id) => set((state) => ({ vendas: state.vendas.filter((v) => v.id !== id) })),

      adicionarDespesa: (despesa) =>
        set((state) => {
          const agora = new Date().toISOString();
          return {
            despesas: [...state.despesas, { ...despesa, id: gerarId(), criadoEm: agora, atualizadoEm: agora }],
          };
        }),
      atualizarDespesa: (id, patch) =>
        set((state) => ({
          despesas: state.despesas.map((d) =>
            d.id === id ? { ...d, ...patch, atualizadoEm: new Date().toISOString() } : d,
          ),
        })),
      removerDespesa: (id) =>
        set((state) => ({ despesas: state.despesas.filter((d) => d.id !== id) })),

      adicionarMetaAds: (entry) =>
        set((state) => ({
          metaAds: [...state.metaAds, { ...entry, id: gerarId(), criadoEm: new Date().toISOString() }],
        })),
      atualizarMetaAds: (id, patch) =>
        set((state) => ({
          metaAds: state.metaAds.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removerMetaAds: (id) =>
        set((state) => ({ metaAds: state.metaAds.filter((m) => m.id !== id) })),

      definirMetaMensal: (meta) =>
        set((state) => {
          const existente = state.metas.find((m) => m.mesAno === meta.mesAno);
          if (existente) {
            return {
              metas: state.metas.map((m) => (m.mesAno === meta.mesAno ? { ...m, ...meta } : m)),
            };
          }
          return { metas: [...state.metas, { ...meta, id: gerarId() }] };
        }),

      atualizarConfiguracoes: (patch) =>
        set((state) => ({ configuracoes: { ...state.configuracoes, ...patch } })),

      apagarTodosOsDados: () =>
        set({
          chips: [],
          contingencia: [],
          vendas: [],
          despesas: [],
          metaAds: [],
          metas: [],
        }),
    }),
    {
      name: "controle-x1-data",
      merge: (persistedState, currentState) => {
        // primeira visita de sempre (sem nada no localStorage): popular com os dados de recuperação.
        // Se já existe estado persistido (mesmo com chips vazio), respeita a escolha do usuário,
        // por exemplo depois de "Apagar todos os dados".
        if (!persistedState) {
          return { ...currentState, chips: criarChipsSeed(), hidratado: true };
        }
        const persisted = persistedState as Partial<AppState>;
        return { ...currentState, ...persisted, hidratado: true };
      },
    },
  ),
);
