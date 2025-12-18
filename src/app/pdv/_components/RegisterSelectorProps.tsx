"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  Store,
  User,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Register {
  id: string;
  name: string;
  isOpen: boolean;
  currentOperatorId?: string;
  currentOperatorName?: string;
  openedAt?: string;
}

interface RegisterSelectorProps {
  onSelectRegister: (registerId: string, needsOpening: boolean) => void;
}

export function RegisterSelector({ onSelectRegister }: RegisterSelectorProps) {
  const [registers, setRegisters] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const response = await api.get("/cash/registers");
      setRegisters(response.data);
    } catch (error) {
      toast.error("Erro ao buscar caixas disponíveis:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisters();
  }, []);

  const handleSelect = (reg: Register) => {
    const isAdmin = user?.role === "ADMIN"; // Verificar roles reais

    // Regra: Se aberto por outro usuario e não for admin, bloqueia
    if (reg.isOpen && reg.currentOperatorId !== user?.id && !isAdmin) {
      return (
        <div className="grid w-full max-w-xl items-start gap-4">
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Erro ao abrir caixa</AlertTitle>
            <AlertDescription>
              <p>Esse caixa já está aberto por outro usuário: {reg.currentOperatorName}</p>
              <ul className="list-inside list-disc text-sm">
                <li>Verifique se o há outro caixa aberto</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    onSelectRegister(reg.id, !reg.isOpen);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4 text-slate-500">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <p>Carregando caixas disponíveis...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Seleção de Caixa
          </h1>
          <p className="text-slate-500">
            Escolha um terminal para iniciar as operações
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registers.map((reg) => {
            const isMySession = reg.currentOperatorId === user?.id;
            const isAdmin = user?.role === "ADMIN";
            const isLocked = reg.isOpen && !isMySession && !isAdmin;

            return (
              <div
                key={reg.id}
                className={cn(
                  "relative bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md cursor-pointer group",
                  isLocked
                    ? "opacity-60 border-slate-200 cursor-not-allowed"
                    : reg.isOpen
                    ? "border-green-500 bg-green-50/30"
                    : "border-slate-200 hover:border-blue-400"
                )}
                onClick={() => !isLocked && handleSelect(reg)}
              >
                {/* Ícone de Status */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-lg flex items-center justify-center",
                      reg.isOpen
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-100 transition-colors"
                    )}
                  >
                    <Store className="h-6 w-6" />
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                      reg.isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {reg.isOpen ? (
                      <Unlock className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {reg.isOpen ? "ABERTO" : "FECHADO"}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {reg.name}
                </h3>

                {reg.isOpen ? (
                  <div className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {isMySession
                          ? "Você"
                          : reg.currentOperatorName || "Desconhecido"}
                      </span>
                    </div>
                    <div className="text-xs">
                      Aberto às{" "}
                      {new Date(reg.openedAt!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 mt-4 pt-4 border-t border-slate-100">
                    Disponível para abertura
                  </div>
                )}

                {/* Badge para Admin */}
                {reg.isOpen && !isMySession && isAdmin && (
                  <div className="absolute top-2 right-2 mt-8 mr-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded border border-yellow-200">
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
