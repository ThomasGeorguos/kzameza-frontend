import { useState, useEffect } from "react";
import {
  PackagePlus,
  Upload,
  Tag,
  DollarSign,
  Layers,
  Image,
  ToggleLeft,
  Percent,
} from "lucide-react";
import { apiFetch } from "../../config/api";

function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    isFeatured: false,
    isOnSale: false,
    discountPercent: "",
    category: "",
    coverImage: null,
  });

  useEffect(() => {
    apiFetch("/api/category", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data?.categories);
      })
      .catch((err) => console.error("Error fetching categories", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, coverImage: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== "") formData.append(key, val);
      });
      const res = await apiFetch("/api/products", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Product added successfully!");
        setForm({
          title: "",
          description: "",
          price: "",
          stock: "",
          isFeatured: false,
          isOnSale: false,
          discountPercent: "",
          category: "",
          coverImage: null,
        });
        setPreview(null);
      } else {
        alert(data.message || data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center">
          <PackagePlus className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#0B3D4A]">Add New Product</h2>
          <p className="text-gray-700 text-xs mt-0.5">
            Fill in the details below to add a product
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Main Fields */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Title */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-green-400" /> Product Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones Pro"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
            />
          </div>

          {/* Description */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-green-400" /> Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all resize-none"
            />
          </div>

          {/* Price + Stock */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-green-400" /> Price
                  (EGP)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-green-400" /> Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-green-400" /> Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
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

          {/* Sale Options */}
          {form.isOnSale && (
            <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Percent className="w-3.5 h-3.5 text-green-400" /> Discount
                Percent
              </label>
              <input
                type="text"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                placeholder="e.g. 20%"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              />
            </div>
          )}
        </div>

        {/* RIGHT — Image + Toggles */}
        <div className="flex flex-col gap-5">
          {/* Cover Image */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Image className="w-3.5 h-3.5 text-green-400" /> Cover Image
            </label>

            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-square">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-contain bg-white/5 p-2"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <Upload className="w-4 h-4" /> Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/15 hover:border-green-400/50 rounded-xl aspect-square flex flex-col items-center justify-center gap-3 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-400/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-xs font-semibold">
                      Click to upload
                    </p>
                    <p className="text-gray-500 text-[10px] mt-1">
                      PNG, JPG, WEBP
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Toggles */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <ToggleLeft className="w-3.5 h-3.5 text-green-400" /> Options
            </label>

            {/* isFeatured */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Featured</p>
                <p className="text-gray-500 text-[11px]">Show on homepage</p>
              </div>
              <button
                onClick={() =>
                  setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.isFeatured ? "bg-green-500" : "bg-white/15"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form.isFeatured ? "left-5.5" : "left-0.5"}`}
                />
              </button>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* isOnSale */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">On Sale</p>
                <p className="text-gray-500 text-[11px]">Enable discount</p>
              </div>
              <button
                onClick={() =>
                  setForm((prev) => ({ ...prev, isOnSale: !prev.isOnSale }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.isOnSale ? "bg-green-500" : "bg-white/15"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form.isOnSale ? "left-5.5" : "left-0.5"}`}
                />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Adding...
              </>
            ) : (
              <>
                <PackagePlus className="w-4 h-4" />
                Add Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
