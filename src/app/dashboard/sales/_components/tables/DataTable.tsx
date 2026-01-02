import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ReactNode } from "react";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  extraFilters?: ReactNode;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  total,
  page,
  limit,
  onPageChange,
  onSearchChange,
  searchPlaceholder = "Pesquisar...",
  isLoading,
  extraFilters,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 bg-muted/50 border-input focus:bg-card"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        {extraFilters && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
            {extraFilters}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/80">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className={`font-semibold text-muted-foreground ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-border border-t-primary animate-spin" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className}>
                      {col.cell
                        ? col.cell(row)
                        : (row as any)[col.accessorKey as string]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Mostrando {data.length > 0 ? (page - 1) * limit + 1 : 0} a{" "}
          {Math.min(page * limit, total)} de {total} registros
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-4 text-sm font-medium bg-card border border-border rounded-md min-w-[3rem] justify-center">
            {page}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
