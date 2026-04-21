import { api } from "./api";
import type { Product } from "../types";

export interface ProductListResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const productService = {
  getProducts: async (filters: ProductFilters): Promise<ProductListResponse> => {
    const response = await api.get<ProductListResponse>("/api/products", { params: filters });
    return response.data;
  },
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },
  createProduct: async (payload: Omit<Product, "id">): Promise<Product> => {
    const response = await api.post<Product>("/api/products", payload);
    return response.data;
  },
  updateProduct: async (id: number, payload: Partial<Omit<Product, "id">>): Promise<Product> => {
    const response = await api.put<Product>(`/api/products/${id}`, payload);
    return response.data;
  },
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  }
};
