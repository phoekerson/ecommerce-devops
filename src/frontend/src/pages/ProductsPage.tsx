import { useState } from "react";
import { AxiosError } from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import { useCartActions } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import type { ApiError } from "../types";

const categories = ["", "electronics", "fashion", "home", "beauty", "sports"];

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

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) return <p className="text-red-600">Impossible de charger les produits.</p>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-indigo-700">Catalogue Produits</h1>
      <div className="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Rechercher un produit..."
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat || "all"} value={cat}>
              {cat || "Toutes categories"}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.data.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-40"
        >
          Precedent
        </button>
        <span className="text-sm text-slate-600">
          Page {data.pagination.page} / {Math.max(1, data.pagination.pages)}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(data.pagination.pages || 1, p + 1))}
          disabled={page >= data.pagination.pages}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </section>
  );
};

export default ProductsPage;
