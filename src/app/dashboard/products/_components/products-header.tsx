import { Button } from "@/components/ui/button";
import { Package, RefreshCw } from "lucide-react";

interface ProductsHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export function ProductsHeader({ onRefresh, loading }: ProductsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Package className="h-5 w-5 text-muted-foreground" />
        Produtos
      </h2>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
        />
        Atualizar
      </Button>
    </div>
  );
}
