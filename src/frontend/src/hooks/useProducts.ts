import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/product.service";

interface ProductQueryParams {
  page: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const useProducts = ({ page, limit = 12, category, search }: ProductQueryParams) =>
  useQuery({
    queryKey: ["products", page, limit, category, search],
    queryFn: () => productService.getProducts({ page, limit, category, search })
  });

export const useProduct = (id?: string) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id as string),
    enabled: Boolean(id)
  });
