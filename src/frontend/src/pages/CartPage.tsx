import { AxiosError } from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
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

  const subTotal = cart.reduce((sum, item) => sum + Number(item.Product.price) * item.quantity, 0);
  const total = subTotal;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-indigo-700">Mon panier</h1>
      {!cart.length ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Panier vide</p>
          <Link to="/products" className="mt-3 inline-block font-medium text-indigo-700 hover:underline">
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            {cart.map((item) => {
              const lineTotal = Number(item.Product.price) * item.quantity;
              return (
                <div key={item.id} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <img
                    src={item.Product.imageUrl || "https://placehold.co/140x100/e2e8f0/334155?text=Item"}
                    alt={item.Product.name}
                    className="h-20 w-24 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.Product.name}</h3>
                    <p className="text-sm text-slate-500">Prix: {Number(item.Product.price).toFixed(2)} EUR</p>
                    <p className="text-sm text-slate-500">Quantite: {item.quantity}</p>
                    <p className="text-sm font-semibold text-slate-900">Sous-total: {lineTotal.toFixed(2)} EUR</p>
                  </div>
                  <button
                    onClick={() => void removeItem(item.id)}
                    className="rounded-md border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Resume</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Sous-total</span>
                <span>{subTotal.toFixed(2)} EUR</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-lg font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)} EUR</span>
              </div>
            </div>
            <button
              onClick={() => void checkout()}
              disabled={orderMutation.isPending}
              className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
            >
              {orderMutation.isPending ? "Validation..." : "Passer la commande"}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartPage;
