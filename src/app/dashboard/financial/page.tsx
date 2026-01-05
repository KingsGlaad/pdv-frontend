"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { salesService } from "@/services/sales.service";
import { Sale } from "@/types/sale";
import { FinancialHeader } from "./_components/financial-header";
import { getFinancialColumns } from "./_components/table/financial-columns";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { DataTable } from "@/components/ui/data-table";

export default function FinancialPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Date Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await salesService.getAll({
        page,
        limit: 10,
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSales(response.data);
      setTotalSales(response.meta.total);
    } catch (error) {
      console.error("Failed to fetch sales", error);
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  }, [page, search, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSales]);

  const handleExport = async () => {
    try {
      setLoading(true);
      // Fetch all data for export (or a reasonable limit)
      // For now, let's just export current view or maybe simplified all if API supports it.
      // Ideally API should support export or we fetch large limit.
      // Let's fetch with limit 1000 for export demo.
      const response = await salesService.getAll({
        page: 1,
        limit: 1000,
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const dataToExport = response.data.map((sale) => ({
        Código: sale.code,
        Data: new Date(sale.createdAt).toLocaleString("pt-BR"),
        "Valor Total": Number(sale.finalAmount),
        "Forma de Pagamento": sale.paymentMethod,
        Status: sale.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");

      // Auto-width columns
      const max_width = dataToExport.reduce(
        (w, r) => Math.max(w, r["Código"].length),
        10
      );
      worksheet["!cols"] = [{ wch: max_width }];

      XLSX.writeFile(
        workbook,
        `Vendas_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => getFinancialColumns(), []);

  return (
    <div className="space-y-4">
      <FinancialHeader
        onRefresh={fetchSales}
        onExport={handleExport}
        loading={loading}
      />

      <DataTable
        data={sales}
        columns={columns}
        total={totalSales}
        page={page}
        limit={10}
        onPageChange={setPage}
        onSearchChange={setSearch}
        isLoading={loading}
        searchPlaceholder="Buscar por código..."
        extraFilters={
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[150px] h-9"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[150px] h-9"
            />
          </div>
        }
      />
    </div>
  );
}
