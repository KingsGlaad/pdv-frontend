"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { cashFlowService, CashMovement } from "@/services/cash-flow.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
} from "lucide-react";

export default function CashFlowPage() {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchFlow = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cashFlowService.getFlow({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setMovements(data);
    } catch (error) {
      console.error("Failed to fetch cash flow", error);
      toast.error("Erro ao carregar fluxo de caixa");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchFlow();
  }, [fetchFlow]);

  const totals = movements.reduce(
    (acc, m) => {
      const val = Number(m.amount);
      if (m.type === "SALE" || m.type === "SUPPLY") {
        acc.in += val;
      } else {
        acc.out += val;
      }
      return acc;
    },
    { in: 0, out: 0 }
  );

  const balance = totals.in - totals.out;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[150px]"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px]"
          />
          <Button onClick={fetchFlow} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totals.in.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas e Suprimentos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totals.out.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Sangrias e Ajustes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {balance.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Resultado do período
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Data
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Descrição
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Operador
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Nenhuma movimentação encontrada
                    </td>
                  </tr>
                ) : (
                  movements.map((move) => (
                    <tr
                      key={move.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        {new Date(move.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            move.type === "SALE" || move.type === "SUPPLY"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {move.type === "SALE"
                            ? "Venda"
                            : move.type === "SUPPLY"
                            ? "Suprimento"
                            : move.type === "WITHDRAW"
                            ? "Sangria"
                            : "Ajuste"}
                        </span>
                      </td>
                      <td className="p-4 align-middle">{move.reason || "-"}</td>
                      <td className="p-4 align-middle">
                        {move.session?.user?.name || "-"}
                      </td>
                      <td
                        className={`p-4 align-middle text-right font-medium ${
                          move.type === "SALE" || move.type === "SUPPLY"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Number(move.amount).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
