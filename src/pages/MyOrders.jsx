import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Package, ChevronDown, MapPin } from "lucide-react";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
  },
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetch("/api/orders/my", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0B3D4A] border border-white/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">My Orders</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Empty */}
        {orders.length === 0 ? (
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
              <Package className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your placed orders will show up here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 cursor-pointer"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const status =
                STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              const isOpen = openId === order._id;
              return (
                <div
                  key={order._id}
                  className="bg-[#0B3D4A] border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Row */}
                  <button
                    onClick={() => setOpenId(isOpen ? null : order._id)}
                    className="w-full flex flex-wrap items-center gap-4 p-5 text-left cursor-pointer"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <p className="text-white font-bold text-sm">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-xs text-gray-400">
                      {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                    </div>

                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>

                    <p className="text-green-400 font-black text-base">
                      EGP {order.totalPrice}
                    </p>

                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Details */}
                  {isOpen && (
                    <div className="border-t border-white/10 p-5 flex flex-col gap-5">
                      {/* Items */}
                      <div className="flex flex-col gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              {item.coverImage && (
                                <img
                                  src={`/api/images/${item.coverImage}`}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold truncate">
                                {item.title}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {item.quantity} x EGP {item.price}
                              </p>
                            </div>
                            <p className="text-green-400 text-sm font-bold shrink-0">
                              EGP {item.price * item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping */}
                      <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
                        <MapPin className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <div className="text-xs text-gray-300 leading-relaxed">
                          <p className="font-semibold text-white">
                            {order.shippingAddress?.fullName} ·{" "}
                            {order.shippingAddress?.phone}
                          </p>
                          <p>
                            {order.shippingAddress?.address},{" "}
                            {order.shippingAddress?.city}
                          </p>
                          {order.shippingAddress?.notes && (
                            <p className="text-gray-400 mt-1">
                              Note: {order.shippingAddress.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
