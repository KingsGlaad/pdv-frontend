"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Receipt, Share2 } from "lucide-react";

interface SaleSuccessModalProps {
  isOpen: boolean;
  total: number;
  change?: number; // Troco (opcional se não tiver calculo)
  onNewSale: () => void;
  onClose: () => void;
}

export function SaleSuccessModal({
  isOpen,
  total,
  change = 0,
  onNewSale,
  onClose,
}: SaleSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-green-100 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce-short">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Venda Realizada!
          </h2>
          <p className="text-slate-500">A venda foi registrada com sucesso.</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 font-medium">Total Recebido</span>
            <span className="font-bold text-slate-800 text-lg">
              R$ {total.toFixed(2)}
            </span>
          </div>
          {change > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
              <span className="text-green-600 font-bold">Troco</span>
              <span className="font-bold text-green-600 text-xl">
                R$ {change.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            className="h-12 border-slate-200 hover:bg-slate-50 text-slate-600 gap-2"
            onClick={onClose} // Apenas fecha, mantem na tela se quiser ver
          >
            <Receipt className="h-4 w-4" /> Comprovante
          </Button>
          <Button
            variant="outline"
            className="h-12 border-slate-200 hover:bg-slate-50 text-slate-600 gap-2"
            // onClick share...
          >
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        </div>

        <Button
          className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 rounded-xl"
          onClick={onNewSale}
          autoFocus
        >
          Nova Venda (Enter)
        </Button>
      </div>
    </div>
  );
}
