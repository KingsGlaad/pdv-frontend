import { ColumnDef } from "@/components/ui/data-table";

export interface Sale {
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

export const getSalesColumns = (): ColumnDef<Sale>[] => [
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
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
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
