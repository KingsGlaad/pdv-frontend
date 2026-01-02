import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Package, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "./data-table";
import Image from "next/image";

interface GetProductColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const getProductColumns = ({
  onEdit,
  onDelete,
}: GetProductColumnsProps): ColumnDef<Product>[] => [
  {
    header: "Imagem",
    accessorKey: "imageUrl",
    className: "w-[80px]",
    cell: (row) => (
      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border border-border">
        {row.imageUrl ? (
          <Image
            src={row.imageUrl}
            alt={row.name}
            className="h-full w-full object-cover"
            width={32}
            height={32}
          />
        ) : (
          <Package className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    ),
  },
  {
    header: "Código",
    accessorKey: "code",
    className: "font-mono text-xs",
  },
  {
    header: "Nome",
    accessorKey: "name",
    className: "font-medium",
  },
  {
    header: "Preço",
    accessorKey: "price",
    className: "text-right font-medium",
    cell: (row) =>
      Number(row.price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
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
