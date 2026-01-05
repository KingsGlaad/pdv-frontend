import { api } from "./api";

export interface CashFlowFilters {
  startDate?: string;
  endDate?: string;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: "SALE" | "SUPPLY" | "WITHDRAW" | "ADJUSTMENT";
  amount: number;
  reason: string;
  createdAt: string;
  session: {
    user: {
      name: string;
    };
    cashRegister: {
      name: string;
    };
  };
}

export const cashFlowService = {
  getFlow: async (filters: CashFlowFilters) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await api.get<CashMovement[]>(
      `/cash/flow?${params.toString()}`
    );
    return response.data;
  },
};
