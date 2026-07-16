"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Moon, Sun, Monitor } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store/app-store";
import type { Configuracoes } from "@/lib/types";
import { cn } from "@/lib/utils";

const TEMAS = [
  { valor: "light", label: "Claro", icon: Sun },
  { valor: "dark", label: "Escuro", icon: Moon },
  { valor: "system", label: "Sistema", icon: Monitor },
];

export default function ConfiguracoesPage() {
  const hidratado = useAppStore((s) => s.hidratado);
  const configuracoes = useAppStore((s) => s.configuracoes);
  const atualizarConfiguracoes = useAppStore((s) => s.atualizarConfiguracoes);
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!hidratado) {
    return (
      <PageContainer>
        <div className="h-96 animate-pulse rounded-2xl bg-card/40" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Configurações" description="Preferências gerais do sistema" />

      <div className="flex flex-col gap-6">
        <GeralSettingsCard configuracoes={configuracoes} onSalvar={atualizarConfiguracoes} />

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium">Tema</h3>
          <div className="flex gap-2">
            {TEMAS.map((t) => {
              const Icon = t.icon;
              const ativo = resolvedTheme !== undefined && theme === t.valor;
              return (
                <button
                  key={t.valor}
                  onClick={() => setTheme(t.valor)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium">Notificações</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notificações ativas</p>
                <p className="text-xs text-muted-foreground">Liga ou desliga todos os alertas do sistema</p>
              </div>
              <Switch
                checked={configuracoes.notificacoesAtivas}
                onCheckedChange={(v) => atualizarConfiguracoes({ notificacoesAtivas: v })}
              />
            </div>
            {(
              [
                ["notificarCritico", "Crítico"],
                ["notificarImportante", "Importante"],
                ["notificarAtencao", "Atenção"],
                ["notificarInformativo", "Informativo"],
              ] as const
            ).map(([chave, label]) => (
              <div key={chave} className="flex items-center justify-between">
                <p className="text-sm">{label}</p>
                <Switch
                  disabled={!configuracoes.notificacoesAtivas}
                  checked={configuracoes[chave]}
                  onCheckedChange={(v) => atualizarConfiguracoes({ [chave]: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function GeralSettingsCard({
  configuracoes,
  onSalvar,
}: {
  configuracoes: Configuracoes;
  onSalvar: (patch: Partial<Configuracoes>) => void;
}) {
  const [form, setForm] = useState({
    nomeNegocio: configuracoes.nomeNegocio,
    diasPadraoAquecimento: String(configuracoes.diasPadraoAquecimento),
    diasAlertaRecarga: String(configuracoes.diasAlertaRecarga),
  });

  function salvarGerais() {
    onSalvar({
      nomeNegocio: form.nomeNegocio.trim() || "Controle X1",
      diasPadraoAquecimento: parseInt(form.diasPadraoAquecimento, 10) || 21,
      diasAlertaRecarga: parseInt(form.diasAlertaRecarga, 10) || 30,
    });
    toast.success("Configurações salvas.");
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-medium">Geral</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="cfg-nome">Nome do negócio</Label>
          <Input
            id="cfg-nome"
            value={form.nomeNegocio}
            onChange={(e) => setForm((f) => ({ ...f, nomeNegocio: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cfg-aquecimento">Dias padrão de aquecimento</Label>
          <Input
            id="cfg-aquecimento"
            type="number"
            min={0}
            value={form.diasPadraoAquecimento}
            onChange={(e) => setForm((f) => ({ ...f, diasPadraoAquecimento: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cfg-recarga">Dias para alerta de recarga</Label>
          <Input
            id="cfg-recarga"
            type="number"
            min={0}
            value={form.diasAlertaRecarga}
            onChange={(e) => setForm((f) => ({ ...f, diasAlertaRecarga: e.target.value }))}
          />
        </div>
      </div>
      <Button className="mt-4" onClick={salvarGerais}>
        Salvar alterações
      </Button>
    </div>
  );
}
