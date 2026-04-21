import type { CartItem as CartItemType } from "../types";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: number) => void;
}

const CartItem = ({ item, onRemove }: CartItemProps) => {
  const lineTotal = Number(item.Product.price) * item.quantity;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <img
        src={item.Product.imageUrl || "https://placehold.co/140x100/e2e8f0/334155?text=Item"}
        alt={item.Product.name}
        className="h-20 w-24 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{item.Product.name}</h3>
        <p className="text-sm text-slate-500">Quantite: {item.quantity}</p>
        <p className="text-sm font-medium text-indigo-700">{lineTotal.toFixed(2)} EUR</p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        Supprimer
      </button>
    </div>
  );
};

export default CartItem;
