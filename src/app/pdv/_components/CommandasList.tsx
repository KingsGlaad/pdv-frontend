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
    <div className="w-64 bg-card border-r border-border flex flex-col h-full shadow-sm z-10">
      <div className="p-4 border-b border-border bg-muted flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-foreground">Comandas</h2>
          <span className="text-xs bg-muted/50 px-2 py-1 rounded-full text-muted-foreground">
            {commandas?.length || 0}
          </span>
        </div>
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/90 font-bold text-primary-foreground"
          onClick={handleNewComanda}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Comanda
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {commandas?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm p-4 text-center">
            <p>Nenhuma comanda aberta</p>
          </div>
        ) : (
          commandas?.map((c) => (
            <div
              key={c.id}
              className="p-3 border border-border rounded-lg hover:bg-primary/10 hover:border-primary/50 cursor-pointer transition-colors bg-card shadow-sm"
              onClick={() => onSelectComanda(c.number)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg text-card-foreground">
                  #{c.number}
                </span>
                {c.table && (
                  <span className="text-xs bg-muted px-1 rounded border border-border text-muted-foreground">
                    MESA/{c.table}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{c.items?.length || 0} itens</span>
                <span className="font-bold text-primary">
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
