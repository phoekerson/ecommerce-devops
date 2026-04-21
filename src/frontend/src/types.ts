export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  category: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  Product: Product;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  Product: Product;
}

export interface Order {
  id: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: string;
  createdAt: string;
  OrderItems: OrderItem[];
}

export interface ApiError {
  message: string;
}
