import { Link, NavLink } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const baseLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: cartItems } = useCart(isAuthenticated);
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/products" className="text-xl font-extrabold text-indigo-700">
          DevShop
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/products" className={baseLinkClass}>
            Produits
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/profile" className={baseLinkClass}>
                Profil
              </NavLink>
              <NavLink to="/cart" className={`${baseLinkClass} relative`}>
                Panier
                <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{cartCount}</span>
              </NavLink>
              {user?.role === "admin" && (
                <NavLink to="/admin" className={baseLinkClass}>
                  Admin
                </NavLink>
              )}
              <button
                onClick={logout}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
                Deconnexion
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={baseLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={baseLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
