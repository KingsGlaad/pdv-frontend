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

const menuItems = [
  {
    category: "Geral",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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

  return (
    <div className="flex h-full flex-col border-r bg-white text-slate-900 shadow-sm">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
            KG
          </div>
          <span>KingsGlaad</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {menuItems.map((group, index) => (
            <div key={index} className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 transition-all hover:text-primary hover:bg-slate-50",
                        isActive && "bg-primary/10 text-primary font-semibold",
                        item.highlight &&
                          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md shadow-blue-200 mt-2 mb-2 justify-center"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          item.highlight
                            ? "text-white"
                            : isActive
                            ? "text-primary"
                            : "text-slate-500 group-hover:text-primary"
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
      <div className="mt-auto border-t p-4">
        <nav className="grid gap-1">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-red-600 hover:bg-red-50 transition-all text-left">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </nav>
      </div>
    </div>
  );
}
