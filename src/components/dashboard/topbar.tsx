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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function Topbar() {
  const { user, signout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-border bg-background px-6 shadow-sm">
      {/* Mobile Menu Trigger (Visível apenas em mobile) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Search Bar */}
      <div className="w-full flex-1 md:w-auto md:flex-none">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produtos, vendas ou clientes..."
            className="w-full rounded-full bg-muted pl-9 md:w-[300px] lg:w-[400px] border-none focus:bg-background focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex flex-1 items-center justify-end gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
          <span className="sr-only">Notificações</span>
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 pl-4 border-l hover:bg-transparent p-0 h-auto rounded-none"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role || "Cargo"}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-muted border-2 border-background shadow-sm flex items-center justify-center text-muted-foreground font-bold overflow-hidden">
                {user?.name?.charAt(0).toUpperCase() || "U"}
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
            <DropdownMenuItem
              onClick={signout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
