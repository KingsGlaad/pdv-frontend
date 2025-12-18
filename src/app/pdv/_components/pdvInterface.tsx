"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Trash2,
  ShoppingCart,
  LogOut,
  RotateCcw,
  Lock,
  Percent,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/services/api";
import { RegisterSelector } from "./RegisterSelectorProps";
import { ReasonModal } from "./ReasonModalProps";
import { toast } from "sonner";
import { PDVHeader } from "./pdv-header";

// Tipos
interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
  uuid: string; // Identificador único no carrinho para evitar conflitos
}

type PaymentMethod = "money" | "credit" | "debit" | "pix";

export function PDVInterface() {
  const { signout: logout, user } = useAuth();

  // --- ESTADOS DO SISTEMA ---
  const [activeRegisterId, setActiveRegisterId] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // --- ESTADOS DO PDV ---
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [customerCpf, setCustomerCpf] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // --- MODAIS ---
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");

  // Modais de Motivo
  const [showCancelSaleModal, setShowCancelSaleModal] = useState(false);
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- SELEÇÃO DE CAIXA ---
  const handleRegisterSelection = (
    registerId: string,
    needsOpening: boolean
  ) => {
    setActiveRegisterId(registerId);
    if (needsOpening) {
      setIsRegisterOpen(false);
      setShowOpeningModal(true);
    } else {
      setIsRegisterOpen(true);
      // Aqui poderíamos buscar o estado atual do carrinho do servidor se houvesse persistência
    }
  };

  // --- PROTEÇÃO CONTRA RELOAD ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cart.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cart]);

  // --- BUSCA DE PRODUTOS ---
  const searchProduct = async (query: string) => {
    setIsLoadingProduct(true);
    try {
      let productData = null;
      try {
        const responseCode = await api.get(`/product/code/${query}`);
        productData = responseCode.data;
      } catch (error) {
        const responseSearch = await api.get(`/product?search=${query}`);
        if (responseSearch.data && responseSearch.data.length > 0) {
          productData = responseSearch.data[0];
        }
      }

      if (productData) {
        const product: CartItem = {
          id: productData.id,
          code: productData.code,
          name: productData.name,
          price: Number(productData.price),
          stock: productData.stock || 0,
          imageUrl: productData.imageUrl,
          quantity: 1,
          uuid: crypto.randomUUID(),
        };
        handleAddToCart(product);
      } else {
        toast.error("Produto não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setIsLoadingProduct(false);
      setSearchQuery("");
      searchInputRef.current?.focus();
    }
  };

  const handleAddToCart = (product: CartItem) => {
    if (!isRegisterOpen) {
      toast.error("Abra o caixa antes de adicionar produtos.");
      setShowOpeningModal(true);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, product];
    });
  };

  // --- REMOÇÃO E CANCELAMENTO COM MOTIVO ---

  const initiateRemoveItem = (uuid: string) => {
    setItemToRemoveId(uuid);
    setShowRemoveItemModal(true);
  };

  const confirmRemoveItem = (reason: string) => {
    // TODO: Enviar log de motivo para backend se necessário
    console.log(`Item removido. Motivo: ${reason}`);

    setCart((prev) => prev.filter((item) => item.uuid !== itemToRemoveId));
    setShowRemoveItemModal(false);
    setItemToRemoveId(null);
    searchInputRef.current?.focus();
  };

  const initiateCancelSale = () => {
    setShowCancelSaleModal(true);
  };

  const confirmCancelSale = (reason: string) => {
    // TODO: Enviar log de cancelamento para backend
    console.log(`Venda cancelada. Motivo: ${reason}`);

    setCart([]);
    setDiscount(0);
    setShowCancelSaleModal(false);
    searchInputRef.current?.focus();
  };

  // --- GESTÃO DE CAIXA ---

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegisterId) return;

    try {
      const initialBalance = parseFloat(openingBalance.replace(",", "."));
      if (isNaN(initialBalance)) return;

      await api.post("/cash/open", {
        cashRegisterId: activeRegisterId,
        initialBalance: initialBalance,
      });

      setIsRegisterOpen(true);
      setShowOpeningModal(false);
      setOpeningBalance("");
      toast.success("Caixa aberto com sucesso!");
    } catch (error) {
      toast.error("Erro ao abrir caixa.");
      console.error(error);
    }
  };

  const handleCloseRegister = async () => {
    if (cart.length > 0) {
      toast.error("Finalize ou cancele a venda antes de fechar o caixa.");
      return;
    }

    try {
      const statusRes = await api.get("/cash/status");
      if (!statusRes.data.session) return;

      const finalBalance = parseFloat(closingBalance.replace(",", "."));

      await api.post("/cash/close", {
        sessionId: statusRes.data.session.id,
        finalBalance: isNaN(finalBalance) ? 0 : finalBalance,
      });

      setIsRegisterOpen(false);
      setShowClosingModal(false);
      setActiveRegisterId(null); // Volta para seleção
      toast.success("Caixa fechado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fechar caixa.");
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (!activeRegisterId) {
    return <RegisterSelector onSelectRegister={handleRegisterSelection} />;
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="flex h-full gap-4 p-4 relative">
      {/* MODAL: ABERTURA DE CAIXA */}
      {showOpeningModal && (
        <div className="absolute inset-0 z-50 bg-slate-100/95 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Abertura de Caixa
            </h2>
            <form onSubmit={handleOpenRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fundo de Troco (R$)
                </label>
                <Input
                  autoFocus
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="text-2xl font-bold text-center"
                  placeholder="0,00"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setActiveRegisterId(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Abrir
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FECHAMENTO DE CAIXA */}
      {showClosingModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2 text-red-600 flex items-center gap-2">
              <Lock className="h-6 w-6" /> Fechamento
            </h2>
            <p className="text-slate-500 mb-6">
              Confira o valor físico na gaveta.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Valor em Dinheiro (Físico)
                </label>
                <Input
                  autoFocus
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  className="text-2xl font-bold text-center"
                  placeholder="0,00"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowClosingModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCloseRegister}
                >
                  Confirmar Fechamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MOTIVO CANCELAMENTO VENDA */}
      <ReasonModal
        isOpen={showCancelSaleModal}
        title="Cancelar Venda"
        description="Informe o motivo para cancelar toda a venda atual."
        variant="danger"
        onConfirm={confirmCancelSale}
        onCancel={() => setShowCancelSaleModal(false)}
      />

      {/* MODAL: MOTIVO REMOÇÃO ITEM */}
      <ReasonModal
        isOpen={showRemoveItemModal}
        title="Remover Item"
        description="Informe o motivo para remover este item do carrinho."
        onConfirm={confirmRemoveItem}
        onCancel={() => setShowRemoveItemModal(false)}
      />

      {/* --- COLUNA ESQUERDA: PRODUTOS --- */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Barra Superior */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isRegisterOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="font-bold text-slate-700">
              CAIXA {isRegisterOpen ? "ABERTO" : "FECHADO"}
            </span>
          </div>

          {isRegisterOpen && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClosingModal(true)}
                className="text-red-500 hover:bg-red-50"
              >
                <Lock className="mr-2 h-4 w-4" /> Fechar Caixa
              </Button>
            </div>
          )}
        </div>

        {/* Busca */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchProduct(searchQuery);
            }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white shadow-inner"
              placeholder={
                isRegisterOpen ? "Digite o código ou nome..." : "Caixa fechado"
              }
              disabled={!isRegisterOpen || isLoadingProduct}
            />
            {isLoadingProduct && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-blue-600" />
            )}
          </form>
        </div>

        {/* Lista Carrinho */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b bg-slate-50 font-bold text-slate-700 flex justify-between">
            <span>Produtos</span>
            <span>{cart.length} Itens</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {cart.map((item, idx) => (
              <div
                key={item.uuid}
                className="flex justify-between items-center p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      {item.quantity} x R$ {item.price.toFixed(2)}
                    </div>
                    <div className="font-bold text-slate-800">
                      R$ {(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-slate-400 hover:text-red-500"
                    onClick={() => initiateRemoveItem(item.uuid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <ShoppingCart className="h-16 w-16 mb-2" />
                <p>Carrinho Vazio</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- COLUNA DIREITA: TOTAIS --- */}
      <div className="w-96 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-12 justify-start border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300"
            onClick={initiateCancelSale}
            disabled={cart.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          <Button
            variant="outline"
            className="h-12 justify-start border-slate-300 text-slate-600"
            onClick={() => {
              if (cart.length > 0) {
                alert("Cancele a venda antes de sair.");
              } else {
                setActiveRegisterId(null);
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase">
                Subtotal
              </p>
              <p className="text-4xl font-extrabold text-slate-800">
                R$ {subtotal.toFixed(2)}
              </p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                <span className="flex items-center gap-1">
                  <Percent className="h-4 w-4" /> Desconto
                </span>
                <button
                  onClick={() => {
                    const val = prompt("Valor desconto:");
                    if (val) setDiscount(parseFloat(val));
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {discount > 0 ? `- R$ ${discount.toFixed(2)}` : "Adicionar"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border mb-4">
            <div className="flex justify-between items-end">
              <span className="font-bold text-lg text-slate-700">Total</span>
              <span className="font-bold text-3xl text-blue-600">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
            onClick={() => setIsFinalizing(true)}
            disabled={cart.length === 0}
          >
            Finalizar Venda (F9)
          </Button>
        </div>
      </div>

      {/* MODAL FINALIZAÇÃO (Simplificado para manter foco na lógica nova) */}
      {isFinalizing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl flex overflow-hidden">
            <div className="flex-1 p-8 bg-slate-50 border-r">
              <h2 className="text-2xl font-bold mb-4">Resumo</h2>
              {/* ... Resumo da venda ... */}
              <p className="text-4xl font-bold text-blue-600 mt-8">
                R$ {total.toFixed(2)}
              </p>
            </div>
            <div className="flex-1 p-8 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Pagamento</h2>
              {/* ... Botões de pagamento ... */}
              <div className="mt-auto flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setIsFinalizing(false)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-2 h-12 bg-green-600 font-bold"
                  onClick={() => {
                    toast.success("Venda finalizada!");
                    setCart([]);
                    setIsFinalizing(false);
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
