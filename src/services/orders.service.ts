import { api } from "./api";

export interface CreateOrderDto {
  table?: string;
}

export interface AddItemDto {
  productId: string;
  quantity: number;
}

export interface PaymentDto {
  method: 'CASH' | 'PIX' | 'CARD' | 'OTHER';
  amount: number;
  reference?: string;
}

export interface CloseOrderDto {
  payments: PaymentDto[];
  discount?: number;
}

export const ordersService = {
  async create(dto: CreateOrderDto) {
    const { data } = await api.post("/orders", dto);
    return data;
  },

  async addItem(orderId: string, dto: AddItemDto) {
    const { data } = await api.post(`/orders/${orderId}/items`, dto);
    return data;
  },

  async close(orderId: string, dto: CloseOrderDto) {
    const { data } = await api.post(`/orders/${orderId}/close`, dto);
    return data;
  },
};
