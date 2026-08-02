import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Tag,
  BarChart2,
  Star,
  Wallet,
  ClipboardList,
  Clock,
  XCircle,
  Award,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../config/api";

export function Analytics() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    apiFetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error(err));

    apiFetch("/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err));

    apiFetch("/api/orders", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch((err) => console.error(err));
  }, []);

  // منتجات
  const totalProducts = products.length;
  const featuredCount = products.filter((p) => p.isFeatured).length;
  const onSaleCount = products.filter((p) => p.isOnSale).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  // أوردرات - الملغي مش بيتحسب ضمن الإيرادات
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce(
    (acc, o) => acc + (o.totalPrice || 0),
    0,
  );
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const avgOrderValue = validOrders.length
    ? (totalRevenue / validOrders.length).toFixed(2)
    : 0;

  // مبيعات آخر 6 شهور
  const monthlySales = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en-US", { month: "short" }),
        total: 0,
      });
    }

    validOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.total += order.totalPrice || 0;
    });

    return months;
  }, [validOrders]);

  const maxMonthly = Math.max(...monthlySales.map((m) => m.total), 1);

  // أكتر المنتجات مبيعًا (حسب الكمية في الأوردرات الصحيحة)
  const topSelling = useMemo(() => {
    const map = new Map();
    validOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.product?.toString?.() || item.product;
        const prev = map.get(key) || { title: item.title, qty: 0, revenue: 0 };
        prev.qty += item.quantity;
        prev.revenue += item.quantity * item.price;
        map.set(key, prev);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [validOrders]);

  // منتجات لكل كاتيجوري
  const categoryStats = categories
    .map((cat) => ({
      name: cat.name,
      count: products.filter(
        (p) => p.category === cat._id || p.category?._id === cat._id,
      ).length,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...categoryStats.map((c) => c.count), 1);

  const statCards = [
    {
      icon: Package,
      label: "Total Products",
      value: totalProducts,
      color: "text-green-400",
      bg: "bg-green-500/15",
      border: "border-green-400/25",
    },
    {
      icon: Star,
      label: "Featured",
      value: featuredCount,
      color: "text-yellow-400",
      bg: "bg-yellow-500/15",
      border: "border-yellow-400/25",
    },
    {
      icon: Tag,
      label: "On Sale",
      value: onSaleCount,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      border: "border-blue-400/25",
    },
    {
      icon: ShoppingBag,
      label: "Out of Stock",
      value: outOfStock,
      color: "text-red-400",
      bg: "bg-red-500/15",
      border: "border-red-400/25",
    },
    {
      icon: TrendingUp,
      label: "Total Stock",
      value: totalStock,
      color: "text-purple-400",
      bg: "bg-purple-500/15",
      border: "border-purple-400/25",
    },
    {
      icon: Wallet,
      label: "Total Revenue (EGP)",
      value: totalRevenue.toLocaleString(),
      color: "text-green-400",
      bg: "bg-green-500/15",
      border: "border-green-400/25",
    },
  ];

  const orderCards = [
    {
      icon: ClipboardList,
      label: "Total Orders",
      value: totalOrders,
      color: "text-white",
      bg: "bg-white/10",
      border: "border-white/15",
      to: "/admin/orders",
    },
    {
      icon: Clock,
      label: "Pending",
      value: pendingOrders,
      color: "text-yellow-400",
      bg: "bg-yellow-500/15",
      border: "border-yellow-400/25",
      to: "/admin/orders",
    },
    {
      icon: Award,
      label: "Confirmed",
      value: confirmedOrders,
      color: "text-green-400",
      bg: "bg-green-500/15",
      border: "border-green-400/25",
      to: "/admin/orders",
    },
    {
      icon: XCircle,
      label: "Cancelled",
      value: cancelledOrders,
      color: "text-red-400",
      bg: "bg-red-500/15",
      border: "border-red-400/25",
      to: "/admin/orders",
    },
    {
      icon: Wallet,
      label: "Avg Order Value",
      value: `EGP ${avgOrderValue}`,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      border: "border-blue-400/25",
      to: null,
    },
  ];

  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h3 className="text-2xl font-black text-gray-800">Dashboard</h3>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div
            key={label}
            className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
          >
            <div
              className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-medium">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {orderCards.map(
          ({ icon: Icon, label, value, color, bg, border, to }) => {
            const Wrapper = to ? Link : "div";
            return (
              <Wrapper
                key={label}
                to={to || undefined}
                className={`bg-[#0B3D4A] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 ${to ? "hover:border-green-400/30 transition-colors duration-200 cursor-pointer" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] font-medium">
                    {label}
                  </p>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                </div>
              </Wrapper>
            );
          },
        )}
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6 mb-6">
        <h4 className="text-white font-bold text-sm mb-8 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          Monthly Sales (Last 6 Months)
        </h4>

        <div
          className="flex items-end justify-between gap-3"
          style={{ height: "180px" }}
        >
          {monthlySales.map(({ label, total }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
            >
              <span className="text-green-400 text-[11px] font-bold">
                {total > 0 ? total.toLocaleString() : ""}
              </span>
              <div
                className="w-full max-w-10 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-700"
                style={{
                  height: `${Math.max((total / maxMonthly) * 100, total > 0 ? 4 : 1)}%`,
                }}
              />
              <span className="text-gray-400 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Products per Category Chart */}
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-green-400" />
            Products per Category
          </h4>

          {categoryStats.length === 0 ? (
            <p className="text-gray-500 text-sm">No data available</p>
          ) : (
            <div className="flex flex-col gap-4">
              {categoryStats.map(({ name, count }) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="text-gray-300 text-xs font-medium w-28 shrink-0 truncate">
                    {name}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-green-400 text-xs font-black w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-green-400" />
            Top Selling Products
          </h4>

          {topSelling.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {topSelling.map((item, i) => (
                <div key={item.title + i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-green-500/15 border border-green-400/25 text-green-400 text-[11px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-300 text-sm flex-1 truncate">
                    {item.title}
                  </span>
                  <span className="text-white text-xs font-semibold">
                    {item.qty} sold
                  </span>
                  <span className="text-green-400 text-xs font-black w-20 text-right">
                    EGP {item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Low Stock Alert
          </h4>

          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">
              All products are well stocked
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm truncate">
                    {p.title}
                  </span>
                  <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 border border-yellow-400/25 px-2 py-1 rounded-full shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Distribution */}
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-400" />
            Price Distribution
          </h4>
          <div className="flex flex-col gap-4">
            {[
              {
                label: "Under 500 EGP",
                count: products.filter((p) => p.price < 500).length,
              },
              {
                label: "500 – 2000 EGP",
                count: products.filter((p) => p.price >= 500 && p.price <= 2000)
                  .length,
              },
              {
                label: "Over 2000 EGP",
                count: products.filter((p) => p.price > 2000).length,
              },
            ].map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <p className="text-gray-300 text-sm font-medium">{label}</p>
                <span className="text-green-400 font-black text-lg">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
