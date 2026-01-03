import { api } from "@/services/api";

export interface PrinterConfig {
  id?: string;
  terminalId: string;
  name?: string;
  printerName: string;
  printerType: "THERMAL" | "A4";
  connection: string;
  width: number;
  enabled: boolean;
}

export const printerService = {
  getAvailablePrinters: async (): Promise<string[]> => {
    const response = await api.get("/settings/printers/available");
    return response.data;
  },

  getPrinterConfig: async (
    terminalId: string
  ): Promise<PrinterConfig | null> => {
    const response = await api.get(`/settings/printers/${terminalId}`);
    return response.data;
  },

  savePrinterConfig: async (config: PrinterConfig): Promise<PrinterConfig> => {
    const response = await api.post("/settings/printers", config);
    return response.data;
  },
};
