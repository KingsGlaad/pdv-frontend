export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  code: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  imageUrl?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;
