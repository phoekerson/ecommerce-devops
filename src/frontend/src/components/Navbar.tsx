import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { CartItem } from "../types";

const baseLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCartCount(0);
        return;
      }

      try {
        const response = await api.get<CartItem[]>("/cart");
        const totalItems = response.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    };

    void loadCart();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/products" className="text-xl font-extrabold text-indigo-700">
          ShopApp
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
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
                onClick={handleLogout}
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
