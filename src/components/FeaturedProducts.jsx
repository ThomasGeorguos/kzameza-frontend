import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useCart } from "../cart/useCart";
import toast from "react-hot-toast";
import { apiFetch } from "../config/api";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [adding, setAdding] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    apiFetch("/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => setProducts(data.products || []))
      .catch((error) => console.error("Error fetching products", error))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (product) => {
    if (adding[product._id]) return;

    setAdding((prev) => ({
      ...prev,
      [product._id]: true,
    }));

    try {
      const { success, message } = await addToCart(product._id, product.price);

      if (success) {
        toast.success("Product added to cart successfully");
      } else {
        toast.error(message || "Product out of stock");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setAdding((prev) => ({
        ...prev,
        [product._id]: false,
      }));
    }
  };

  // نجمع المنتجات حسب الكاتيجوري بتاعتها، وناخد أول 4 من كل واحدة
  const categorySections = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      const category = product.category;
      if (!category?._id) return;

      if (!map.has(category._id)) {
        map.set(category._id, {
          _id: category._id,
          name: category.name,
          products: [],
        });
      }
      map.get(category._id).products.push(product);
    });

    return Array.from(map.values()).filter((cat) => cat.products.length > 0);
  }, [products]);

  if (loading) {
    return (
      <div className="px-6 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 flex flex-col gap-12">
      {categorySections.map((category) => (
        <div key={category._id}>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-green-500 rounded-full" />
              <h3 className="text-2xl font-black text-gray-800">
                {category.name}
              </h3>
              <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                {category.products.length} items
              </span>
            </div>

            <Link
              to={`/category/${category._id}`}
              className="flex items-center gap-1 text-sm font-semibold text-[#0B3D4A] hover:text-green-600 transition-colors duration-200 cursor-pointer shrink-0"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid - 4 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {category.products.slice(0, 4).map((product) => (
              <Link
                to={`/products/${product._id}`}
                key={product._id}
                className="group flex flex-col bg-[#0B3D4A] border border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div
                  className="relative bg-white/5 overflow-hidden"
                  style={{ height: "280px" }}
                >
                  {product?.coverImage && (
                    <img
                      src={product.coverImage}
                      alt={product?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 p-4 flex-1">
                  <h6 className="font-bold text-white text-sm leading-snug line-clamp-2">
                    {product?.title}
                  </h6>

                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1 font-medium">
                    {product?.description}
                  </p>

                  {/* Price + Button */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <strong className="text-green-400 font-black text-base">
                      EGP {product?.price}
                    </strong>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={adding[product._id]}
                      className={`flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-green-500/30 hover:-translate-y-0.5 ${
                        adding[product._id]
                          ? "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none"
                          : "cursor-pointer"
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {adding[product._id] ? "Adding..." : "Add to cart"}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeaturedProducts;
