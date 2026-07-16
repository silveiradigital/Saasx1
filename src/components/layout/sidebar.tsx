"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";
import { useAppStore } from "@/lib/store/app-store";

export function Sidebar() {
  const pathname = usePathname();
  const nomeNegocio = useAppStore((s) => s.configuracoes.nomeNegocio);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border/60 md:bg-card/40 md:py-6">
      <div className="px-6 pb-6">
        <p className="text-lg font-semibold tracking-tight">{nomeNegocio}</p>
        <p className="text-xs text-muted-foreground">Controle de operação</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                ativo
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between px-6 pt-4">
        <span className="text-xs text-muted-foreground">Tema</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
