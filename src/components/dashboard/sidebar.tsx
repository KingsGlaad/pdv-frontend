"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  BarChart3,
  Store,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfig } from "@/providers/config-provider";

const menuItems = [
  {
    category: "Geral",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    category: "PDV",
    items: [
      { name: "Frente de Caixa", href: "/pdv", icon: Store, highlight: true },
    ],
  },
  {
    category: "Gestão",
    items: [
      { name: "Vendas", href: "/dashboard/sales", icon: ShoppingCart },
      { name: "Produtos", href: "/dashboard/products", icon: Package },
    ],
  },
  {
    category: "Financeiro",
    items: [
      { name: "Fluxo de Caixa", href: "/dashboard/finance", icon: Wallet },
      { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { config } = useConfig();

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl text-sidebar-primary"
        >
          {config?.logoUrl ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.logoUrl}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
              {config?.appName
                ? config.appName.substring(0, 2).toUpperCase()
                : "KG"}
            </div>
          )}
          <span>{config?.appName || "KingsGlaad"}</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {menuItems.map((group, index) => (
            <div
              key={index}
              className={cn(
                "mb-6",
                group.category === "PDV" && "hidden md:block"
              )}
            >
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.category}
              </h3>
              <div className="grid gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                        isActive &&
                          "bg-sidebar-accent text-sidebar-primary font-semibold",
                        item.highlight &&
                          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-md shadow-primary/20 mt-2 mb-2 justify-center"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          item.highlight
                            ? "text-primary-foreground"
                            : isActive
                            ? "text-sidebar-primary"
                            : "text-muted-foreground group-hover:text-sidebar-primary"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Settings */}
      <div className="mt-auto border-t border-sidebar-border p-4">
        <nav className="grid gap-1">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-all"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-destructive hover:bg-destructive/10 transition-all text-left">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </nav>
      </div>
    </div>
  );
}
