import { useEffect, useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Tag, X, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

function Categories() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const [editingCategory, setEditingCategory] = useState(null)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/category", { credentials: "include" }).then(res => res.json()),
      fetch("/api/products", { credentials: "include" }).then(res => res.json()),
    ])
      .then(([catData, prodData]) => {
        setCategories(catData.categories || [])
        setProducts(prodData.products || [])
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // عدد المنتجات لكل كاتيجوري
  const productCounts = useMemo(() => {
    const map = new Map()
    products.forEach((p) => {
      const catId = p.category?._id || p.category
      if (!catId) return
      map.set(catId, (map.get(catId) || 0) + 1)
    })
    return map
  }, [products])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    setCreating(true)
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || "Failed to create category")
        return
      }
      setCategories(prev => [...prev, data.category])
      setNewName("")
      toast.success("Category added successfully")
    } catch (err) {
      toast.error(err.message || "Server error")
    } finally {
      setCreating(false)
    }
  }

  const openEdit = (category) => {
    setEditingCategory(category)
    setEditName(category.name)
  }

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingCategory) return
    setSaving(true)
    try {
      const res = await fetch(`/api/category/${editingCategory._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || "Failed to update category")
        return
      }
      setCategories(prev =>
        prev.map(c => (c._id === editingCategory._id ? data.category : c))
      )
      toast.success("Category updated successfully")
      setEditingCategory(null)
    } catch (err) {
      toast.error(err.message || "Server error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId) => {
    setDeletingId(categoryId)
    try {
      const res = await fetch(`/api/category/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || "Failed to delete category")
        return
      }
      setCategories(prev => prev.filter(c => c._id !== categoryId))
      toast.success("Category deleted successfully")
    } catch (err) {
      toast.error(err.message || "Server error")
    } finally {
      setDeletingId(null)
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h3 className="text-2xl font-black text-gray-800">Categories</h3>
        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          {categories.length} categories
        </span>
      </div>

      {/* Add Category */}
      <form
        onSubmit={handleCreate}
        className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5 flex items-center gap-3 mb-6"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name..."
          className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shrink-0"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Category
        </button>
      </form>

      {/* List */}
      {categories.length === 0 ? (
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
            <Tag className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">No categories yet</h2>
          <p className="text-gray-400 text-sm">Add your first category above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = productCounts.get(cat._id) || 0
            return (
              <div
                key={cat._id}
                className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500/15 border border-green-400/25 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{cat.name}</p>
                  <p className="text-gray-400 text-xs">
                    {count} product{count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 transition-all duration-200 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(cat._id)}
                    disabled={deletingId === cat._id}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === cat._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black text-lg">Edit Category</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 border border-white/15 hover:bg-white/5 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-gray-800 font-black text-lg mb-2">Delete Category</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete this category? This can't be undone.
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

export default Categories
