import { api } from "./api";
import { CreateProductDto, Product, UpdateProductDto } from "@/types/product";

interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface GetProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const productsService = {
  async getAll(params?: GetProductsParams) {
    const { data } = await api.get<GetProductsResponse>("/product", { params });
    return data;
  },

  async getByCode(code: string) {
    const { data } = await api.get<Product>(`/product/code/${code}`);
    return data;
  },

  async create(dto: CreateProductDto) {
    const { data } = await api.post<Product>("/product/create", dto);
    return data;
  },

  async update(id: string, dto: UpdateProductDto) {
    const { data } = await api.patch<Product>(`/product/${id}`, dto);
    return data;
  },

  async delete(id: string) {
    await api.delete(`/product/${id}`);
  },
};
