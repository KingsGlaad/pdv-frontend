import { Button } from "@/components/ui/button";
import { Calculator, Download, RefreshCw, DollarSign } from "lucide-react";
import Link from "next/link";

interface FinancialHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  loading: boolean;
}

export function FinancialHeader({
  onRefresh,
  onExport,
  loading,
}: FinancialHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Calculator className="h-5 w-5 text-muted-foreground" />
        Financeiro
      </h2>
      <div className="flex gap-2">
        <Link href="/dashboard/financial/cash-flow">
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Fluxo de Caixa
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={loading}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
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
    </div>
  );
}
