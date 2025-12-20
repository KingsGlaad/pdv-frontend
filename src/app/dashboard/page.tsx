"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, CreditCard, BarChart } from "lucide-react";
import { api } from "@/services/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalAmount: number;
  count: number;
  averageTicket: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAmount: 0,
    count: 0,
    averageTicket: 0,
  });

  // Filters
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        if (period === "week") {
          start.setDate(end.getDate() - 7);
        } else if (period === "month") {
          start.setMonth(end.getMonth() - 1);
        }

        const response = await api.get("/sales/stats", {
          params: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
      }
    };

    fetchStats();
  }, [period]);

  return (
    <div className="space-y-6 pt-4 pr-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500">Visão geral do desempenho de vendas.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <Button
            variant={period === "today" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod("today")}
            className={
              period === "today"
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : ""
            }
          >
            Hoje
          </Button>
          <Button
            variant={period === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod("week")}
            className={
              period === "week"
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : ""
            }
          >
            7 Dias
          </Button>
          <Button
            variant={period === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod("month")}
            className={
              period === "month"
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : ""
            }
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Vendas"
          value={stats.totalAmount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icon={DollarSign}
          iconColor="text-green-600"
          description="No período selecionado"
          trend="+12%"
          trendType="up"
        />
        <StatCard
          title="Quantidade de Vendas"
          value={stats.count}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          description="Transações realizadas"
        />
        <StatCard
          title="Ticket Médio"
          value={stats.averageTicket.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icon={CreditCard}
          iconColor="text-orange-600"
          description="Média por venda"
        />
      </div>

      {/* Charts Section Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-slate-500" />
              Desempenho de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-md border border-dashed">
              <p>Gráfico de Vendas (Em breve)</p>
            </div>
          </CardContent>
        </Card>

        {/* You can add more small charts or recent activity here if needed, but sales table is moved */}
      </div>
    </div>
  );
}
