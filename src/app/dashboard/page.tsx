"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  CreditCard,
  BarChart,
  User,
} from "lucide-react";
import { api } from "@/services/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Stats {
  totalAmount: number;
  count: number;
  averageTicket: number;
}

interface ChartData {
  date: string;
  total: number;
}

interface RecentSale {
  id: string;
  finalAmount: number;
  paymentMethod: string;
  payments: { method: string }[];
  user?: { name: string };
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAmount: 0,
    count: 0,
    averageTicket: 0,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);

  // Filters
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        if (period === "week") {
          start.setDate(end.getDate() - 7);
        } else if (period === "month") {
          start.setMonth(end.getMonth() - 1);
        }

        // Fetch Stats
        const statsPromise = api.get("/sales/stats", {
          params: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        });
        const chartStart =
          period === "today"
            ? new Date(new Date().setDate(new Date().getDate() - 7))
            : start;

        const chartPromise = api.get("/sales/chart", {
          params: {
            startDate: chartStart.toISOString(),
            endDate: end.toISOString(),
          },
        });

        // Fetch Recent Sales
        const recentSalesPromise = api.get("/sales", {
          params: { limit: 5 },
        });

        const [statsRes, chartRes, recentRes] = await Promise.all([
          statsPromise,
          chartPromise,
          recentSalesPromise,
        ]);

        setStats(statsRes.data);
        setChartData(chartRes.data);
        setRecentSales(recentRes.data.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard", error);
      }
    };

    fetchDashboardData();
  }, [period]);

  const getPaymentBadge = (sale: RecentSale) => {
    const method = sale.payments?.[0]?.method || sale.paymentMethod;
    let label = method;
    let colorClass = "bg-muted text-muted-foreground border-border";

    if (method === "CASH") {
      label = "Dinheiro";
      colorClass =
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    } else if (method === "PIX") {
      label = "Pix";
      colorClass =
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    } else if (
      method.includes("CARD") ||
      method === "CREDIT" ||
      method === "DEBIT"
    ) {
      label = "Cartão";
      colorClass =
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pt-4 pr-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho de vendas.
          </p>
        </div>
        <div className="flex bg-card p-1 rounded-lg border border-border shadow-sm">
          <Button
            variant={period === "today" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod("today")}
            className={
              period === "today"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
          iconColor="text-green-600 dark:text-green-400"
          description="No período selecionado"
          trend="+12%"
          trendType="up"
        />
        <StatCard
          title="Quantidade de Vendas"
          value={stats.count}
          icon={ShoppingBag}
          iconColor="text-blue-600 dark:text-blue-400"
          description="Transações realizadas"
        />
        <StatCard
          title="Ticket Médio"
          value={stats.averageTicket.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icon={CreditCard}
          iconColor="text-orange-600 dark:text-orange-400"
          description="Média por venda"
        />
      </div>

      {/* Charts & Recent Sales */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        {/* Chart Column */}
        <Card className="lg:col-span-4 border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-muted-foreground" />
              Desempenho de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    }
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={10}
                    tick={{ fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$${value}`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tick={{ fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      (value || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }),
                      "Total",
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    }
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{
                      backgroundColor: "var(--color-popover)",
                      color: "var(--color-popover-foreground)",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales Column */}
        <Card className="lg:col-span-3 border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              Últimas Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {sale?.user?.name || "Vendedor"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-foreground">
                      {Number(sale.finalAmount).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    {getPaymentBadge(sale)}
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma venda recente.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
