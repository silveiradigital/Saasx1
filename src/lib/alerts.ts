import type { Chip, Despesa, MetaMensal, Venda, Alerta, Configuracoes, MetaAdsEntry } from "./types";
import { diasSemRecarga, calcularKpis } from "./calculations";
import { isAquecendo } from "./status";

function inicioDoMes(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1);
}

export function gerarAlertas(
  chips: Chip[],
  vendas: Venda[],
  despesas: Despesa[],
  metaAds: MetaAdsEntry[],
  metas: MetaMensal[],
  config: Configuracoes,
): Alerta[] {
  const alertas: Alerta[] = [];
  const agora = new Date().toISOString();

  for (const chip of chips) {
    const dias = diasSemRecarga(chip);
    if (dias !== null && dias > config.diasAlertaRecarga && chip.statusPrincipal !== "Descartado" && chip.statusPrincipal !== "Banido") {
      alertas.push({
        id: `recarga-${chip.id}`,
        nivel: "Crítico",
        titulo: `${chip.nome} sem recarga há ${dias} dias`,
        descricao: `Última recarga há mais de ${config.diasAlertaRecarga} dias. Recarregue para evitar perda do número.`,
        data: agora,
        origem: "chip",
        referenciaId: chip.id,
      });
    }

    if (isAquecendo(chip) && chip.inicioAquecimento) {
      const dias2 = Math.floor(
        (Date.now() - new Date(chip.inicioAquecimento).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dias2 >= chip.metaDiasAquecimento) {
        alertas.push({
          id: `aquecimento-concluido-${chip.id}`,
          nivel: "Informativo",
          titulo: `${chip.nome} concluiu o aquecimento`,
          descricao: `Meta de ${chip.metaDiasAquecimento} dias de aquecimento atingida. Considere promover para Ativo.`,
          data: agora,
          origem: "chip",
          referenciaId: chip.id,
        });
      }
    }

    if (chip.statusPrincipal === "Banido") {
      alertas.push({
        id: `banido-${chip.id}`,
        nivel: "Importante",
        titulo: `${chip.nome} está banido`,
        descricao: "Chip banido. Avalie substituição ou recuperação.",
        data: agora,
        origem: "chip",
        referenciaId: chip.id,
      });
    }

    if (chip.banimentos >= 2) {
      alertas.push({
        id: `banimentos-repetidos-${chip.id}`,
        nivel: "Crítico",
        titulo: `${chip.nome} com banimentos repetidos`,
        descricao: `${chip.banimentos} banimentos registrados. Considere descartar este chip.`,
        data: agora,
        origem: "chip",
        referenciaId: chip.id,
      });
    }
  }

  const chipsAtivos = chips.filter((c) => c.statusPrincipal === "Ativo").length;
  if (chipsAtivos < 3) {
    alertas.push({
      id: "poucos-chips-ativos",
      nivel: "Atenção",
      titulo: "Poucos chips ativos",
      descricao: `Apenas ${chipsAtivos} chip(s) ativo(s) no momento. Considere ativar mais chips.`,
      data: agora,
      origem: "chip",
    });
  }

  const metaAtual = metas.find(
    (m) => m.mesAno === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  );
  if (metaAtual) {
    const kpis = calcularKpis(vendas, despesas, metaAds, { inicio: inicioDoMes(), fim: new Date() });
    const diaAtual = new Date().getDate();
    const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const progressoEsperado = diaAtual / diasNoMes;
    if (metaAtual.numeroVendas > 0 && kpis.totalVendas / metaAtual.numeroVendas < progressoEsperado - 0.1) {
      alertas.push({
        id: "meta-vendas-atrasada",
        nivel: "Importante",
        titulo: "Meta de vendas atrasada",
        descricao: `${kpis.totalVendas} de ${metaAtual.numeroVendas} vendas até agora, abaixo do ritmo esperado para o mês.`,
        data: agora,
        origem: "vendas",
      });
    }
    if (metaAtual.limiteGastos > 0 && kpis.gastos > metaAtual.limiteGastos) {
      alertas.push({
        id: "gastos-acima-limite",
        nivel: "Crítico",
        titulo: "Gastos acima do limite",
        descricao: `Gastos de ${kpis.gastos.toFixed(2)} ultrapassaram o limite mensal de ${metaAtual.limiteGastos.toFixed(2)}.`,
        data: agora,
        origem: "financeiro",
      });
    }
  }

  const ordemNivel: Record<Alerta["nivel"], number> = {
    Crítico: 0,
    Importante: 1,
    Atenção: 2,
    Informativo: 3,
  };
  return alertas.sort((a, b) => ordemNivel[a.nivel] - ordemNivel[b.nivel]);
}
