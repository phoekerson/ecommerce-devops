import { Link } from "react-router-dom";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: number) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <img
        src={product.imageUrl || "https://placehold.co/600x400/e2e8f0/334155?text=No+Image"}
        alt={product.name}
        className="mb-4 h-48 w-full rounded-lg object-cover"
      />
      <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{product.name}</h3>
      <p className="mb-2 text-sm text-slate-500">{product.category}</p>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-700">{Number(product.price).toFixed(2)} EUR</span>
        <span className={`text-sm ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
          Stock: {product.stock}
        </span>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/products/${product.id}`}
          className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Voir
        </Link>
        <button
          onClick={() => onAddToCart?.(product.id)}
          disabled={product.stock < 1}
          className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Ajouter
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
