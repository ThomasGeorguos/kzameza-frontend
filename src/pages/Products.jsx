import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, ArrowUpDown, Search } from "lucide-react";
import { useCart } from "../cart/UseCart";
import toast from "react-hot-toast";
import { apiFetch } from "../config/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc"); // desc = الأكتر كمية الأول
  const [query, setQuery] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "text-red-400",
        dot: "bg-red-400",
      };
    if (stock <= 5)
      return {
        label: `${stock} in stock`,
        color: "text-yellow-400",
        dot: "bg-yellow-400",
      };
    return {
      label: `${stock} in stock`,
      color: "text-green-400",
      dot: "bg-green-400",
    };
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { success, message } = await addToCart(product._id, product.price);
      if (success) {
        toast.success("Product added to cart successfully");
        return;
      }
      toast.error(message || "Product out of stock");
    } catch (err) {
      toast.error(err.message || "Unexpected error occurred");
    }
  };

  const visibleProducts = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) =>
      sortOrder === "desc" ? b.stock - a.stock : a.stock - b.stock,
    );

    return list;
  }, [products, query, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin w-8 h-8 text-[#0B3D4A]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-[#0B3D4A] text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B3D4A] border border-white/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">
                All Products
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {visibleProducts.length} product
                {visibleProducts.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-64 bg-white text-gray-800 placeholder-gray-400 text-sm rounded-xl px-4 py-2.5 pl-10 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Sort by quantity */}
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className="flex items-center gap-2 bg-[#0B3D4A] hover:bg-[#0B3D4A]/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shrink-0 cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4 text-green-400" />
              Qty: {sortOrder === "desc" ? "High to Low" : "Low to High"}
            </button>
          </div>
        </div>

        {/* Empty */}
        {visibleProducts.length === 0 ? (
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">
              No products found
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleProducts.map((product) => {
              const stock = getStockStatus(product.stock);
              return (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group flex flex-col bg-[#0B3D4A] border border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-green-400/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div
                    className="relative bg-white/5 overflow-hidden"
                    style={{ height: "280px" }}
                  >
                    {product.coverImage && (
                      <img
                        src={`/api/images/${product.coverImage}`}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-3 left-3 bg-[#0B3D4A]/90 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-400/30">
                        Featured
                      </div>
                    )}
                    {product.category?.name && (
                      <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                        {product.category.name}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 p-4 flex-1">
                    <h6 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-green-400 transition-colors duration-200">
                      {product.title}
                    </h6>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    {/* Stock */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${stock.dot}`}
                      />
                      <span
                        className={`text-[11px] font-semibold ${stock.color}`}
                      >
                        {stock.label}
                      </span>
                    </div>

                    {/* Price + Button */}
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
                      <strong className="text-green-400 font-black text-base">
                        EGP {product.price}
                      </strong>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-green-500/30 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
