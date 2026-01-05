import { api } from "./api";
import { GetSalesParams, GetSalesResponse } from "@/types/sale";

export const salesService = {
  async getAll(params?: GetSalesParams) {
    const { data } = await api.get<GetSalesResponse>("/sales", { params });
    return data;
  },

  async getStats(startDate?: string, endDate?: string) {
    const { data } = await api.get("/sales/stats", {
      params: { startDate, endDate },
    });
    return data;
  },
};
