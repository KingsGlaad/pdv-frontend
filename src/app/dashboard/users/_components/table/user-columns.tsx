import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface GetUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const getUserColumns = ({
  onEdit,
  onDelete,
}: GetUserColumnsProps): ColumnDef<User>[] => [
  {
    header: "Nome",
    accessorKey: "name",
    className: "font-medium",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Função",
    accessorKey: "role",
    cell: (row) => {
      const role = row.role;
      const roleMap: Record<string, string> = {
        ADMIN: "Administrador",
        MANAGER: "Gerente",
        CASHIER: "Caixa",
        WAITER: "Garçom",
      };
      const colorMap: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        ADMIN: "destructive",
        MANAGER: "default",
        CASHIER: "secondary",
        WAITER: "outline",
      };

      return (
        <Badge variant={colorMap[role] || "outline"}>
          {roleMap[role] || role}
        </Badge>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "active",
    cell: (row) => (
      <Badge variant={row.active ? "success" : "destructive"}>
        {row.active ? "Ativo" : "Inativo"}
      </Badge>
    ),
  },
  {
    header: "Ações",
    className: "text-right",
    cell: (row) => (
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => onEdit(row)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(row)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
