import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, ShoppingBag, Loader2, Truck } from "lucide-react";
import { useCart } from "../cart/UseCart";
import { useAuth } from "../auth/UseAuth";
import toast from "react-hot-toast";

function Checkout() {
  const { cart, totalItems, totalPrice, fetchCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phoneNumber || "",
    address: "",
    city: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeliveryAlert, setShowDeliveryAlert] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim()
    ) {
      toast.error("Please fill all the required fields");
      return;
    }

    // قبل ما نبعت الاوردر، نأكد للعميل إن مصاريف التوصيل عليه
    setShowDeliveryAlert(true);
  };

  const placeOrder = async () => {
    setShowDeliveryAlert(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to place order");
        setSubmitting(false);
        return;
      }

      toast.success("Order placed successfully");
      await fetchCart();
      navigate("/orders");
    } catch (err) {
      toast.error(err.message || "Unexpected error occurred");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Add some products before checking out.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
            >
              Browse Products
            </Link>
          </div>
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
            to="/cart"
            className="flex items-center gap-2 text-gray-500 hover:text-[#0B3D4A] text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <div className="w-px h-5 bg-gray-300" />
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-green-500 rounded-full" />
            <h1 className="text-2xl font-black text-gray-800">Checkout</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-[#0B3D4A] border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
          >
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
              <MapPin className="w-4 h-4 text-green-400" />
              Shipping Details
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="bg-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="01xxxxxxxxx"
                  className="bg-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, building, floor, apartment..."
                className="bg-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="bg-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Anything the delivery person should know..."
                className="bg-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none"
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-400">
              Payment method:{" "}
              <span className="text-white font-semibold">Cash on Delivery</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Placing Order..." : "Confirm Order"}
            </button>
          </form>

          {/* Order Summary */}
          <div>
            <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6 sticky top-24">
              <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-green-400" />
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div
                    key={item.product?._id || item.product}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                      {item.product?.coverImage && (
                        <img
                          src={`/api/images/${item.product.coverImage}`}
                          alt={item.product?.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">
                        {item.product?.title}
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-green-400 text-xs font-bold shrink-0">
                      EGP {item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
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
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Fee Confirmation - SweetAlert style */}
      {showDeliveryAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-yellow-50 border-2 border-yellow-300 flex items-center justify-center mx-auto mb-5">
              <Truck className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-gray-800 font-black text-lg mb-2">
              Delivery Fees
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Delivery fees are not included in the total and will be paid by
              you directly to the delivery person upon receiving your order.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeliveryAlert(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 cursor-pointer"
              >
                OK, I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
