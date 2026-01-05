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
    const response = await api.get("/printer/available");
    return response.data;
  },

  getPrinterConfig: async (
    terminalId: string
  ): Promise<PrinterConfig | null> => {
    const response = await api.get(`/printer/config/${terminalId}`);
    return response.data;
  },

  savePrinterConfig: async (config: PrinterConfig): Promise<PrinterConfig> => {
    const response = await api.post("/printer/config", config);
    return response.data;
  },

  testPrinter: async (config: PrinterConfig): Promise<void> => {
    await api.post("/printer/test", config);
  },
  async reprintSale(saleId: string, terminalId?: string): Promise<boolean> {
    try {
      await api.post(`/printer/reprint/${saleId}`, { terminalId });
      return true;
    } catch (error) {
      console.error("Failed to reprint:", error);
      return false;
    }
  },
};
