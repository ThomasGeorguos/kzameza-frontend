import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Star, Tag, Package } from "lucide-react";
import { useCart } from "../cart/useCart";
import toast from "react-hot-toast";
import { apiFetch } from "../config/api";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!product?.category) return;
    apiFetch(`/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = (data.products || [])
          .filter(
            (p) =>
              p._id !== id &&
              (p.category === product.category ||
                p.category?._id === product.category?._id ||
                p.category === product.category?._id),
          )
          .slice(0, 4);
        setRelated(filtered);
      })
      .catch((err) => console.error(err));
  }, [product, id]);

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "text-red-400",
        dot: "bg-red-400",
        bg: "bg-red-500/10 border-red-400/30",
      };
    if (stock === 1)
      return {
        label: "1 in stock",
        color: "text-yellow-400",
        dot: "bg-yellow-400",
        bg: "bg-yellow-500/10 border-yellow-400/30",
      };
    return {
      label: `${stock} in stock`,
      color: "text-green-400",
      dot: "bg-green-400",
      bg: "bg-green-500/10 border-green-400/30",
    };
  };

  const handleAddToCart = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin w-10 h-10 text-[#0B3D4A]"
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
          <p className="text-[#0B3D4A] text-sm font-semibold">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-4">Product not found</p>
          <Link
            to="/"
            className="text-green-500 font-semibold hover:text-green-600"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const stock = getStockStatus(product.stock);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0B3D4A] text-sm font-medium transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Main Card */}
        <div className="bg-[#0B3D4A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div
              className="relative bg-white/5 flex items-center justify-center p-10"
              style={{ minHeight: "520px" }}
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #fff 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {product.coverImage ? (
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="relative z-10 w-full h-full object-contain max-h-96"
                  style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))" }}
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-500" />
                </div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <span className="text-white font-black text-base bg-red-500 px-5 py-2 rounded-full shadow-lg">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                {product.isFeatured && (
                  <span className="inline-flex items-center gap-1 bg-[#0B3D4A]/90 text-green-400 text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-green-400/30 backdrop-blur-sm">
                    <Star className="w-3 h-3 fill-green-400" /> Featured
                  </span>
                )}
                {product.isOnSale && (
                  <span className="inline-flex items-center gap-1 bg-[#0B3D4A]/90 text-yellow-400 text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-yellow-400/30 backdrop-blur-sm">
                    <Tag className="w-3 h-3" />
                    {product.discountPercent
                      ? `${product.discountPercent}% OFF`
                      : "On Sale"}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-10 flex flex-col border-l border-white/10">
              {/* 1 - Title */}
              <h1 className="text-3xl font-black text-white leading-tight mb-4">
                {product.title}
              </h1>

              <div className="w-full h-px bg-white/10 mb-5" />

              {/* 2 - Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-5">
                {product.description}
              </p>

              <div className="w-full h-px bg-white/10 mb-5" />

              {/* 3 - Price */}
              <div className="flex items-end gap-3 mb-5">
                <span className="text-green-400 font-black text-4xl">
                  EGP {product.price}
                </span>
                {product.isOnSale && product.discountPercent && (
                  <div className="flex flex-col mb-1">
                    <span className="text-gray-500 line-through text-sm">
                      EGP{" "}
                      {Math.round(
                        product.price /
                          (1 - parseInt(product.discountPercent) / 100),
                      )}
                    </span>
                    <span className="text-yellow-400 text-xs font-bold">
                      Save {product.discountPercent}%
                    </span>
                  </div>
                )}
              </div>

              {/* 4 - Stock */}
              <div
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-full w-fit mb-5 ${stock.bg}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${stock.dot} animate-pulse`}
                />
                <span className={`text-xs font-bold ${stock.color}`}>
                  {stock.label}
                </span>
              </div>

              <div className="w-full h-px bg-white/10 mb-5" />

              {/* Extra Info */}
              <div className="grid grid-cols-2 gap-3 mb-auto">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">
                    Category
                  </p>
                  <p className="text-white text-xs font-bold">
                    {product.category?.name || "General"}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">
                    Availability
                  </p>
                  <p
                    className={`text-xs font-bold ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {product.stock > 0 ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>

              {/* Add to Cart — في الآخر */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 cursor-pointer mt-6"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 bg-green-500 rounded-full" />
              <h3 className="text-xl font-black text-gray-800">
                Related Products
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => {
                const s = getStockStatus(p.stock);
                return (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="group bg-[#0B3D4A] border border-white/10 rounded-2xl overflow-hidden hover:border-green-400/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className="relative bg-white/5 overflow-hidden"
                      style={{ height: "200px" }}
                    >
                      {p.coverImage && (
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold bg-red-500 px-2 py-0.5 rounded-full">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-white text-xs font-bold line-clamp-1 group-hover:text-green-400 transition-colors">
                        {p.title}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-green-400 text-xs font-black">
                          EGP {p.price}
                        </p>
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                          />
                          <span
                            className={`text-[10px] font-semibold ${s.color}`}
                          >
                            {s.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
