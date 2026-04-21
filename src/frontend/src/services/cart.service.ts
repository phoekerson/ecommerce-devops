import { api } from "./api";
import type { CartItem, Order } from "../types";

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get<CartItem[]>("/api/cart");
    return response.data;
  },
  addToCart: async (productId: number, quantity = 1): Promise<CartItem> => {
    const response = await api.post<CartItem>("/api/cart", { productId, quantity });
    return response.data;
  },
  removeFromCart: async (id: number): Promise<void> => {
    await api.delete(`/api/cart/${id}`);
  },
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>("/api/orders");
    return response.data;
  },
  createOrder: async (): Promise<Order> => {
    const response = await api.post<Order>("/api/orders");
    return response.data;
  }
};
