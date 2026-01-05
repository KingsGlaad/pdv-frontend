"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Receipt, Share2 } from "lucide-react";
import { toast } from "sonner";

interface SaleSuccessModalProps {
  isOpen: boolean;
  total: number;
  change?: number; // Troco (opcional se não tiver calculo)
  onNewSale: () => void;
  onClose: () => void;
  saleId?: string;
}

export function SaleSuccessModal({
  isOpen,
  total,
  change = 0,
  onNewSale,
  onClose,
  saleId,
}: SaleSuccessModalProps) {
  const handleReprint = async () => {
    if (!saleId) return;
    try {
      const { printerService } = await import("@/services/printer.service");
      await printerService.reprintSale(saleId);
      toast.success("Comprovante reimpreso com sucesso!");
    } catch (e) {
      console.error(e);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card p-8 rounded-3xl shadow-2xl w-full max-w-md border border-green-500/20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-20 w-20 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce-short">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Venda Realizada!
          </h2>
          <p className="text-muted-foreground">
            A venda foi registrada com sucesso.
          </p>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 mb-8 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground font-medium">
              Total Recebido
            </span>
            <span className="font-bold text-foreground text-lg">
              R$ {total.toFixed(2)}
            </span>
          </div>
          {change > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
              <span className="text-green-600 dark:text-green-400 font-bold">
                Troco
              </span>
              <span className="font-bold text-green-600 dark:text-green-400 text-xl">
                R$ {change.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            className="h-12 border-border hover:bg-muted text-muted-foreground gap-2"
            onClick={handleReprint}
            disabled={!saleId}
          >
            <Receipt className="h-4 w-4" /> Comprovante
          </Button>
          <Button
            variant="outline"
            className="h-12 border-border hover:bg-muted text-muted-foreground gap-2"
            // onClick share...
          >
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        </div>

        <Button
          className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 rounded-xl text-white"
          onClick={onNewSale}
          autoFocus
        >
          Nova Venda (Enter)
        </Button>
      </div>
    </div>
  );
}
