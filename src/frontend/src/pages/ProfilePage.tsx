import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useOrders } from "../hooks/useCart";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { data: orders, isLoading } = useOrders();

  if (!user) return null;
  if (isLoading) return <LoadingSpinner />;

  const initials = `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-600">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Se deconnecter
        </button>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Mes commandes</h2>
        {!orders?.length && <p className="text-slate-600">Aucune commande pour le moment.</p>}
        {!!orders?.length && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="px-2 py-2">#{order.id}</td>
                    <td className="px-2 py-2">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-2 py-2">{Number(order.total).toFixed(2)} EUR</td>
                    <td className="px-2 py-2">
                      <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
