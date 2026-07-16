"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUp, Loader2, Upload, ChevronDown } from "lucide-react";
import { reconhecerImagemMetaAds, type MetaAdsCamposExtraidos } from "@/lib/ocr/meta-ads-parser";
import { useAppStore } from "@/lib/store/app-store";
import { paraInputDate } from "@/lib/format";
import type { MetaAdsEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormularioMetaAds = Required<MetaAdsCamposExtraidos>;

const FORMULARIO_VAZIO: FormularioMetaAds = {
  gasto: 0,
  compras: 0,
  conversas: 0,
  custoPorCompra: 0,
  custoPorConversa: 0,
  valorConvertido: 0,
  roas: 0,
  ctr: 0,
  cpm: 0,
};

const CAMPOS: { chave: keyof FormularioMetaAds; label: string; prefixo?: string; sufixo?: string }[] = [
  { chave: "gasto", label: "Gasto", prefixo: "R$" },
  { chave: "compras", label: "Compras" },
  { chave: "conversas", label: "Conversas" },
  { chave: "custoPorCompra", label: "Custo por compra", prefixo: "R$" },
  { chave: "custoPorConversa", label: "Custo por conversa", prefixo: "R$" },
  { chave: "valorConvertido", label: "Valor convertido", prefixo: "R$" },
  { chave: "roas", label: "ROAS" },
  { chave: "ctr", label: "CTR", sufixo: "%" },
  { chave: "cpm", label: "CPM", prefixo: "R$" },
];

function estadoInicial(entry?: MetaAdsEntry): { data: string; formulario: FormularioMetaAds } {
  if (!entry) {
    return { data: paraInputDate(new Date()), formulario: FORMULARIO_VAZIO };
  }
  return {
    data: paraInputDate(entry.data),
    formulario: {
      gasto: entry.gasto,
      compras: entry.compras,
      conversas: entry.conversas,
      custoPorCompra: entry.custoPorCompra,
      custoPorConversa: entry.custoPorConversa,
      valorConvertido: entry.valorConvertido,
      roas: entry.roas,
      ctr: entry.ctr,
      cpm: entry.cpm,
    },
  };
}

export function MetaAdsFormDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry?: MetaAdsEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Editar importação Meta Ads" : "Importar Meta Ads"}</DialogTitle>
          <DialogDescription>
            {entry
              ? "Ajuste os valores caso a leitura automática do print tenha ficado errada."
              : "Envie o print do Gerenciador de Anúncios. O sistema tenta ler os valores automaticamente — revise antes de salvar, todos os campos são editáveis."}
          </DialogDescription>
        </DialogHeader>
        {open && <MetaAdsFormFields key={entry?.id ?? "novo"} entry={entry} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function MetaAdsFormFields({
  entry,
  onOpenChange,
}: {
  entry?: MetaAdsEntry;
  onOpenChange: (open: boolean) => void;
}) {
  const adicionarMetaAds = useAppStore((s) => s.adicionarMetaAds);
  const atualizarMetaAds = useAppStore((s) => s.atualizarMetaAds);
  const inicial = estadoInicial(entry);

  const [processando, setProcessando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [textoOcr, setTextoOcr] = useState<string | null>(null);
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const [data, setData] = useState(inicial.data);
  const [formulario, setFormulario] = useState<FormularioMetaAds>(inicial.formulario);

  async function aoSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setPreview(URL.createObjectURL(arquivo));
    setProcessando(true);
    try {
      const { campos, texto } = await reconhecerImagemMetaAds(arquivo);
      setTextoOcr(texto);
      const camposLidos = Object.keys(campos).length;
      setFormulario((atual) => ({ ...atual, ...campos }));
      if (camposLidos > 0) {
        toast.success(`Print lido, ${camposLidos} campo(s) preenchido(s). Confira antes de salvar.`);
      } else {
        toast.warning("Não consegui identificar os valores automaticamente. Preencha manualmente ou confira o texto lido abaixo.");
        setMostrarTexto(true);
      }
    } catch {
      toast.error("Não foi possível ler o print automaticamente. Preencha os campos manualmente.");
    } finally {
      setProcessando(false);
    }
  }

  function salvar() {
    if (entry) {
      atualizarMetaAds(entry.id, { data: new Date(data).toISOString(), ...formulario });
      toast.success("Importação atualizada.");
    } else {
      adicionarMetaAds({ data: new Date(data).toISOString(), ...formulario });
      toast.success("Dados do Meta Ads importados para o dashboard.");
    }
    onOpenChange(false);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 bg-accent/30 px-4 py-6 text-center hover:bg-accent/50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview do print" className="max-h-40 rounded-lg object-contain" />
          ) : (
            <>
              <Upload className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {entry ? "Clique para reenviar o print (opcional)" : "Clique para escolher o print"}
              </span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={aoSelecionarArquivo} />
        </label>

        {processando && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Lendo imagem...
          </div>
        )}

        {textoOcr && (
          <div className="rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setMostrarTexto((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground"
            >
              Texto lido do print
              <ChevronDown className={cn("size-3.5 transition-transform", mostrarTexto && "rotate-180")} />
            </button>
            {mostrarTexto && (
              <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words border-t border-border/60 p-3 text-xs text-muted-foreground">
                {textoOcr}
              </pre>
            )}
          </div>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor="meta-ads-data">Data</Label>
          <Input id="meta-ads-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CAMPOS.map((campo) => (
            <div key={campo.chave} className="grid gap-1.5">
              <Label htmlFor={`meta-ads-${campo.chave}`}>{campo.label}</Label>
              <Input
                id={`meta-ads-${campo.chave}`}
                type="number"
                step="0.01"
                value={formulario[campo.chave]}
                onChange={(e) =>
                  setFormulario((atual) => ({
                    ...atual,
                    [campo.chave]: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={salvar}>{entry ? "Salvar alterações" : "Salvar e atualizar dashboard"}</Button>
      </DialogFooter>
    </>
  );
}

export function ImportMetaAdsDialog() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setAberto(true)}>
        <ImageUp className="size-4" />
        Importar print
      </Button>
      <MetaAdsFormDialog open={aberto} onOpenChange={setAberto} />
    </>
  );
}
