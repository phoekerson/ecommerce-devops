import { api } from "./api";
import type { User } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/login", { email, password });
    return response.data;
  },
  register: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/register", payload);
    return response.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>("/api/auth/me");
    return response.data;
  }
};
