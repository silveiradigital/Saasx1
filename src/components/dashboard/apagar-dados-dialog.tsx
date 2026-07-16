"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";

export function ApagarDadosDialog() {
  const apagarTodosOsDados = useAppStore((s) => s.apagarTodosOsDados);
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button
        variant="destructive"
        className="gap-2"
        onClick={() => setAberto(true)}
      >
        <Trash2 className="size-4" />
        Apagar todos os dados
      </Button>

      <ConfirmDialog
        open={aberto}
        onOpenChange={setAberto}
        title="Apagar todos os dados"
        description="Isso vai remover permanentemente todos os chips, vendas, despesas, ativos de contingência, importações do Meta Ads e metas. Esta ação não pode ser desfeita. As configurações do sistema serão mantidas."
        confirmLabel="Apagar tudo"
        onConfirm={() => {
          apagarTodosOsDados();
          toast.success("Todos os dados foram apagados.");
        }}
      />
    </>
  );
}
