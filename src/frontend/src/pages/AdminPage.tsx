import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useProducts } from "../hooks/useProducts";
import { productService } from "../services/product.service";
import type { ApiError, Product } from "../types";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  stock: 0,
  category: ""
};

const AdminPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useProducts({ page: 1, limit: 100 });
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const submitProduct = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: String(form.price),
        imageUrl: form.imageUrl || null
      };
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || "Action admin impossible");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || "",
      stock: product.stock,
      category: product.category
    });
  };

  const onDelete = async (id: number) => {
    setError("");
    try {
      await productService.deleteProduct(id);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      setError((err as AxiosError<ApiError>).response?.data?.message || "Suppression impossible");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">Administration Produits</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setForm(emptyForm);
            setIsModalOpen(true);
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nouveau produit
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-5 shadow-sm">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-2">Nom</th>
              <th className="pb-2">Categorie</th>
              <th className="pb-2">Prix</th>
              <th className="pb-2">Stock</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="py-2">{product.name}</td>
                <td className="py-2">{product.category}</td>
                <td className="py-2">{Number(product.price).toFixed(2)} EUR</td>
                <td className="py-2">{product.stock}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded border border-indigo-200 px-2 py-1 text-indigo-700 hover:bg-indigo-50"
                    >
                      Editer
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Supprimer ce produit ?")) {
                          void onDelete(product.id);
                        }
                      }}
                      className="rounded border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={submitProduct} className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">{editingProduct ? "Modifier produit" : "Nouveau produit"}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom"
                className="rounded-md border border-slate-300 px-3 py-2"
                required
              />
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Categorie"
                className="rounded-md border border-slate-300 px-3 py-2"
                required
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Prix"
                className="rounded-md border border-slate-300 px-3 py-2"
                required
              />
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                placeholder="Stock"
                className="rounded-md border border-slate-300 px-3 py-2"
                required
              />
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="Image URL"
                className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
                required
              />
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-slate-300"
              >
                {loading ? "En cours..." : editingProduct ? "Enregistrer" : "Creer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default AdminPage;
