import { Badge } from "@/components/ui/badge";
import { Sale } from "@/types/sale";
import { ColumnDef } from "@/components/ui/data-table";

export const getFinancialColumns = (): ColumnDef<Sale>[] => [
  {
    header: "Código",
    accessorKey: "code",
    className: "font-mono text-xs",
  },
  {
    header: "Data",
    accessorKey: "createdAt",
    cell: (row) => new Date(row.createdAt).toLocaleString("pt-BR"),
  },
  {
    header: "Método Pagto",
    accessorKey: "paymentMethod",
    cell: (row) => {
      const method = row.payments?.[0]?.method || row.paymentMethod;
      let label = method;
      let colorClass = "bg-muted text-muted-foreground border-border";

      if (method === "CASH") {
        label = "Dinheiro";
        colorClass =
          "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800";
      } else if (method === "PIX") {
        label = "Pix";
        colorClass =
          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800";
      } else if (
        method.includes("CARD") ||
        method === "CREDIT" ||
        method === "DEBIT"
      ) {
        label = "Cartão";
        colorClass =
          "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800";
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
    header: "Status",
    accessorKey: "status",
    cell: (row) => {
      const statusMap: Record<string, string> = {
        COMPLETED: "Concluído",
        PENDING: "Pendente",
        CANCELED: "Cancelado",
      };
      const colorMap: Record<
        string,
        "success" | "secondary" | "destructive" | "outline"
      > = {
        COMPLETED: "success",
        PENDING: "secondary",
        CANCELED: "destructive",
      };
      return (
        <Badge variant={colorMap[row.status] || "outline"}>
          {statusMap[row.status] || row.status}
        </Badge>
      );
    },
  },
  {
    header: "Total",
    accessorKey: "finalAmount",
    className: "text-right font-medium",
    cell: (row) =>
      Number(row.finalAmount).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
  },
];
