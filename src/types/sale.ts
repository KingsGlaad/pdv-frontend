import { User } from "./user";

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
  user: User;
  id: string;
  code: string;
  total: number;
  discount?: number;
  finalAmount: number; // This might be string/decimal from backend, need to handle
  paymentMethod: string; // Changed from PaymentMethod enum to string to match Prisma schema and allow other values
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
