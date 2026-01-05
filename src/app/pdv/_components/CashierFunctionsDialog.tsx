"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface CashierFunctionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type OperationType = "SUPPLY" | "WITHDRAW";

export function CashierFunctionsDialog({
  isOpen,
  onClose,
  onSuccess,
}: CashierFunctionsDialogProps) {
  const [type, setType] = useState<OperationType>("WITHDRAW");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // To solve the sessionId issue without passing props (cleaner),
  // let's fetch /cash/status on mount or on submit.
  // Better yet, modify submit to fetch active session first.

  const handleSubmitWithSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const statusRes = await api.get("/cash/status");
      if (!statusRes.data.isOpen || !statusRes.data.session) {
        toast.error("Caixa fechado ou sem sessão.");
        setLoading(false);
        return;
      }
      const sessionId = statusRes.data.session.id;

      const val = parseFloat(amount.replace(",", "."));
      if (isNaN(val) || val <= 0) {
        toast.error("Valor inválido");
        setLoading(false);
        return;
      }

      await api.post("/cash/movement", {
        type: type,
        amount: val,
        reason: reason,
        sessionId: sessionId,
      });

      toast.success(
        type === "SUPPLY" ? "Suprimento realizado!" : "Sangria realizada!"
      );
      setAmount("");
      setReason("");
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao processar");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Funções do Caixa</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={type === "WITHDRAW" ? "destructive" : "outline"}
            className="flex-1"
            onClick={() => setType("WITHDRAW")}
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Sangria
          </Button>
          <Button
            type="button"
            variant={type === "SUPPLY" ? "default" : "outline"}
            className={`flex-1 ${
              type === "SUPPLY" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setType("SUPPLY")}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Suprimento
          </Button>
        </div>

        <form onSubmit={handleSubmitWithSession} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="text-2xl font-bold text-center"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo / Descrição</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Retirada para pagamento..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={
                type === "SUPPLY"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
