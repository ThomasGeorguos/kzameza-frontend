import { useEffect, useMemo, useState } from "react"
import { Search, Shield, ShieldOff, Trash2, Mail, Phone, Loader2, Users } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../../auth/UseAuth"

function Customers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

    fetch("/api/orders", { credentials: "include" })
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(err => console.error(err))
  }, [])

  // عدد الأوردرات وإجمالي الصرف لكل عميل
  const ordersByUser = useMemo(() => {
    const map = new Map()
    orders.forEach((order) => {
      const uid = order.user?._id || order.user
      const prev = map.get(uid) || { count: 0, total: 0 }
      prev.count += 1
      if (order.status !== "cancelled") prev.total += order.totalPrice || 0
      map.set(uid, prev)
    })
    return map
  }, [orders])

  const visibleUsers = useMemo(() => {
    let list = [...users]

    if (roleFilter !== "all") {
      list = list.filter(u => u.role === roleFilter)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        u =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.includes(q)
      )
    }

    return list
  }, [users, query, roleFilter])

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin"
    setUpdatingId(targetUser._id)
    try {
      const res = await fetch(`/api/users/${targetUser._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || "Failed to update role")
        return
      }
      setUsers(prev => prev.map(u => (u._id === targetUser._id ? data.user : u)))
      toast.success(`${targetUser.name} is now ${newRole === "admin" ? "an admin" : "a regular user"}`)
    } catch (err) {
      toast.error(err.message || "Server error")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (userId) => {
    setUpdatingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || "Failed to delete user")
        return
      }
      setUsers(prev => prev.filter(u => u._id !== userId))
      toast.success("User deleted successfully")
    } catch (err) {
      toast.error(err.message || "Server error")
    } finally {
      setUpdatingId(null)
      setConfirmDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-green-500 rounded-full" />
          <h3 className="text-2xl font-black text-gray-800">Customers</h3>
          <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            {users.length} users
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full sm:w-64 bg-white text-gray-800 placeholder-gray-400 text-sm rounded-xl px-4 py-2.5 pl-10 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white text-gray-800 text-sm rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all cursor-pointer"
          >
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Empty */}
      {visibleUsers.length === 0 ? (
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">No customers found</h2>
          <p className="text-gray-400 text-sm">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleUsers.map((u) => {
            const stats = ordersByUser.get(u._id) || { count: 0, total: 0 }
            const isSelf = currentUser?._id === u._id
            return (
              <div
                key={u._id}
                className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center gap-4"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-400/25 flex items-center justify-center text-green-400 font-bold text-sm shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">
                      {u.name} {isSelf && <span className="text-gray-500 font-normal">(you)</span>}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-1 text-xs text-gray-400 min-w-[180px]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    {u.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    {u.phoneNumber}
                  </span>
                </div>

                {/* Orders */}
                <div className="text-xs text-gray-400 min-w-[100px]">
                  <p className="text-white font-bold text-sm">{stats.count}</p>
                  <p>order{stats.count !== 1 ? "s" : ""}</p>
                </div>

                <div className="text-xs text-gray-400 min-w-[100px]">
                  <p className="text-green-400 font-black text-sm">EGP {stats.total.toLocaleString()}</p>
                  <p>total spent</p>
                </div>

                {/* Role Badge */}
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${
                    u.role === "admin"
                      ? "text-green-400 bg-green-400/10 border-green-400/30"
                      : "text-gray-400 bg-white/5 border-white/10"
                  }`}
                >
                  {u.role === "admin" ? "Admin" : "User"}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleRole(u)}
                    disabled={isSelf || updatingId === u._id}
                    title={isSelf ? "You can't change your own role" : ""}
                    className="p-2 rounded-lg bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {updatingId === u._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : u.role === "admin" ? (
                      <ShieldOff className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(u._id)}
                    disabled={isSelf}
                    title={isSelf ? "You can't delete your own account" : ""}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-gray-800 font-black text-lg mb-2">Delete Customer</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete this account? This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all duration-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
