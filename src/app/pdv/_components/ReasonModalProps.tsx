"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface ReasonModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  variant?: "warning" | "danger";
}

export function ReasonModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  variant = "warning",
}: ReasonModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim().length < 5) {
      alert("Por favor, informe um motivo válido (mínimo 5 caracteres).");
      return;
    }
    onConfirm(reason);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-md border border-border">
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
              variant === "danger"
                ? "bg-destructive/10 text-destructive"
                : "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Motivo / Justificativa
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Cliente desistiu, Erro de lançamento..."
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Voltar
            </Button>
            <Button
              className={`flex-1 font-bold ${
                variant === "danger"
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
