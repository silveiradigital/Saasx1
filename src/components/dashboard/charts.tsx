"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PontoFaturamentoLucro, PontoVendasPorDia, FatiaStatus, VendaPorChip } from "@/lib/dashboard-data";
import { corDoStatusPrincipal } from "@/lib/status";
import type { StatusPrincipal } from "@/lib/types";

const CORES_STATUS: Record<string, string> = {
  verde: "#10b981",
  vermelho: "#ef4444",
  ambar: "#f59e0b",
  cinza: "#a1a1aa",
  azul: "#3b82f6",
};

const configFaturamentoLucro: ChartConfig = {
  faturamento: { label: "Faturamento", color: "var(--chart-1)" },
  lucro: { label: "Lucro", color: "var(--chart-2)" },
};

export function FaturamentoLucroChart({ dados }: { dados: PontoFaturamentoLucro[] }) {
  return (
    <ChartContainer config={configFaturamentoLucro} className="aspect-auto h-72 w-full">
      <AreaChart data={dados} margin={{ left: 4, right: 4 }}>
        <defs>
          <linearGradient id="fillFaturamento" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-faturamento)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-faturamento)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillLucro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-lucro)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-lucro)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="faturamento"
          type="monotone"
          fill="url(#fillFaturamento)"
          stroke="var(--color-faturamento)"
          strokeWidth={2}
        />
        <Area
          dataKey="lucro"
          type="monotone"
          fill="url(#fillLucro)"
          stroke="var(--color-lucro)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

const configVendasPorDia: ChartConfig = {
  vendas: { label: "Vendas", color: "var(--chart-1)" },
};

export function VendasPorDiaChart({ dados }: { dados: PontoVendasPorDia[] }) {
  return (
    <ChartContainer config={configVendasPorDia} className="aspect-auto h-72 w-full">
      <BarChart data={dados} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="vendas" fill="var(--color-vendas)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

const configStatus: ChartConfig = {
  quantidade: { label: "Chips" },
};

export function StatusChipsChart({ dados }: { dados: FatiaStatus[] }) {
  return (
    <ChartContainer config={configStatus} className="aspect-auto h-72 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
        <Pie data={dados} dataKey="quantidade" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {dados.map((entrada, index) => (
            <Cell
              key={index}
              fill={CORES_STATUS[corDoStatusPrincipal(entrada.status as StatusPrincipal)]}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

const configVendasPorChip: ChartConfig = {
  total: { label: "Total", color: "var(--chart-3)" },
};

export function VendasPorChipChart({ dados }: { dados: VendaPorChip[] }) {
  return (
    <ChartContainer config={configVendasPorChip} className="aspect-auto h-72 w-full">
      <BarChart data={dados} layout="vertical" margin={{ left: 12, right: 12 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="chip"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
