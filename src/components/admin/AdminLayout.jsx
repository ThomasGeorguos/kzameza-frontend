import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Users,
  Tag,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  PackagePlus,
  Home,
  Mail,
  GalleryHorizontal,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../auth/UseAuth";
import { apiFetch } from "../../config/api";

const navItems = [
  { icon: BarChart2, label: "Dashboard", to: "/admin" },
  { icon: Package, label: "Products", to: "/admin/products" },
  { icon: PackagePlus, label: "Add Product", to: "/admin/add-product" },
  { icon: ShoppingBag, label: "Orders", to: "/admin/orders" },
  { icon: Users, label: "Customers", to: "/admin/customers" },
  { icon: Tag, label: "Categories", to: "/admin/categories" },
  { icon: GalleryHorizontal, label: "Hero Slides", to: "/admin/hero-slides" },
  { icon: Mail, label: "Messages", to: "/admin/messages" },
  { icon: Settings, label: "Settings", to: "settings" },
  { icon: Home, label: "Home", to: "/" },
];

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifsSeen, setNotifsSeen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const { user, logout } = useAuth();
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    apiFetch("/api/products", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const all = data.products || [];
        setLowStockProducts(all.filter((p) => p.stock <= LOW_STOCK_THRESHOLD));
      })
      .catch((err) => console.error("Error fetching low stock", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen z-30 flex flex-col bg-[#0B3D4A] w-64 text-white transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-black text-lg tracking-tight">
              Kza <span className="text-green-400">Meza</span>
            </span>
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-3">
            Main Menu
          </p>
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${
                  isActive
                    ? "bg-green-500/20 text-green-400 border border-green-400/25"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-green-400" : "text-gray-400 group-hover:text-white"}`}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-green-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-400/30 hover:bg-red-500/10 hover:border-red-400 transition-all duration-200 w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#0B3D4A] shadow-lg h-16 flex items-center justify-between px-5 shrink-0">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h4 className="font-black text-white text-base leading-none">
                Admin Dashboard
              </h4>
              <p className="text-gray-400 text-xs mt-0.5">Welcome back 👋</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs((prev) => !prev);
                  setNotifsSeen(true);
                }}
                className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {lowStockProducts.length > 0 && !notifsSeen && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowNotifs(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#0B3D4A] border border-white/10 rounded-2xl shadow-2xl z-40">
                    <div className="p-4 border-b border-white/10 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-white font-bold text-sm">
                        Low Stock Alerts
                      </h4>
                    </div>

                    {lowStockProducts.length === 0 ? (
                      <p className="text-gray-400 text-xs p-4 text-center">
                        All products are well stocked 🎉
                      </p>
                    ) : (
                      <ul className="divide-y divide-white/5">
                        {lowStockProducts.map((p) => (
                          <li key={p._id}>
                            <NavLink
                              to="/admin/products"
                              onClick={() => setShowNotifs(false)}
                              className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <span className="text-gray-200 text-xs font-medium truncate pr-2">
                                {p.title}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                                  p.stock === 0
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {p.stock === 0
                                  ? "Out of stock"
                                  : `${p.stock} left`}
                              </span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-white/15 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-green-500/30 border border-green-400/40 flex items-center justify-center">
                <span className="text-green-400 text-xs font-black">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
