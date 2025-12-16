import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, CreditCard, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
        <div className="text-sm text-slate-500">
          Última atualização: Hoje, 14:30
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Vendas Hoje
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 4.320,00</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +20.1% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Novos Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-slate-500 mt-1">
              Total de 2.340 clientes
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Produtos Críticos
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-orange-600 mt-1">
              Stock abaixo do mínimo
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Ticket Médio
            </CardTitle>
            <CreditCard className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 145,00</div>
            <p className="text-xs text-slate-500 mt-1">
              Baseado nas últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Section Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-md border border-dashed">
              Gráfico de Vendas aqui
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center">
                        <div className="ml-0 space-y-1">
                            <p className="text-sm font-medium leading-none">Venda #{1020 + i}</p>
                            <p className="text-xs text-slate-500">Cartão de Crédito</p>
                        </div>
                        <div className="ml-auto font-medium">
                            +R$ {Math.floor(Math.random() * 200)},00
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}