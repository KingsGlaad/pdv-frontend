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
import { useSocket } from "@/providers/socket-provider";
import { RegisterSelector } from "./RegisterSelectorProps";
import { ReasonModal } from "./ReasonModalProps";
import { toast } from "sonner";
import { ActionButtons } from "./ActionButtons";
import { CommandasList } from "./CommandasList";
import { ShortcutsHandler } from "./ShortcutsHandler";
import { SaleSuccessModal } from "./SaleSuccessModal";
import { CashierFunctionsDialog } from "./CashierFunctionsDialog";

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
type SaleMode = "DIRECT" | "COMMAND";

export function PDVInterface() {
  const { signout: logout, user } = useAuth();
  const { socket } = useSocket();

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
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  // --- NOVO: MODO DE VENDA ---
  const [saleMode, setSaleMode] = useState<SaleMode | null>("DIRECT"); // Default to Direct
  const [commandNumber, setCommandNumber] = useState<string>("");
  const [activeComandaId, setActiveComandaId] = useState<string | null>(null);
  const [activeSaleId, setActiveSaleId] = useState<string | null>(null);
  const [commandas, setCommandas] = useState<any[]>([]);

  const fetchCommandas = async () => {
    try {
      const response = await api.get("/orders/open");
      setCommandas(response.data);
    } catch (error) {
      console.error("Erro ao buscar comandas:", error);
    }
  };

  useEffect(() => {
    if (isRegisterOpen) {
      fetchCommandas();

      if (socket) {
        socket.on("orders:create", (data: any) => {
          fetchCommandas();
          toast.info(`Nova comanda #${data.number} aberta`, { duration: 2000 });
        });

        socket.on("orders:update", (data: any) => {
          fetchCommandas();
          if (saleMode === "COMMAND" && activeComandaId === data.id) {
            //handleAddToCart(data.items);
          }
        });
      }

      return () => {
        if (socket) {
          socket.off("orders:create");
          socket.off("orders:update");
        }
      };
    }
  }, [isRegisterOpen, socket, saleMode, activeComandaId]);

  // --- MODAIS ---
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSaleTotal, setLastSaleTotal] = useState(0);
  const [lastChange, setLastChange] = useState(0);

  // Modais de Motivo
  const [showCancelSaleModal, setShowCancelSaleModal] = useState(false);
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<string | null>(null);
  const [showCashierFunctionsModal, setShowCashierFunctionsModal] =
    useState(false);

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

  // Debounce para autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2 && !searchQuery.includes("*")) {
        try {
          const response = await api.get(`/product?search=${searchQuery}`);
          if (response.data) {
            setSuggestions(response.data);
          }
        } catch (error) {
          console.error("Erro no autocomplete:", error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchProduct = async (query: string) => {
    if (!query || query.trim() === "") return;

    setIsLoadingProduct(true);
    setSuggestions([]);

    try {
      const qtyMatch = query.match(/^(\d+)\*(.+)$/);
      let quantity = 1;
      let actualCode = query;

      if (qtyMatch) {
        quantity = parseInt(qtyMatch[1], 10);
        actualCode = qtyMatch[2];
      }

      let productData = null;

      // Tenta buscar por código exato primeiro
      try {
        const responseCode = await api.get(`/product/code/${actualCode}`);
        productData = responseCode.data;
      } catch (error) {
        if (!qtyMatch) {
          try {
            const responseSearch = await api.get(
              `/product?search=${actualCode}`
            );
            if (responseSearch.data && responseSearch.data.length > 0) {
              productData = responseSearch.data[0];
            }
          } catch (err) {}
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
          quantity: quantity,
          uuid: crypto.randomUUID(),
        };
        handleAddToCart(product);
      } else {
        toast.error("Produto não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
      toast.error("Erro ao buscar produto.");
    } finally {
      setIsLoadingProduct(false);
      setSearchQuery("");
      searchInputRef.current?.focus();
    }
  };

  // --- POLLING ATIVO PARA COMANDA SELECIONADA ---
  // Refetch active order on socket update or change
  useEffect(() => {
    if (saleMode === "COMMAND" && activeComandaId) {
      const fetchActiveOrder = async () => {
        try {
          const response = await api.get(`/orders/${activeComandaId}`);
          if (response.data && response.data.items) {
            const mappedItems: CartItem[] = response.data.items.map(
              (item: any) => ({
                id: item.product.id,
                code: item.product.code,
                name: item.product.name,
                price: Number(item.price), // Uses order item price (snapshot)
                stock: item.product.stock,
                imageUrl: item.product.imageUrl,
                quantity: item.quantity,
                uuid: crypto.randomUUID(),
              })
            );
            setCart(mappedItems);
          }
        } catch (e) {
          console.error(e);
          toast.error("Erro ao carregar itens da comanda");
        }
      };

      fetchActiveOrder();

      if (socket) {
        socket.on("orders:update", (data: any) => {
          if (data.id === activeComandaId) {
            fetchActiveOrder();
          }
        });
      }
      return () => {
        if (socket) socket.off("orders:update");
      };
    }
  }, [saleMode, activeComandaId, socket]);

  const handleAddToCart = async (product: CartItem) => {
    if (!isRegisterOpen) {
      toast.error("Abra o caixa antes de adicionar produtos.");
      setShowOpeningModal(true);
      return;
    }

    if (saleMode === "COMMAND" && activeComandaId) {
      try {
        await api.post(`/orders/${activeComandaId}/items`, {
          productId: product.id,
          quantity: product.quantity,
        });
        toast.success("Item adicionado!");
        setCart((prev) => {
          const existing = prev.find((p) => p.id === product.id);
          if (existing) {
            return prev.map((p) =>
              p.id === product.id
                ? { ...p, quantity: p.quantity + product.quantity }
                : p
            );
          }
          return [...prev, product];
        });
      } catch (error) {
        console.error(error);
        toast.error("Erro ao adicionar item na comanda");
      }
      return;
    }

    // DIRECT SALE (LOCAL)
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
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

  const confirmSale = async (receivedAmount?: number) => {
    try {
      if (!activeRegisterId) return;
      const payload = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        payments: [
          {
            method: selectedPayment || "money",
            amount: total,
          },
        ],
        discount: discount,
        commandNumber:
          saleMode === "COMMAND" && commandNumber
            ? parseInt(commandNumber)
            : undefined,
        terminalId: activeRegisterId,
      };

      const response = await api.post("/orders/direct-sale", payload);

      // Sucesso!
      setLastSaleTotal(total);
      setActiveSaleId(response.data.saleId);

      // Calculate change
      let changeVal = 0;
      if (
        selectedPayment === "money" &&
        receivedAmount &&
        receivedAmount > total
      ) {
        changeVal = receivedAmount - total;
      }
      setLastChange(changeVal);

      setShowSuccessModal(true);
      setIsFinalizing(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao finalizar venda.");
    }
  };

  const startNewSale = () => {
    setCart([]);
    setDiscount(0);
    setSelectedPayment(null);
    setShowSuccessModal(false);
    setLastChange(0);
    setSuggestions([]);
    setSearchQuery("");
    setSaleMode("DIRECT");
    setCommandNumber("");
    setTimeout(() => searchInputRef.current?.focus(), 100);
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
      const sessionId = statusRes.data.session.id;

      const response = await api.post("/cash/close", {
        sessionId: sessionId,
        finalBalance: isNaN(finalBalance) ? 0 : finalBalance,
      });

      // Mostrar diferença se houver
      if (response.data.difference !== 0) {
        toast.warning(
          `Caixa fechado com diferença de R$ ${Number(
            response.data.difference
          ).toFixed(2)}`
        );
      } else {
        toast.success("Caixa fechado corretamente!");
      }

      setIsRegisterOpen(false);
      setShowClosingModal(false);
      setActiveRegisterId(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fechar caixa.");
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (!activeRegisterId) {
    return <RegisterSelector onSelectRegister={handleRegisterSelection} />;
  }

  // Se caixa aberto mas sem modo de venda definido
  if (isRegisterOpen && !saleMode) {
    return (
      <div className="flex h-full items-center justify-center bg-muted relative">
        {/* HEADER para poder fechar caixa se quiser */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClosingModal(true)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Lock className="mr-2 h-4 w-4" /> Fechar Caixa
          </Button>
        </div>

        {/* MODAL MOCKUP PARA SELEÇÃO */}
        <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-lg border border-border">
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
            Iniciar Venda
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <ActionButtons
              onDirectSale={() => {
                setSaleMode("DIRECT");
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              onNewComanda={() => {
                // Focus input or toggle visibility
                const input = document.getElementById("comanda-input");
                input?.focus();
              }}
            />

            <div className="relative border-t border-border my-2">
              <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-card px-2 text-muted-foreground text-sm">
                OU
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-foreground">
                Informe o número da Comanda
              </label>
              <div className="flex gap-2">
                <Input
                  id="comanda-input"
                  placeholder="Nº da Comanda"
                  className="text-lg h-12"
                  value={commandNumber}
                  onChange={(e) => setCommandNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commandNumber) {
                      setSaleMode("COMMAND");
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }}
                  autoFocus
                />
                <Button
                  className="h-12 w-24 bg-slate-800 hover:bg-slate-900"
                  disabled={!commandNumber}
                  onClick={() => {
                    setSaleMode("COMMAND");
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FECHAMENTO PARA CASO QUEIRA SAIR AQUI */}
        {showClosingModal && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-2 text-destructive flex items-center gap-2">
                <Lock className="h-6 w-6" /> Fechamento
              </h2>
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
      </div>
    );
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="flex h-full gap-4 p-4 relative bg-muted/30">
      <ShortcutsHandler
        onF2={() => searchInputRef.current?.focus()}
        onF8={() => setShowCashierFunctionsModal(true)}
        onF9={() => {
          if (cart.length > 0) setIsFinalizing(true);
        }}
        onEscape={() => {
          if (showClosingModal) setShowClosingModal(false);
          if (showOpeningModal) setShowOpeningModal(false);
          if (isFinalizing) setIsFinalizing(false);
          if (selectedPayment) setSelectedPayment(null);
          if (showCancelSaleModal) setShowCancelSaleModal(false);
          if (showRemoveItemModal) setShowRemoveItemModal(false);
          if (showCashierFunctionsModal) setShowCashierFunctionsModal(false);
        }}
      />

      <CashierFunctionsDialog
        isOpen={showCashierFunctionsModal}
        onClose={() => setShowCashierFunctionsModal(false)}
      />

      {isRegisterOpen && (
        <CommandasList
          commandas={commandas}
          onRefresh={fetchCommandas}
          onSelectComanda={(num, id) => {
            setCart([]); // Clear cart before loading command
            setCommandNumber(num.toString());
            // Se veio ID, usa. Senão tenta achar na lista
            if (id) {
              setActiveComandaId(id);
            } else {
              const found = commandas.find((c) => c.number == num);
              if (found) setActiveComandaId(found.id);
            }
            setSaleMode("COMMAND");
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
        />
      )}
      {/* MODAL: ABERTURA DE CAIXA */}
      {showOpeningModal && (
        <div className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-md border border-border">
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
                  className="flex-1 bg-primary hover:bg-primary/90"
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
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2 text-destructive flex items-center gap-2">
              <Lock className="h-6 w-6" /> Fechamento
            </h2>
            <p className="text-muted-foreground mb-6">
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

      {/* MODAL: SUCESSO VENDA */}
      <SaleSuccessModal
        isOpen={showSuccessModal}
        total={lastSaleTotal}
        change={lastChange}
        onNewSale={startNewSale}
        onClose={() => setShowSuccessModal(false)}
        saleId={activeSaleId as string}
      />

      {/* --- COLUNA ESQUERDA: PRODUTOS --- */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Barra Superior */}
        <div className="flex justify-between items-center bg-card p-3 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isRegisterOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="font-bold text-foreground">
              CAIXA {isRegisterOpen ? "ABERTO" : "FECHADO"}
            </span>
          </div>

          {isRegisterOpen && (
            <div className="flex gap-2">
              {saleMode === "COMMAND" && commandNumber ? (
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-200">
                  <span className="font-bold text-yellow-800">
                    Comanda #{commandNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-yellow-700 hover:bg-yellow-200"
                    title="Sair da Comanda (Venda Direta)"
                    onClick={() => {
                      setSaleMode("DIRECT");
                      setCommandNumber("");
                      setActiveComandaId(null);
                      setCart([]);
                      toast.info("Modo Venda Direta");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-blue-700 hover:bg-blue-200 ml-2"
                    title="Chamar Garçom"
                    onClick={async () => {
                      if (!activeComandaId) return;
                      const comanda = commandas.find(
                        (c) => c.id === activeComandaId
                      );
                      if (comanda) {
                        try {
                          await api.post("/orders/call-waiter", {
                            table: comanda.table || `Comanda ${comanda.number}`,
                          });
                          toast.success("Garçom chamado!");
                        } catch (e) {
                          toast.error("Erro ao chamar garçom");
                        }
                      }
                    }}
                  >
                    <Loader2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-lg border border-green-200">
                  <span className="font-bold text-green-800">Venda Direta</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClosingModal(true)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Lock className="mr-2 h-4 w-4" /> Fechar Caixa
              </Button>
            </div>
          )}
        </div>

        {/* Busca */}
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isLoadingProduct) return;
              searchProduct(searchQuery);
            }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isLoadingProduct) {
                  e.preventDefault();
                }
              }}
              className="pl-12 h-14 text-lg bg-muted/50 border-input focus:bg-card shadow-inner"
              placeholder={
                isRegisterOpen
                  ? "Digite o código ou nome... (ex: 2*123)"
                  : "Caixa fechado"
              }
              disabled={!isRegisterOpen} // Remove isLoadingProduct to keep focus
              autoComplete="off"
              autoFocus
            />
            {isLoadingProduct && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
            )}
          </form>

          {/* AUTOCOMPLETE SUGGESTIONS */}
          {suggestions.length > 0 && isRegisterOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-xl border border-border z-50 max-h-60 overflow-y-auto">
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  className="p-4 hover:bg-primary/10 cursor-pointer border-b last:border-none flex justify-between items-center transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Evita perder foco
                    handleAddToCart({
                      ...product,
                      price: Number(product.price),
                      quantity: 1,
                      uuid: crypto.randomUUID(),
                    });
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                      {product.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Cód: {product.code}
                    </span>
                  </div>
                  <span className="font-bold text-primary">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista Carrinho */}
        <div className="flex-1 bg-card rounded-xl shadow-sm border border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b bg-muted font-bold text-foreground flex justify-between">
            <span>Produtos</span>
            <span>{cart.length} Itens</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {cart.map((item, idx) => (
              <div
                key={item.uuid}
                className="flex justify-between items-center p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.code}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {item.quantity} x R$ {item.price.toFixed(2)}
                    </div>
                    <div className="font-bold text-foreground">
                      R$ {(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => initiateRemoveItem(item.uuid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
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
            className="h-12 justify-start border-border text-muted-foreground hover:text-destructive hover:border-destructive/50"
            onClick={initiateCancelSale}
            disabled={cart.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          <Button
            variant="outline"
            className="h-12 justify-start border-border text-muted-foreground"
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

        <div className="flex-1 bg-card rounded-xl shadow-sm border p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground font-bold uppercase">
                Subtotal
              </p>
              <p className="text-4xl font-extrabold text-foreground">
                R$ {subtotal.toFixed(2)}
              </p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Percent className="h-4 w-4" /> Desconto
                </span>
                <button
                  onClick={() => {
                    const val = prompt("Valor desconto:");
                    if (val) setDiscount(parseFloat(val));
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  {discount > 0 ? `- R$ ${discount.toFixed(2)}` : "Adicionar"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border mb-4">
            <div className="flex justify-between items-end">
              <span className="font-bold text-lg text-foreground">Total</span>
              <span className="font-bold text-3xl text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200/50 text-white"
            onClick={() => setIsFinalizing(true)}
            disabled={cart.length === 0}
          >
            Finalizar Venda (F9)
          </Button>
        </div>
      </div>

      {/* MODAL FINALIZAÇÃO */}
      {isFinalizing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl h-[80vh] rounded-2xl flex overflow-hidden shadow-2xl">
            {/* Esquerda: Resumo */}
            <div className="w-1/3 bg-muted/30 border-r p-6 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-foreground">
                Resumo do Pedido
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div
                    key={item.uuid}
                    className="flex justify-between text-sm py-2 border-b border-border"
                  >
                    <div>
                      <span className="font-bold block text-foreground">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.quantity}x R$ {item.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="font-bold text-foreground">
                      R$ {(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between mb-2 text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600 font-medium">
                    <span>Desconto</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end mt-4">
                  <span className="text-xl font-bold text-foreground">
                    Total a Pagar
                  </span>
                  <span className="text-3xl font-extrabold text-primary">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direita: Pagamento */}
            <div className="flex-1 p-8 flex flex-col bg-card">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" /> Pagamento
              </h2>

              {!selectedPayment ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col gap-2 text-lg hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                    onClick={() => setSelectedPayment("money")}
                  >
                    <span className="text-3xl">💵</span> Dinheiro
                  </Button>
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col gap-2 text-lg hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600"
                    onClick={() => setSelectedPayment("pix")}
                  >
                    <span className="text-3xl">💠</span> PIX
                  </Button>
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col gap-2 text-lg hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-600"
                    onClick={() => setSelectedPayment("credit")}
                  >
                    <span className="text-3xl">💳</span> Crédito
                  </Button>
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col gap-2 text-lg hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-600"
                    onClick={() => setSelectedPayment("debit")}
                  >
                    <span className="text-3xl">💳</span> Débito
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPayment(null)}
                    >
                      ← Voltar
                    </Button>
                    <span className="font-bold text-lg uppercase bg-muted px-3 py-1 rounded">
                      {selectedPayment === "money"
                        ? "Dinheiro"
                        : selectedPayment === "pix"
                        ? "Pix"
                        : "Cartão"}
                    </span>
                  </div>

                  {/* CONTEUDO ESPECIFICO DO METODO */}
                  <div className="flex-1 flex flex-col justify-center items-center">
                    {selectedPayment === "money" && (
                      <div className="w-full max-w-sm space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-2">
                            Valor Recebido (R$)
                          </label>
                          <Input
                            autoFocus
                            className="text-4xl text-center h-20 font-bold"
                            placeholder="0,00"
                            onChange={() => {
                              // Simple calc logic here for demo
                              // In real app, manage state
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = parseFloat(
                                  (
                                    e.currentTarget as HTMLInputElement
                                  ).value.replace(",", ".")
                                );
                                if (!isNaN(val) && val >= total) {
                                  // Pass Received Amount to calculate change
                                  confirmSale(val);
                                } else {
                                  toast.error("Valor insuficiente");
                                }
                              }
                            }}
                          />
                        </div>
                        <p className="text-center text-muted-foreground text-sm">
                          Pressione Enter para confirmar
                        </p>
                      </div>
                    )}

                    {selectedPayment === "pix" && (
                      <div className="text-center space-y-4">
                        <div className="bg-card p-4 border-2 border-foreground/20 rounded-lg inline-block">
                          {/* Mock QR Code */}
                          <div className="h-48 w-48 bg-foreground flex items-center justify-center text-background text-xs">
                            [QR CODE PIX FAKE]
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            Aguardando pagamento...
                          </p>
                          <p className="text-muted-foreground mb-4">
                            A chave expira em 14:59
                          </p>
                          <Button
                            className="font-bold bg-green-600 text-white w-full hover:bg-green-700"
                            onClick={confirmSale}
                          >
                            Simular Pagamento Recebido
                          </Button>
                        </div>
                      </div>
                    )}

                    {(selectedPayment === "credit" ||
                      selectedPayment === "debit") && (
                      <div className="text-center space-y-6">
                        <div className="animate-pulse">
                          <span className="text-6xl">💳</span>
                        </div>
                        <p className="text-xl font-medium text-muted-foreground">
                          Aguardando maquininha...
                        </p>
                        <Button
                          size="lg"
                          className="font-bold px-8"
                          onClick={confirmSale}
                        >
                          Confirmar Transação
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 flex gap-3 border-t">
                <Button
                  variant="outline"
                  className="h-12 px-6"
                  onClick={() => {
                    setIsFinalizing(false);
                    setSelectedPayment(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
