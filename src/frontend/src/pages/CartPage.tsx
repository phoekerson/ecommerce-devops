import { AxiosError } from "axios";
import { useState } from "react";
import CartItem from "../components/CartItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { useCart, useCartActions } from "../hooks/useCart";
import type { ApiError } from "../types";

const CartPage = () => {
  const { data: cart, isLoading, isError } = useCart();
  const { removeMutation, orderMutation } = useCartActions();
  const [error, setError] = useState("");

  const removeItem = async (id: number) => {
    setError("");
    try {
      await removeMutation.mutateAsync(id);
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || "Suppression impossible");
    }
  };

  const checkout = async () => {
    setError("");
    try {
      await orderMutation.mutateAsync();
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || "Commande impossible");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !cart) return <p className="text-red-600">Impossible de charger le panier.</p>;

  const total = cart.reduce((sum, item) => sum + Number(item.Product.price) * item.quantity, 0);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-indigo-700">Mon panier</h1>
      {!cart.length && <p className="rounded-lg bg-white p-5 text-slate-600 shadow-sm">Panier vide.</p>}
      <div className="space-y-3">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} onRemove={removeItem} />
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
        <p className="text-lg font-semibold">Total: {total.toFixed(2)} EUR</p>
        <button
          onClick={checkout}
          disabled={!cart.length || orderMutation.isPending}
          className="mt-3 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
        >
          {orderMutation.isPending ? "Validation..." : "Passer commande"}
        </button>
      </div>
    </section>
  );
};

export default CartPage;
