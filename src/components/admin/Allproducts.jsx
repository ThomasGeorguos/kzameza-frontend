import { useEffect, useState } from "react";
import { Pencil, Trash2, Star, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../config/api";

function AllProducts() {
  const [products, setProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    apiFetch("/api/products", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProductList(data.products || []))
      .catch((error) => console.error("Error fetching products", error));

    apiFetch("/api/category", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((error) => console.error("Error fetching categories", error));
  }, []);

  // فتح مودال التعديل ومليه بالبيانات الحالية للمنتج
  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      title: product.title || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category: product.category?._id || product.category || "",
      isFeatured: !!product.isFeatured,
      isOnSale: !!product.isOnSale,
      discountPercent: product.discountPercent || "",
    });
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditForm(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update product");
        return;
      }
      setProductList((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? data.product : p)),
      );
      toast.success("Product updated successfully");
      closeEdit();
    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    setDeletingId(productId);
    try {
      const res = await apiFetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete product");
        return;
      }
      setProductList((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="px-6 py-10">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h3 className="text-2xl font-black text-gray-800">All Products</h3>
        <span className="ml-2 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          {products.length} items
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {products?.map((product) => (
          <div
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

              {/* Featured Badge — يظهر بس لو isFeatured */}
              {product?.isFeatured && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#0B3D4A] text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-400/30">
                  <Star className="w-3 h-3 fill-green-400" />
                  Featured
                </div>
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

              {/* Price + Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <strong className="text-green-400 font-black text-base">
                  EGP {product?.price}
                </strong>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 transition-all duration-200 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(product._id)}
                    disabled={deletingId === product._id}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === product._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black text-lg">Edit Product</h3>
              <button
                onClick={closeEdit}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Price (EGP)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    min="0"
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={editForm.stock}
                    onChange={handleEditChange}
                    min="0"
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Category
                </label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full bg-[#0e4d5e] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {editForm.isOnSale && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Discount Percent
                  </label>
                  <input
                    type="text"
                    name="discountPercent"
                    value={editForm.discountPercent}
                    onChange={handleEditChange}
                    placeholder="e.g. 20%"
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
                  />
                </div>
              )}

              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-white text-sm font-medium">Featured</p>
                <button
                  onClick={() =>
                    setEditForm((prev) => ({
                      ...prev,
                      isFeatured: !prev.isFeatured,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${editForm.isFeatured ? "bg-green-500" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${editForm.isFeatured ? "left-5.5" : "left-0.5"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-white text-sm font-medium">On Sale</p>
                <button
                  onClick={() =>
                    setEditForm((prev) => ({
                      ...prev,
                      isOnSale: !prev.isOnSale,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${editForm.isOnSale ? "bg-green-500" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${editForm.isOnSale ? "left-5.5" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEdit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 border border-white/15 hover:bg-white/5 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm - SweetAlert style */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-gray-800 font-black text-lg mb-2">
              Delete Product
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete this product? This can't be
              undone.
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
  );
}

export default AllProducts;
