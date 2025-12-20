"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { Store, RefreshCw, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, ColumnDef } from "./_components/tables/DataTable";
import { toast } from "sonner";

interface Sale {
  id: string;
  code: string;
  finalAmount: number;
  paymentMethod: string;
  payments: {
    method: string;
    amount: number;
  }[];
  status: string;
  createdAt: string;
  user?: { name: string };
}

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

  const columns: ColumnDef<Sale>[] = [
    {
      header: "Data/Hora",
      accessorKey: "createdAt",
      className: "w-[180px]",
      cell: (row) =>
        new Date(row.createdAt).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      header: "Vendedor(a)",
      accessorKey: "user",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
            {row.user?.name?.charAt(0) || "U"}
          </div>
          {row.user?.name || "N/A"}
        </div>
      ),
    },
    {
      header: "Método Pagto",
      accessorKey: "paymentMethod",
      cell: (row) => {
        const method = row.payments?.[0]?.method || row.paymentMethod;
        let label = method;
        let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

        if (method === "CASH") {
          label = "Dinheiro";
          colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
        } else if (method === "PIX") {
          label = "Pix";
          colorClass = "bg-amber-100 text-amber-700 border-amber-200";
        } else if (
          method.includes("CARD") ||
          method === "CREDIT" ||
          method === "DEBIT"
        ) {
          label = "Cartão";
          colorClass = "bg-blue-100 text-blue-700 border-blue-200";
        }

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border uppercase ${colorClass}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      header: "Valor Total",
      accessorKey: "finalAmount",
      className: "text-right font-bold text-green-700",
      cell: (row) =>
        Number(row.finalAmount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Store className="h-5 w-5 text-slate-500" />
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
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="date"
                className="pl-9 w-40 bg-slate-50 border-slate-200"
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
