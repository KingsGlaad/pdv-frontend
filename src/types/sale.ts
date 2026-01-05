import { User } from "./user";

export enum PaymentMethod {
  CASH = "Dinheiro",
  PIX = "PIX",
  CARD = "Cartão",
  OTHER = "Outro",
}

export enum SaleStatus {
  PENDING = "Em aberto",
  COMPLETED = "Finalizado",
  CANCELED = "Cancelado",
}

export interface Sale {
  user: User;
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
  items?: Item[]; // Keep simple for listing
  payments?: Payment[];
}

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
export interface Payment {
  method: PaymentMethod;
  amount: number;
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
