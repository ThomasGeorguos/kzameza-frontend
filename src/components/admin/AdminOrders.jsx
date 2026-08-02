import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Phone, Mail, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../config/api";

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

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];
const FILTER_TABS = ["pending", "confirmed", "cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("pending");

  const fetchOrders = () => {
    setLoading(true);
    apiFetch("/api/orders", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update order");
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? data.order : o)),
      );
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err.message || "Unexpected error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => o.status === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h3 className="text-2xl font-black text-gray-800">Orders</h3>
        <span className="ml-2 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          {orders.length} orders
        </span>
      </div>

      {/* Filter Toggle */}
      <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-8">
        {FILTER_TABS.map((tab) => {
          const count = orders.filter((o) => o.status === tab).length;
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#0B3D4A] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {STATUS_STYLES[tab].label}
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">
            No {STATUS_STYLES[activeFilter].label.toLowerCase()} orders
          </h2>
          <p className="text-gray-400 text-sm">
            Orders with this status will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => {
            const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            const isOpen = openId === order._id;
            return (
              <div
                key={order._id}
                className="bg-[#0B3D4A] border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Row */}
                <div className="w-full flex flex-wrap items-center gap-4 p-5">
                  <button
                    onClick={() => setOpenId(isOpen ? null : order._id)}
                    className="flex-1 min-w-[180px] flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div>
                      <p className="text-white font-bold text-sm">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {order.user?.name || "Unknown"} ·{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </button>

                  <div className="text-xs text-gray-400">
                    {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                  </div>

                  <p className="text-green-400 font-black text-base">
                    EGP {order.totalPrice}
                  </p>

                  {/* Status selector */}
                  <select
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border bg-transparent outline-none cursor-pointer disabled:opacity-50 ${status.bg} ${status.color}`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-[#0B3D4A] text-white"
                      >
                        {STATUS_STYLES[opt].label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setOpenId(isOpen ? null : order._id)}
                    className="cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Details */}
                {isOpen && (
                  <div className="border-t border-white/10 p-5 flex flex-col gap-5">
                    {/* Customer */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-gray-300">
                        <Mail className="w-4 h-4 text-green-400 shrink-0" />
                        {order.user?.email}
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-gray-300">
                        <Phone className="w-4 h-4 text-green-400 shrink-0" />
                        {order.user?.phoneNumber}
                      </div>
                    </div>

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
  );
}

export default AdminOrders;
