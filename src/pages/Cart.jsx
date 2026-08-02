import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/useCart";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

function Cart() {
  const {
    cart,
    totalItems,
    totalPrice,
    removeFromCart,
    updateCart,
    clearCart,
    loading,
  } = useCart();
  const navigate = useNavigate();

  const handleIncrease = async (item) => {
    const availableStock = item.product?.stock ?? Infinity;
    if (item.quantity + 1 > availableStock) {
      toast.error(`Only ${availableStock} in stock`);
      return;
    }
    await updateCart(item.product?._id || item.product, item.quantity + 1);
  };

  const handleDecrease = async (item) => {
    if (item.quantity - 1 < 1) {
      await removeFromCart(item.product?._id || item.product);
    } else {
      await updateCart(item.product?._id || item.product, item.quantity - 1);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-500 hover:text-[#0B3D4A] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <div className="w-px h-5 bg-gray-300" />
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-green-500 rounded-full" />
            <h1 className="text-2xl font-black text-gray-800">Shopping Cart</h1>
            <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              {totalItems} items
            </span>
          </div>
        </div>

        {!cart || cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Add some products to get started.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
            >
              <ShoppingCart className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 transition-all duration-200"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    {item.product?.coverImage && (
                      <img
                        src={item.product.coverImage}
                        alt={item.product?.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm leading-snug line-clamp-1">
                      {item.product?.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                      {item.product?.description}
                    </p>
                    <p className="text-green-400 font-black text-base mt-1">
                      EGP {item.price}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="text-white font-black text-sm w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => handleIncrease(item)}
                      disabled={
                        item.quantity >= (item.product?.stock ?? Infinity)
                      }
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-green-500/20 hover:text-green-400 text-gray-300 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-gray-400 text-xs">Subtotal</p>
                    <p className="text-white font-black text-sm">
                      EGP {item.price * item.quantity}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() =>
                      removeFromCart(item.product?._id || item.product)
                    }
                    className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all duration-200 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-green-400" />
                  Order Summary
                </h2>

                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Items</span>
                    <span className="text-white text-sm font-medium">
                      {totalItems}
                    </span>
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-green-400 font-black text-xl">
                      EGP {totalPrice}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 cursor-pointer"
                >
                  Checkout
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-sm font-medium text-red-400 border border-red-400/30 rounded-xl py-2.5 hover:bg-red-500/10 hover:border-red-400 transition-all duration-200 cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
