import { useState, useEffect, useRef, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/UseAuth";
import { useCart } from "../cart/UseCart";
import {
  Settings,
  ClipboardList,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [focused, setFocused] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const catRef = useRef(null);
  const profileRef = useRef(null);

  const { user, role, logout } = useAuth();
  const { totalItems } = useCart();

  const leftNavLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
  ];

  const rightNavLinks = [
    { label: "About", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  const allNavLinks = [...leftNavLinks, ...rightNavLinks];

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error);

    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query, products]);

  const showDrop = focused && query.trim().length > 0;

  useEffect(() => {
    const handleClick = (e) => {
      if (
        !desktopSearchRef.current?.contains(e.target) &&
        !mobileSearchRef.current?.contains(e.target)
      ) {
        setTimeout(() => setFocused(false), 150);
      }
      if (!catRef.current?.contains(e.target)) setCatOpen(false);
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 group ${isActive ? "text-white" : "text-gray-300 hover:text-white"}`;

  return (
    <nav className="bg-[#0B3D4A] shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                  />
                </svg>
              </div>
              <Link to="/" className="flex items-center gap-1">
                <span className="text-white font-bold text-xl tracking-tight">
                  Kza
                </span>
                <span className="text-green-400 font-bold text-xl tracking-tight">
                  Meza
                </span>
              </Link>
            </div>

            {/* Desktop Nav: Home, Products, Categories, About, Contact */}
            <div className="hidden md:flex items-center gap-6">
              {/* Home + Products */}
              {leftNavLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  end={link.href === "/"}
                  className={navLinkClass}
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={`absolute -bottom-1 left-0 h-0.5 bg-green-400 rounded-full transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                      />
                    </>
                  )}
                </NavLink>
              ))}

              {/* Categories Dropdown — جنب Products */}
              <div ref={catRef} className="relative">
                <button
                  onClick={() => setCatOpen(!catOpen)}
                  className="relative flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 group cursor-pointer"
                >
                  Categories
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
                  />
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-green-400 rounded-full transition-all duration-300 w-0 group-hover:w-full" />
                </button>

                {catOpen && (
                  <div className="absolute top-full mt-3 left-0 w-52 bg-[#0B3D4A] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Browse Categories
                      </p>
                    </div>
                    {categories.length === 0 ? (
                      <p className="px-4 py-3 text-gray-400 text-sm">
                        No categories
                      </p>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/category/${cat._id}`}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors group/cat cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-400/20 flex items-center justify-center shrink-0">
                            <span className="text-green-400 text-xs font-black">
                              {cat.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-300 group-hover/cat:text-white text-sm font-medium transition-colors">
                            {cat.name}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* About + Contact */}
              {rightNavLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={navLinkClass}
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={`absolute -bottom-1 left-0 h-0.5 bg-green-400 rounded-full transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <div ref={desktopSearchRef} className="relative">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  placeholder="Search products..."
                  className="bg-white/10 text-white placeholder-gray-400 text-sm rounded-xl px-4 py-2 pl-10 w-48 lg:w-64 border border-white/10 hover:border-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
              </div>

              {showDrop && (
                <div className="absolute top-full mt-2 left-0 w-full min-w-[300px] bg-[#0B3D4A] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {results.length === 0 ? (
                    <div className="px-4 py-4 text-gray-400 text-sm text-center">
                      No products found
                    </div>
                  ) : (
                    <>
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {results.length} result{results.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      {results.map((product) => (
                        <Link
                          key={product._id}
                          to={`/products/${product._id}`}
                          onClick={() => {
                            setFocused(false);
                            setQuery("");
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 shrink-0 overflow-hidden">
                            {product.coverImage ? (
                              <img
                                src={`/api/images/${product.coverImage}`}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                ?
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">
                              {product.title}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {product.description}
                            </p>
                          </div>
                          <span className="text-green-400 text-xs font-black shrink-0">
                            EGP {product.price}
                          </span>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-300 hover:text-green-400 hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                />
              </svg>
              <span className="absolute top-1 right-1 w-4 h-4 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {totalItems}
              </span>
            </Link>

            <div className="w-px h-6 bg-white/15" />

            {/* Auth */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-green-500/30 border border-green-400/40 flex items-center justify-center">
                    <span className="text-green-400 text-xs font-black">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium hidden lg:block">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute top-full mt-3 right-0 w-52 bg-[#0B3D4A] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 pt-3 pb-2 border-b border-white/10">
                      <p className="text-white text-sm font-bold truncate">
                        {user.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      {role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors group cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                          <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                            Dashboard
                          </span>
                        </Link>
                      )}
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors group cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                        <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                          My Profile
                        </span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors group cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                        <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                          My Orders
                        </span>
                      </Link>
                    </div>
                    <div className="border-t border-white/10 py-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors group w-full cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                        <span className="text-gray-300 group-hover:text-red-400 text-sm transition-colors">
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-200 border border-white/20 rounded-xl px-4 py-2 transition-all duration-200 hover:bg-green-400/10 hover:border-green-400 hover:text-green-400 cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-green-500 rounded-xl px-5 py-2 transition-all duration-200 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-px cursor-pointer"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Icons */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 text-gray-300 hover:text-green-400 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                />
              </svg>
              <span className="absolute top-1 right-1 w-4 h-4 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 flex flex-col gap-1.5 cursor-pointer"
              aria-label="Toggle menu"
            >
              <span
                className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="border-t border-white/10 px-4 py-4 space-y-1">
          {/* Home + Products */}
          {leftNavLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              end={link.href === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                ${isActive ? "text-white bg-white/10 font-medium border-l-2 border-green-400" : "text-gray-300 hover:text-white hover:bg-white/10"}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Mobile Categories — جنب Products */}
          <div>
            <button
              onClick={() => setMobileCatOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Categories
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileCatOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileCatOpen && (
              <div className="ml-3 mt-1 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat._id}`}
                    onClick={() => {
                      setMobileCatOpen(false);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* About + Contact */}
          {rightNavLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                ${isActive ? "text-white bg-white/10 font-medium border-l-2 border-green-400" : "text-gray-300 hover:text-white hover:bg-white/10"}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Mobile Search */}
          <div ref={mobileSearchRef} className="relative mt-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search products..."
              className="w-full bg-white/10 text-white placeholder-gray-400 text-sm rounded-xl px-4 py-2 pl-10 border border-white/15 focus:outline-none focus:border-green-400"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            {showDrop && results.length > 0 && (
              <div className="absolute top-full mt-2 left-0 w-full bg-[#0B3D4A] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                {results.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    onClick={() => {
                      setFocused(false);
                      setQuery("");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 shrink-0 overflow-hidden">
                      {product.coverImage && (
                        <img
                          src={`/api/images/${product.coverImage}`}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">
                        {product.title}
                      </p>
                      <p className="text-green-400 text-xs font-bold">
                        EGP {product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Auth */}
          {user ? (
            <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-400/30 flex items-center justify-center">
                  <span className="text-green-400 text-xs font-black">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white text-sm font-medium">
                  {user.name}
                </span>
              </div>
              {role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-400" />{" "}
                  Dashboard
                </Link>
              )}
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-gray-400" /> My Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-gray-400" /> My Orders
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link
                to="/login"
                className="flex-1 text-sm font-medium text-gray-200 border border-white/20 rounded-xl py-2 text-center hover:bg-green-400/10 hover:border-green-400 hover:text-green-400 transition-all duration-200 cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex-1 text-sm font-semibold text-white bg-green-500 rounded-xl py-2 text-center hover:bg-green-600 transition-all duration-200 cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
