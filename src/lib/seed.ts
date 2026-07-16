import type { Chip } from "./types";

interface ChipSeedInput {
  nome: string;
  numero: string;
  pin2: string;
  wpp: string;
  statusPrincipal: Chip["statusPrincipal"];
  statusAdicional: Chip["statusAdicional"];
  quedas: number;
  banimentos: number;
  dataAtivacaoDias: number;
  ultimaRecargaDias: number | null;
}

const CHIPS_SEED_INPUT: ChipSeedInput[] = [
  { nome: "Chip 1", numero: "11965469853", pin2: "0969", wpp: "WPP 1", statusPrincipal: "Ativo", statusAdicional: "Aquecimento", quedas: 0, banimentos: 0, dataAtivacaoDias: 0, ultimaRecargaDias: 0 },
  { nome: "Chip 2", numero: "11965438208", pin2: "1315", wpp: "WPP 2", statusPrincipal: "Inativo", statusAdicional: "Cadastrado", quedas: 0, banimentos: 0, dataAtivacaoDias: 0, ultimaRecargaDias: 0 },
  { nome: "Chip 3", numero: "11965176283", pin2: "7498", wpp: "WPP 3", statusPrincipal: "Inativo", statusAdicional: "Pendente de cadastro", quedas: 0, banimentos: 0, dataAtivacaoDias: 0, ultimaRecargaDias: 0 },
  { nome: "Chip 4", numero: "11967877583", pin2: "2597", wpp: "WPP 4", statusPrincipal: "Ativo", statusAdicional: "Em operação", quedas: 3, banimentos: 0, dataAtivacaoDias: 47, ultimaRecargaDias: 2 },
  { nome: "Chip 5", numero: "11967925075", pin2: "5219", wpp: "WPP 5", statusPrincipal: "Ativo", statusAdicional: "Aquecimento", quedas: 0, banimentos: 0, dataAtivacaoDias: 0, ultimaRecargaDias: 0 },
  { nome: "Chip 6", numero: "11968112983", pin2: "9452", wpp: "WPP 6", statusPrincipal: "Banido", statusAdicional: "Nenhum", quedas: 0, banimentos: 1, dataAtivacaoDias: 0, ultimaRecargaDias: 0 },
  { nome: "Chip 7", numero: "11980913832", pin2: "3063", wpp: "WPP 7", statusPrincipal: "Novo", statusAdicional: "Banimento temporário", quedas: 2, banimentos: 0, dataAtivacaoDias: 1, ultimaRecargaDias: 1 },
  { nome: "Chip 8", numero: "11981863727", pin2: "2327", wpp: "WPP 8", statusPrincipal: "Instável", statusAdicional: "Aguardando ativação", quedas: 0, banimentos: 0, dataAtivacaoDias: 0, ultimaRecargaDias: 0 },
  { nome: "Chip 10", numero: "11984926380", pin2: "2226", wpp: "WPP 10", statusPrincipal: "Novo", statusAdicional: "Banimento temporário", quedas: 1, banimentos: 0, dataAtivacaoDias: 1, ultimaRecargaDias: 1 },
  { nome: "CH1 (OLD)", numero: "11982508279", pin2: "0001", wpp: "WW1 (OLD)", statusPrincipal: "Ativo", statusAdicional: "Em operação", quedas: 2, banimentos: 0, dataAtivacaoDias: 150, ultimaRecargaDias: null },
];

function gerarId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function diasAtras(dias: number | null): string | undefined {
  if (dias === null) return undefined;
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data.toISOString();
}

export function criarChipsSeed(): Chip[] {
  const agora = new Date().toISOString();
  return CHIPS_SEED_INPUT.map((input) => {
    const dataAtivacao = diasAtras(input.dataAtivacaoDias);
    return {
      id: gerarId(),
      nome: input.nome,
      numero: input.numero,
      pin2: input.pin2,
      wpp: input.wpp,
      statusPrincipal: input.statusPrincipal,
      statusAdicional: input.statusAdicional,
      localizacao: "",
      dataAtivacao,
      inicioAquecimento: input.statusAdicional === "Aquecimento" ? dataAtivacao : undefined,
      metaDiasAquecimento: 21,
      ultimaRecarga: diasAtras(input.ultimaRecargaDias),
      quedas: input.quedas,
      banimentos: input.banimentos,
      responsavel: "",
      operacaoVinculada: "",
      observacoes: "",
      historicoStatus: [
        {
          id: gerarId(),
          data: agora,
          statusPrincipal: input.statusPrincipal,
          statusAdicional: input.statusAdicional,
        },
      ],
      recargas: [],
      historicoBanimentos: [],
      criadoEm: agora,
      atualizadoEm: agora,
    };
  });
}

/**
 * Atualiza (por número) ou adiciona os chips de recuperação a uma lista existente,
 * sem apagar nenhum chip que já esteja lá. Usado pelo botão "Restaurar chips padrão".
 */
export function sincronizarChipsSeed(chipsAtuais: Chip[]): { chips: Chip[]; adicionados: number; atualizados: number } {
  const agora = new Date().toISOString();
  const chipsFinal = [...chipsAtuais];
  let adicionados = 0;
  let atualizados = 0;

  for (const input of CHIPS_SEED_INPUT) {
    const dataAtivacao = diasAtras(input.dataAtivacaoDias);
    const ultimaRecarga = diasAtras(input.ultimaRecargaDias);
    const idx = chipsFinal.findIndex((c) => c.numero === input.numero);

    if (idx >= 0) {
      const atual = chipsFinal[idx];
      chipsFinal[idx] = {
        ...atual,
        nome: input.nome,
        pin2: input.pin2,
        wpp: input.wpp,
        statusPrincipal: input.statusPrincipal,
        statusAdicional: input.statusAdicional,
        quedas: input.quedas,
        banimentos: input.banimentos,
        dataAtivacao,
        ultimaRecarga,
        atualizadoEm: agora,
      };
      atualizados++;
    } else {
      chipsFinal.push({
        id: gerarId(),
        nome: input.nome,
        numero: input.numero,
        pin2: input.pin2,
        wpp: input.wpp,
        statusPrincipal: input.statusPrincipal,
        statusAdicional: input.statusAdicional,
        localizacao: "",
        dataAtivacao,
        inicioAquecimento: input.statusAdicional === "Aquecimento" ? dataAtivacao : undefined,
        metaDiasAquecimento: 21,
        ultimaRecarga,
        quedas: input.quedas,
        banimentos: input.banimentos,
        responsavel: "",
        operacaoVinculada: "",
        observacoes: "",
        historicoStatus: [
          {
            id: gerarId(),
            data: agora,
            statusPrincipal: input.statusPrincipal,
            statusAdicional: input.statusAdicional,
          },
        ],
        recargas: [],
        historicoBanimentos: [],
        criadoEm: agora,
        atualizadoEm: agora,
      });
      adicionados++;
    }
  }

  return { chips: chipsFinal, adicionados, atualizados };
}
