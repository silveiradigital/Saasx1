"use client";

import { useMemo, useState } from "react";
import { startOfMonth } from "date-fns";
import { DollarSign, TrendingUp, ShoppingCart, Receipt, Wallet, Smartphone, Flame, Ban, BatteryWarning } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { ImportMetaAdsDialog } from "@/components/dashboard/import-meta-ads-dialog";
import { MetaAdsImportsList } from "@/components/dashboard/meta-ads-imports-list";
import { ApagarDadosDialog } from "@/components/dashboard/apagar-dados-dialog";
import {
  FaturamentoLucroChart,
  VendasPorDiaChart,
  StatusChipsChart,
  VendasPorChipChart,
} from "@/components/dashboard/charts";
import { useAppStore } from "@/lib/store/app-store";
import { calcularKpis, periodoParaRange, chipSemRecargaCritico } from "@/lib/calculations";
import { serieFaturamentoLucro, serieVendasPorDia, distribuicaoStatusChips, vendasPorChip } from "@/lib/dashboard-data";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { isAquecendo } from "@/lib/status";
import type { PeriodoFiltro } from "@/lib/types";

export default function DashboardPage() {
  const hidratado = useAppStore((s) => s.hidratado);
  const chips = useAppStore((s) => s.chips);
  const vendas = useAppStore((s) => s.vendas);
  const despesas = useAppStore((s) => s.despesas);
  const metaAds = useAppStore((s) => s.metaAds);
  const configuracoes = useAppStore((s) => s.configuracoes);

  const [periodo, setPeriodo] = useState<PeriodoFiltro>("30dias");
  const [personalizado, setPersonalizado] = useState({ inicio: startOfMonth(new Date()), fim: new Date() });

  const range = useMemo(() => periodoParaRange(periodo, personalizado), [periodo, personalizado]);
  const rangeMes = useMemo(() => periodoParaRange("mes"), []);
  const rangeHoje = useMemo(() => periodoParaRange("hoje"), []);

  const kpis = useMemo(() => calcularKpis(vendas, despesas, metaAds, range), [vendas, despesas, metaAds, range]);
  const kpisMes = useMemo(() => calcularKpis(vendas, despesas, metaAds, rangeMes), [vendas, despesas, metaAds, rangeMes]);
  const kpisHoje = useMemo(() => calcularKpis(vendas, despesas, metaAds, rangeHoje), [vendas, despesas, metaAds, rangeHoje]);

  const chipsAtivos = chips.filter((c) => c.statusPrincipal === "Ativo").length;
  const chipsAquecendo = chips.filter(isAquecendo).length;
  const chipsBanidos = chips.filter((c) => c.statusPrincipal === "Banido").length;
  const chipsSemRecarga = chips.filter((c) => chipSemRecargaCritico(c, configuracoes.diasAlertaRecarga)).length;

  const serieFatLucro = useMemo(() => serieFaturamentoLucro(vendas, despesas, metaAds, range), [vendas, despesas, metaAds, range]);
  const serieVendas = useMemo(() => serieVendasPorDia(vendas, metaAds, range), [vendas, metaAds, range]);
  const statusChips = useMemo(() => distribuicaoStatusChips(chips), [chips]);
  const porChip = useMemo(() => vendasPorChip(vendas, chips).slice(0, 8), [vendas, chips]);

  if (!hidratado) {
    return (
      <PageContainer>
        <div className="h-96 animate-pulse rounded-2xl bg-card/40" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação, vendas e Meta Ads"
        actions={
          <>
            <ImportMetaAdsDialog />
            <ApagarDadosDialog />
          </>
        }
      />

      <div className="mb-6">
        <DateRangeFilter
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          personalizado={personalizado}
          onPersonalizadoChange={setPersonalizado}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Faturamento hoje" value={formatarMoeda(kpisHoje.faturamento)} icon={DollarSign} />
        <KpiCard label="Faturamento no mês" value={formatarMoeda(kpisMes.faturamento)} icon={TrendingUp} />
        <KpiCard
          label="Lucro no mês"
          value={formatarMoeda(kpisMes.lucro)}
          icon={Wallet}
          tone={kpisMes.lucro >= 0 ? "positive" : "negative"}
        />
        <KpiCard label="Total de vendas" value={formatarNumero(kpis.totalVendas)} icon={ShoppingCart} hint="No período selecionado" />
        <KpiCard label="Ticket médio" value={formatarMoeda(kpis.ticketMedio)} icon={Receipt} hint="No período selecionado" />
        <KpiCard label="Gastos" value={formatarMoeda(kpis.gastos)} icon={Receipt} tone="negative" hint="No período selecionado" />
        <KpiCard label="Chips ativos" value={formatarNumero(chipsAtivos)} icon={Smartphone} tone="positive" />
        <KpiCard label="Chips em aquecimento" value={formatarNumero(chipsAquecendo)} icon={Flame} tone="warning" />
        <KpiCard label="Chips banidos" value={formatarNumero(chipsBanidos)} icon={Ban} tone="negative" />
        <KpiCard label="Chips sem recarga" value={formatarNumero(chipsSemRecarga)} icon={BatteryWarning} tone={chipsSemRecarga > 0 ? "warning" : "default"} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium">Faturamento e lucro</h3>
          <FaturamentoLucroChart dados={serieFatLucro} />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium">Vendas por dia</h3>
          <VendasPorDiaChart dados={serieVendas} />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium">Status dos chips</h3>
          <StatusChipsChart dados={statusChips} />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium">Vendas por chip</h3>
          {porChip.length > 0 ? (
            <VendasPorChipChart dados={porChip} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              Nenhuma venda registrada ainda
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <MetaAdsImportsList />
      </div>
    </PageContainer>
  );
}
