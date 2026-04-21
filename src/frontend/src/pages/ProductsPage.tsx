import { useState } from "react";
import { AxiosError } from "axios";
import ProductCard from "../components/ProductCard";
import { useCartActions } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import type { ApiError } from "../types";

const categories = ["", "electronics", "clothing", "food", "other"];

const ProductsPage = () => {
  const { isAuthenticated } = useAuth();
  const { addMutation } = useCartActions();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useProducts({ page, category, search, limit: 12 });

  const handleAddToCart = async (id: number) => {
    if (!isAuthenticated) {
      setError("Connecte-toi pour ajouter au panier");
      return;
    }
    setError("");
    try {
      await addMutation.mutateAsync({ productId: id, quantity: 1 });
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || "Ajout au panier impossible");
    }
  };

  if (isError) return <p className="text-red-600">Impossible de charger les produits.</p>;

  return (
    <section>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Produits</h1>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:max-w-xl">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher un produit..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <select
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {categories.map((cat) => (
                <option key={cat || "all"} value={cat}>
                  {cat || "Toutes categories"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="h-72 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Aucun produit trouve
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-40"
        >
          Precedent
        </button>
        <span className="text-sm text-slate-600">Page {data?.pagination.page ?? 1}</span>
        <button
          onClick={() => setPage((p) => Math.min(data?.pagination.pages || 1, p + 1))}
          disabled={page >= (data?.pagination.pages || 1)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </section>
  );
};

export default ProductsPage;
