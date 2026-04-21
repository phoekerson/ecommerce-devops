import { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useProduct } from "../hooks/useProducts";
import { useCartActions } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import type { ApiError } from "../types";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const { isAuthenticated } = useAuth();
  const { addMutation } = useCartActions();
  const [error, setError] = useState("");

  const addToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      setError("Connecte-toi pour ajouter au panier");
      return;
    }
    try {
      await addMutation.mutateAsync({ productId: product.id, quantity: 1 });
      setError("");
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || "Ajout au panier impossible");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !product) return <p className="text-red-600">Produit introuvable.</p>;

  return (
    <article className="grid gap-6 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2 md:p-6">
      <img
        src={product.imageUrl || "https://placehold.co/800x600/e2e8f0/334155?text=No+Image"}
        alt={product.name}
        className="h-80 w-full rounded-lg object-cover"
      />
      <div>
        <h1 className="mb-2 text-3xl font-bold text-indigo-700">{product.name}</h1>
        <p className="mb-3 text-sm uppercase tracking-wide text-slate-500">{product.category}</p>
        <p className="mb-4 text-slate-700">{product.description}</p>
        <p className="mb-2 text-2xl font-semibold text-indigo-700">{Number(product.price).toFixed(2)} EUR</p>
        <p className={`mb-4 text-sm ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
          Stock: {product.stock}
        </p>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={addToCart}
          disabled={product.stock < 1 || addMutation.isPending}
          className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
        >
          {addMutation.isPending ? "Ajout..." : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
};

export default ProductDetailPage;
