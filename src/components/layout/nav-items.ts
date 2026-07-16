import {
  LayoutDashboard,
  Smartphone,
  ShieldAlert,
  ShoppingCart,
  Wallet,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chips", label: "Chips", icon: Smartphone },
  { href: "/contingencia", label: "Contingência", icon: ShieldAlert },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
