export enum PaymentMethod {
  CASH = "CASH",
  PIX = "PIX",
  CARD = "CARD",
  OTHER = "OTHER",
}

export enum SaleStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export interface Sale {
  id: string;
  code: string;
  total: number;
  discount?: number;
  finalAmount: number; // This might be string/decimal from backend, need to handle
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  customerCpf?: string;
  createdAt: string;
  userName?: string; // If simplified
  items?: any[]; // Keep simple for listing
  payments?: any[];
}

export interface GetSalesParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetSalesResponse {
  data: Sale[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}
