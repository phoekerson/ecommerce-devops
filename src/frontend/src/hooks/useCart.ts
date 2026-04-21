import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService } from "../services/cart.service";

export const useCart = (enabled = true) =>
  useQuery({
    queryKey: ["cart"],
    queryFn: cartService.getCart,
    enabled
  });

export const useOrders = (enabled = true) =>
  useQuery({
    queryKey: ["orders"],
    queryFn: cartService.getOrders,
    enabled
  });

export const useCartActions = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) =>
      cartService.addToCart(productId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartService.removeFromCart(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const orderMutation = useMutation({
    mutationFn: cartService.createOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });

  return { addMutation, removeMutation, orderMutation };
};
