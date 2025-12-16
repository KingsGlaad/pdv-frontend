"use client";

import { Search, Bell, Menu, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const { user, signout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-white px-6 shadow-sm">
      {/* Mobile Menu Trigger (Visível apenas em mobile) */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search Bar */}
      <div className="w-full flex-1 md:w-auto md:flex-none">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar produtos, vendas ou clientes..."
            className="w-full rounded-full bg-slate-50 pl-9 md:w-[300px] lg:w-[400px] border-slate-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex flex-1 items-center justify-end gap-4">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          <span className="sr-only">Notificações</span>
        </Button>
        
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 pl-4 border-l hover:bg-transparent p-0 h-auto rounded-none">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-slate-500">{user?.role || 'Cargo'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signout} className="text-red-600 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}