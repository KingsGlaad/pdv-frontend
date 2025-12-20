import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ActionButtonsProps {
  onNewComanda: () => void;
  onDirectSale: () => void;
}

export function ActionButtons({
  onNewComanda,
  onDirectSale,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold"
        onClick={onNewComanda}
      >
        <Plus className="mr-2 h-5 w-5" /> Nova Comanda
      </Button>
      <Button
        className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold"
        onClick={onDirectSale}
      >
        Venda Direta
      </Button>
    </div>
  );
}
