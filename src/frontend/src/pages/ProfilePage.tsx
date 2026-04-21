import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useOrders } from "../hooks/useCart";

const ProfilePage = () => {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();

  if (!user) return null;
  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h1 className="mb-3 text-2xl font-bold text-indigo-700">Mon profil</h1>
        <p>
          <strong>Nom:</strong> {user.firstName} {user.lastName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Historique des commandes</h2>
        {!orders?.length && <p className="text-slate-600">Aucune commande pour le moment.</p>}
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="rounded-lg border border-slate-200 p-4">
              <p className="font-medium">
                Commande #{order.id} - {Number(order.total).toFixed(2)} EUR
              </p>
              <p className="text-sm text-slate-500">Statut: {order.status}</p>
              <p className="text-sm text-slate-500">
                Date: {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
