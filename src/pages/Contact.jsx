import { useEffect, useState } from "react";
import { Mail, MapPin, Send, MessageSquare, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/UseAuth";

function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // اسم وإيميل اليوزر الداخل بيهم ثابتين، مش قابلين للتعديل
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
      }));
    }
  }, [user]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send message");
        return;
      }

      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all";

  const contactInfo = [
    { icon: Mail, label: "Email", value: "kzamezasupport@gmail.com" },
    { icon: MapPin, label: "Address", value: "Sohag, Egypt" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Hero */}
      <div className="bg-[#0B3D4A] py-16 px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-400/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Contact Us
          </div>
          <h1 className="text-4xl font-black text-white mb-4">
            Get In <span className="text-green-400">Touch</span>
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Have a question or need help? We're here for you. Fill out the form
            and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-black text-gray-800 mb-2">
            Contact Info
          </h3>
          {contactInfo.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-400/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-medium uppercase tracking-widest">
                  {label}
                </p>
                <p className="text-white text-sm font-semibold mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-[#0B3D4A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-400" /> Send a Message
          </h3>

          {success && (
            <div className="bg-green-500/10 border border-green-400/30 text-green-400 text-xs font-medium px-4 py-3 rounded-xl mb-5">
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          {!user && (
            <div className="bg-yellow-500/10 border border-yellow-400/30 text-yellow-400 text-xs font-medium px-4 py-3 rounded-xl mb-4">
              Please log in so we can attach your name and email to this
              message.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                Full Name <Lock className="w-3 h-3 text-gray-500" />
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                disabled
                placeholder="Ahmed Mohamed"
                className={inputClass + " opacity-60 cursor-not-allowed"}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                Email <Lock className="w-3 h-3 text-gray-500" />
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                placeholder="you@example.com"
                className={inputClass + " opacity-60 cursor-not-allowed"}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                Phone <Lock className="w-3 h-3 text-gray-500" />
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                disabled
                placeholder="01xxxxxxxxx"
                className={inputClass + " opacity-60 cursor-not-allowed"}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="How can we help?"
              className={inputClass}
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows={5}
              className={inputClass + " resize-none"}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              loading || !user || !form.name || !form.email || !form.message
            }
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
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default Contact;
