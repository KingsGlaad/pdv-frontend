/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  Store,
  User,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Register {
  id: string;
  name: string;
  isOpen: boolean;
  currentSessionId?: string | null;
  currentOperatorId?: string;
  currentOperatorName?: string;
  openedAt?: string;
}

interface RegisterSelectorProps {
  // Adicionei sessionId opcional aqui
  onSelectRegister: (
    registerId: string,
    needsOpening: boolean,
    sessionId?: string | null
  ) => void;
}

export function RegisterSelector({ onSelectRegister }: RegisterSelectorProps) {
  const [registers, setRegisters] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, loading: isLoading } = useAuth();

  const fetchRegisters = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/cash/registers");
      setRegisters(response.data);
    } catch (err: any) {
      console.error("Erro ao buscar caixas:", err);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError(
          "Não foi possível carregar a lista de caixas. Verifique a conexão com o servidor."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      fetchRegisters();
    } else if (!isLoading && !user) {
      setLoading(false);
      setError("Utilizador não autenticado.");
    }
  }, [isLoading, user]);

  const handleSelect = (reg: Register) => {
    // Verificação de permissões segura (case insensitive)
    const role = user?.role?.toUpperCase() || "";
    const isAdmin = role === "ADMIN" || role === "GERENTE";
    const isMySession = reg.currentOperatorId === user?.id;

    if (reg.isOpen && !isMySession && !isAdmin) {
      alert(
        `ACESSO NEGADO\n\nEste caixa está em uso por: ${reg.currentOperatorName}.\nSomente o operador responsável ou um Administrador pode acessá-lo.`
      );
      return;
    }

    // Passamos o currentSessionId encontrado na listagem para o pai
    onSelectRegister(reg.id, !reg.isOpen, reg.currentSessionId);
  };

  if (isLoading || (loading && !error)) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4 text-muted-foreground">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium">A conectar ao sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <div className="text-destructive flex flex-col items-center text-center max-w-md">
          <AlertCircle className="h-12 w-12 mb-2" />
          <p className="text-lg font-bold">{error}</p>
          {error.includes("Sessão expirada") && (
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/login")}
            >
              Ir para Login
            </Button>
          )}
        </div>
        {!error.includes("Sessão expirada") && (
          <Button onClick={fetchRegisters}>Tentar Novamente</Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-background p-6 overflow-auto">
      <div className="w-full max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight">
            Frente de Caixa
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione um terminal para iniciar ou continuar as vendas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registers.map((reg) => {
            const role = user?.role?.toUpperCase() || "";
            const isAdmin = role === "ADMIN" || role === "GERENTE";
            const isMySession = reg.currentOperatorId === user?.id;
            const isLocked = reg.isOpen && !isMySession && !isAdmin;

            return (
              <div
                key={reg.id}
                onClick={() => !isLocked && handleSelect(reg)}
                className={cn(
                  "relative bg-card rounded-2xl shadow-sm border-2 p-6 transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[200px]",
                  isLocked
                    ? "opacity-60 border-border grayscale-[0.8] cursor-not-allowed"
                    : reg.isOpen
                    ? "border-green-500 bg-green-500/10 hover:shadow-lg hover:-translate-y-1"
                    : "border-border hover:border-primary hover:shadow-lg hover:-translate-y-1"
                )}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={cn(
                        "h-14 w-14 rounded-xl flex items-center justify-center shadow-sm",
                        reg.isOpen
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}
                    >
                      <Store className="h-7 w-7" />
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border",
                        reg.isOpen
                          ? "bg-green-500/20 text-green-800 dark:text-green-200 border-green-500/30"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {reg.isOpen ? (
                        <Unlock className="h-3.5 w-3.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      {reg.isOpen ? "ABERTO" : "FECHADO"}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {reg.name}
                  </h3>
                </div>

                {reg.isOpen ? (
                  <div className="text-sm text-muted-foreground mt-6 pt-4 border-t border-border/60 bg-card/50 rounded-b-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="bg-muted p-1 rounded-full">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold truncate">
                        {isMySession
                          ? "Você"
                          : reg.currentOperatorName || "Desconhecido"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-8">
                      Aberto às{" "}
                      {reg.openedAt
                        ? new Date(reg.openedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-6 pt-4 border-t border-border/50 flex items-center gap-2 group-hover:text-primary">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 group-hover:bg-primary"></div>
                    Disponível para abertura
                  </div>
                )}

                {reg.isOpen && !isMySession && isAdmin && (
                  <div className="absolute top-4 right-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-yellow-500/30 shadow-sm z-10">
                    Acesso Admin
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
