import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ImagePlus,
  Loader2,
  GalleryHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../config/api";

function HeroSlides() {
  const [slides, setSlides] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    product: "",
    eyebrow: "",
    title: "",
    highlight: "",
    description: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [creating, setCreating] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [editingSlide, setEditingSlide] = useState(null);
  const [editForm, setEditForm] = useState({
    product: "",
    eyebrow: "",
    title: "",
    highlight: "",
    description: "",
    image: null,
  });
  const [editPreview, setEditPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      apiFetch("/api/hero-slides", { credentials: "include" }).then((res) =>
        res.json(),
      ),
      apiFetch("/api/products", { credentials: "include" }).then((res) =>
        res.json(),
      ),
    ])
      .then(([slideData, prodData]) => {
        setSlides(slideData.slides || []);
        setProducts(prodData.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.product || !form.image) {
      toast.error("Please select a product and an image");
      return;
    }

    setCreating(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== "") formData.append(key, val);
      });

      const res = await apiFetch("/api/hero-slides", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to add slide");
        return;
      }
      setSlides((prev) => [...prev, data.slide]);
      setForm({
        product: "",
        eyebrow: "",
        title: "",
        highlight: "",
        description: "",
        image: null,
      });
      setPreview(null);
      toast.success("Slide added successfully");
    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (slide) => {
    setEditingSlide(slide);
    setEditForm({
      product: slide.product?._id || "",
      eyebrow: slide.eyebrow || "",
      title: slide.title || "",
      highlight: slide.highlight || "",
      description: slide.description || "",
      image: null,
    });
    setEditPreview(slide.image);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditForm((prev) => ({ ...prev, image: file }));
    setEditPreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async () => {
    if (!editingSlide || !editForm.product) return;
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, val]) => {
        if (val !== null && val !== "") formData.append(key, val);
      });

      const res = await apiFetch(`/api/hero-slides/${editingSlide._id}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to update slide");
        return;
      }
      setSlides((prev) =>
        prev.map((s) => (s._id === editingSlide._id ? data.slide : s)),
      );
      toast.success("Slide updated successfully");
      setEditingSlide(null);
    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slideId) => {
    setDeletingId(slideId);
    try {
      const res = await apiFetch(`/api/hero-slides/${slideId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to delete slide");
        return;
      }
      setSlides((prev) => prev.filter((s) => s._id !== slideId));
      toast.success("Slide deleted successfully");
    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h3 className="text-2xl font-black text-gray-800">Hero Slides</h3>
        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          {slides.length} slides
        </span>
      </div>

      {/* Add Slide Form */}
      <form
        onSubmit={handleCreate}
        className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2 flex items-center gap-4">
          <label className="shrink-0 w-28 h-28 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-green-400/50 transition-all">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlus className="w-6 h-6 text-gray-500" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <p className="text-gray-400 text-xs">
            Upload the slide image, pick the linked product, and optionally
            customize the slide text.
          </p>
        </div>

        <select
          value={form.product}
          onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
        >
          <option value="" className="text-black">
            Select product...
          </option>
          {products.map((p) => (
            <option key={p._id} value={p._id} className="text-black">
              {p.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={form.eyebrow}
          onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
          placeholder="Eyebrow (e.g. New Arrival)"
          className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
        />

        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Title (e.g. Summer)"
          className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
        />

        <input
          type="text"
          value={form.highlight}
          onChange={(e) =>
            setForm((f) => ({ ...f, highlight: e.target.value }))
          }
          placeholder="Highlight (e.g. Collection)"
          className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
        />

        <input
          type="text"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Short description"
          className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all md:col-span-2"
        />

        <button
          type="submit"
          disabled={creating}
          className="md:col-span-2 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add Slide
        </button>
      </form>

      {/* List */}
      {slides.length === 0 ? (
        <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
            <GalleryHorizontal className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">No slides yet</h2>
          <p className="text-gray-400 text-sm">Add your first slide above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className="bg-[#0B3D4A] border border-white/10 rounded-2xl overflow-hidden"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-36 object-cover"
              />
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {slide.title || slide.product?.title}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    Linked to: {slide.product?.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(slide)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 transition-all duration-200 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(slide._id)}
                    disabled={deletingId === slide._id}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {deletingId === slide._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black text-lg">Edit Slide</h3>
              <button
                onClick={() => setEditingSlide(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4">
                <label className="shrink-0 w-24 h-24 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-green-400/50 transition-all">
                  {editPreview ? (
                    <img
                      src={editPreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-gray-500" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-gray-400 text-xs">
                  Click the image to replace it, or leave as is.
                </p>
              </div>

              <select
                value={editForm.product}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, product: e.target.value }))
                }
                className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              >
                <option value="" className="text-black">
                  Select product...
                </option>
                {products.map((p) => (
                  <option key={p._id} value={p._id} className="text-black">
                    {p.title}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={editForm.eyebrow}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, eyebrow: e.target.value }))
                }
                placeholder="Eyebrow"
                className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              />

              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Title"
                className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              />

              <input
                type="text"
                value={editForm.highlight}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, highlight: e.target.value }))
                }
                placeholder="Highlight"
                className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              />

              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                className="bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSlide(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 border border-white/15 hover:bg-white/5 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editForm.product}
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
            <h3 className="text-gray-800 font-black text-lg mb-2">
              Delete Slide
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete this slide? This can't be undone.
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
                disabled={deletingId === confirmDeleteId}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroSlides;
