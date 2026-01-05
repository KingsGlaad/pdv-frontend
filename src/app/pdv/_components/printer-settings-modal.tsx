import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { printerService, PrinterConfig } from "@/services/printer.service";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { api } from "@/services/api";

interface PrinterSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terminalId: string;
}

interface Register {
  id: string;
  name: string;
}

export function PrinterSettingsModal({
  open,
  onOpenChange,
  terminalId,
}: PrinterSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);
  const [registers, setRegisters] = useState<Register[]>([]);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<PrinterConfig>({
      defaultValues: {
        terminalId,
        name: "Impressora Principal",
        printerType: "THERMAL",
        connection: "WINDOWS_DRIVER",
        width: 80,
        enabled: true,
      },
    });

  useEffect(() => {
    const fetchRegisters = async () => {
      try {
        const response = await api.get("/cash/registers");
        setRegisters(response.data);
      } catch (error) {
        console.error("Erro ao buscar caixas:", error);
      }
    };

    if (open) {
      fetchRegisters();
    }
  }, [open]);

  const loadConfig = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const config = await printerService.getPrinterConfig(id);
        console.log("Printer Config Loaded:", config); // Debug log

        if (config) {
          // Add saved printer to available list so it shows in Select
          if (config.printerName) {
            setAvailablePrinters((prev) => {
              if (!prev.includes(config.printerName)) {
                return [...prev, config.printerName];
              }
              return prev;
            });
          }

          // Sanitize and reset
          reset({
            ...config,
            printerType: (config.printerType as "THERMAL" | "A4") || "THERMAL",
            name: config.name || "", // Handle null name
          });
        } else {
          reset({
            terminalId: id,
            name: "Impressora Principal",
            printerType: "THERMAL",
            connection: "WINDOWS_DRIVER",
            width: 80,
            enabled: true,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar configurações da impressora");
      } finally {
        setLoading(false);
      }
    },
    [reset]
  );

  useEffect(() => {
    if (open && terminalId) {
      loadConfig(terminalId);
    }
  }, [open, terminalId, loadConfig]);

  const searchPrinters = async () => {
    setSearching(true);
    try {
      const printers = await printerService.getAvailablePrinters();
      setAvailablePrinters(printers);
      toast.success(`${printers.length} impressoras encontradas`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar impressoras");
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (data: PrinterConfig) => {
    setLoading(true);
    try {
      await printerService.savePrinterConfig(data);
      toast.success("Configurações salvas com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const currentTerminalId = watch("terminalId");
  // Check if current terminalId is in registers
  const isCustomTerminal =
    currentTerminalId && !registers.some((r) => r.id === currentTerminalId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuração de Impressora</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Terminal ID</Label>
            <Select
              onValueChange={(val) => {
                setValue("terminalId", val);
                loadConfig(val);
              }}
              value={watch("terminalId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um terminal" />
              </SelectTrigger>
              <SelectContent>
                {registers.map((reg) => (
                  <SelectItem key={reg.id} value={reg.id}>
                    {reg.name}
                  </SelectItem>
                ))}
                {isCustomTerminal && (
                  <SelectItem value={currentTerminalId}>
                    ID Atual (Não Registrado)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {/* Hidden input to keep registration working if needed, but 'watch' covers it */}
          </div>

          <div className="space-y-2">
            <Label>Nome Amigável</Label>
            <Input {...register("name")} placeholder="Ex: Caixa 01" />
          </div>

          <div className="space-y-2">
            <Label>Impressora do Sistema</Label>
            <div className="flex gap-2">
              <Select
                onValueChange={(val) => setValue("printerName", val)}
                value={watch("printerName")}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma impressora" />
                </SelectTrigger>
                <SelectContent>
                  {availablePrinters.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={searchPrinters}
                disabled={searching}
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                onValueChange={(val: string) =>
                  setValue("printerType", val as "THERMAL" | "A4")
                }
                value={watch("printerType")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THERMAL">Térmica</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Largura (mm)</Label>
              <Select
                onValueChange={(val) => setValue("width", parseInt(val))}
                value={String(watch("width"))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80mm</SelectItem>
                  <SelectItem value="58">58mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const config = watch();
                setLoading(true);
                try {
                  await printerService.testPrinter(config);
                  toast.success("Teste enviado para impressora");
                } catch (error) {
                  console.error(error);
                  toast.error("Erro ao testar impressora");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mr-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Testar Impressora
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
