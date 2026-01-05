"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { Store, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { getSalesColumns, Sale } from "./_components/tables/sales-columns";

export default function SalesDashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("");

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        search,
      };

      if (filterDate) {
        const start = new Date(filterDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filterDate);
        end.setHours(23, 59, 59, 999);

        params.startDate = start.toISOString();
        params.endDate = end.toISOString();
      }

      const response = await api.get("/sales", { params });
      setSales(response.data.data);
      setTotalSales(response.data.meta.total);
    } catch (error) {
      console.error("Failed to fetch sales data", error);
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterDate]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchSales();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSales]);

  const columns = getSalesColumns();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-5 w-5 text-muted-foreground" />
          Histórico de Vendas
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSales()}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      <DataTable
        data={sales}
        columns={columns}
        total={totalSales}
        page={page}
        limit={10}
        onPageChange={setPage}
        onSearchChange={setSearch}
        isLoading={loading}
        searchPlaceholder="Buscar por vendedor..."
        extraFilters={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9 w-40 bg-muted/50 border-input"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
