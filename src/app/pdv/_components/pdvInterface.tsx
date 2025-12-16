"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  User,
  LogOut,
  RotateCcw,
  CheckCircle2,
  PackageX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";



interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Dados Mockados para Teste (Substituir pela API real depois)
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    code: "78910001",
    name: "Refrigerante Coca-Cola 350ml",
    price: 5.5,
    stock: 120,
  },
  {
    id: "2",
    code: "78910002",
    name: "Salgadinho Doritos 140g",
    price: 12.9,
    stock: 45,
  },
  {
    id: "3",
    code: "78910003",
    name: "Água Mineral Sem Gás 500ml",
    price: 3.0,
    stock: 200,
  },
  {
    id: "4",
    code: "78910004",
    name: "Chocolate Barra ao Leite",
    price: 7.5,
    stock: 80,
  },
  { id: "5", code: "78910005", name: "Café Expresso", price: 4.5, stock: 1000 },
];

export function PDVInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<
    "money" | "credit" | "debit" | "pix" | null
  >(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [customerCpf, setCustomerCpf] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { signout: logout, user } = useAuth();
  const router = useRouter();

  // Foca no input de busca ao carregar
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "F9") {
        e.preventDefault();
        if (cart.length > 0) setIsFinalizing(true);
      }
      if (e.key === "Escape") {
        if (isFinalizing) setIsFinalizing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, isFinalizing]);

  // Adicionar Produto ao Carrinho
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchQuery(""); // Limpa a busca
    searchInputRef.current?.focus(); // Mantém o foco
  };

  // Buscar produto ao pressionar Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Tenta encontrar por código exato ou nome
    const found = MOCK_PRODUCTS.find(
      (p) =>
        p.code === searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      handleAddToCart(found);
    } else {
      // Tocar som de erro ou mostrar toast (opcional)
      console.log("Produto não encontrado");
    }
  };

  // Remover Item
  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Alterar Quantidade
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Cálculos
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Finalizar Venda (Simulação)
  const handleFinishSale = () => {
    if (!selectedPayment) {
      alert("Selecione uma forma de pagamento!");
      return;
    }

    // Aqui você chamaria a API para criar a venda
    console.log("Venda finalizada!", {
      cart,
      subtotal,
      payment: selectedPayment,
      customer: customerCpf,
      operator: user,
    });

    alert("Venda realizada com sucesso!");
    setCart([]);
    setIsFinalizing(false);
    setSelectedPayment(null);
    setCustomerCpf("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Esquerda: Lista de Produtos e Busca */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Barra de Busca */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-inner"
              placeholder="F2 - Digite o código de barras ou nome do produto..."
              autoComplete="off"
            />
          </form>
        </div>

        {/* Lista de Itens do Carrinho */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Itens da Venda
            </h2>
            <span className="text-sm text-slate-500 font-medium bg-white px-2 py-1 rounded border">
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-60">
                <ShoppingCart className="h-16 w-16" />
                <p className="text-lg">Carrinho vazio</p>
                <p className="text-sm">Escaneie um produto para começar</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all bg-white shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {item.code} • R$ {item.price.toFixed(2)} un
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-md p-1 border border-slate-200">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="h-7 w-7 flex items-center justify-center hover:bg-white rounded text-slate-600 hover:text-red-500 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="h-7 w-7 flex items-center justify-center hover:bg-white rounded text-slate-600 hover:text-green-500 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="w-24 text-right font-bold text-slate-800">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 transition-all"
                      title="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Direita: Resumo e Ações */}
      <div className="w-96 flex flex-col gap-4">
        {/* Card de Atalhos Rápidos */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-12 border-slate-300 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 justify-start gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Cancelar
          </Button>
          <Button
            variant="outline"
            className="h-12 border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 justify-start gap-2"
            onClick={() => {
              if (confirm("Deseja realmente sair?")) {
                logout();
              }
            }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        {/* Resumo Financeiro */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 to-purple-600"></div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">
                Subtotal
              </p>
              <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
                R$ {subtotal.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-dashed border-slate-200">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Descontos</span>
                <span>R$ 0,00</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Taxas</span>
                <span>R$ 0,00</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-2">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-slate-700">
                  Total a Pagar
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
              onClick={() => setIsFinalizing(true)}
              disabled={cart.length === 0}
            >
              Finalizar Venda (F9)
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Finalização (Overlay) */}
      {isFinalizing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[90vh]">
            {/* Esquerda: Resumo */}
            <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-800 mb-6">
                  Resumo do Pedido
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Itens</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="h-px bg-slate-200"></div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Valor Total</p>
                    <p className="text-4xl font-bold text-blue-600">
                      R$ {subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  CPF na Nota (Opcional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={customerCpf}
                    onChange={(e) => setCustomerCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="pl-9 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Direita: Pagamento */}
            <div className="flex-1 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Pagamento
                  </h2>
                  <p className="text-slate-500">
                    Selecione a forma de pagamento
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFinalizing(false)}
                  className="rounded-full hover:bg-slate-100"
                >
                  <PackageX className="h-6 w-6 text-slate-400" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setSelectedPayment("money")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3",
                    selectedPayment === "money"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.02]"
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <Banknote className="h-8 w-8" />
                  <span className="font-bold">Dinheiro</span>
                </button>
                <button
                  onClick={() => setSelectedPayment("credit")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3",
                    selectedPayment === "credit"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.02]"
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <CreditCard className="h-8 w-8" />
                  <span className="font-bold">Crédito</span>
                </button>
                <button
                  onClick={() => setSelectedPayment("debit")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3",
                    selectedPayment === "debit"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.02]"
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <CreditCard className="h-8 w-8" />
                  <span className="font-bold">Débito</span>
                </button>
                <button
                  onClick={() => setSelectedPayment("pix")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3",
                    selectedPayment === "pix"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.02]"
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <QrCode className="h-8 w-8" />
                  <span className="font-bold">PIX</span>
                </button>
              </div>

              <div className="mt-auto flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-lg border-slate-300"
                  onClick={() => setIsFinalizing(false)}
                >
                  Voltar
                </Button>
                <Button
                  size="lg"
                  className="flex-2 h-14 text-lg bg-green-600 hover:bg-green-700 font-bold"
                  onClick={handleFinishSale}
                  disabled={!selectedPayment}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar Pagamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
