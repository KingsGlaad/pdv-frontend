import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/services/api"; // Still needed for create? Yes or pass handler. Keep simple.

interface ComandaItem {
  price: string | number;
  quantity: number;
}

export interface Comanda {
  id: string;
  number: string | number;
  table?: string | number;
  items?: ComandaItem[];
}

interface CommandasListProps {
  commandas: Comanda[];
  onSelectComanda: (comandaNumber: string | number) => void;
  onRefresh: () => void;
}

export function CommandasList({
  commandas,
  onSelectComanda,
  onRefresh,
}: CommandasListProps) {
  const handleNewComanda = async () => {
    try {
      await api.post("/orders", {
        table: "BALCAO",
      });
      toast.success("Comanda criada!");
      onRefresh();
    } catch (error) {
      toast.error("Erro ao criar comanda");
      console.error(error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
      <div className="p-4 border-b bg-slate-50 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-700">Comandas</h2>
          <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">
            {commandas?.length || 0}
          </span>
        </div>
        <Button
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
          onClick={handleNewComanda}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Comanda
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {commandas?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm p-4 text-center">
            <p>Nenhuma comanda aberta</p>
          </div>
        ) : (
          commandas?.map((c) => (
            <div
              key={c.id}
              className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors bg-white shadow-sm"
              onClick={() => onSelectComanda(c.number)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg text-slate-800">
                  #{c.number}
                </span>
                {c.table && (
                  <span className="text-xs bg-slate-100 px-1 rounded border">
                    MESA/{c.table}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>{c.items?.length || 0} itens</span>
                <span className="font-bold text-blue-600">
                  R${" "}
                  {c.items
                    ?.reduce(
                      (acc: number, item: any) =>
                        acc + Number(item.price) * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
