import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ShoppingBag,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ── Password Strength ──
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1)
    return {
      score,
      label: "Very Weak",
      color: "bg-red-500",
      text: "text-red-400",
    };
  if (score === 2)
    return {
      score,
      label: "Weak",
      color: "bg-orange-500",
      text: "text-orange-400",
    };
  if (score === 3)
    return {
      score,
      label: "Fair",
      color: "bg-yellow-500",
      text: "text-yellow-400",
    };
  if (score === 4)
    return {
      score,
      label: "Strong",
      color: "bg-green-500",
      text: "text-green-400",
    };
  return {
    score,
    label: "Very Strong",
    color: "bg-green-400",
    text: "text-green-300",
  };
};

// ── Validations ──
const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < 4) return "Name must be at least 4 characters";
  if (name.length > 20) return "Name must not exceed 20 characters";
  return "";
};

const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
    return "Invalid email format";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password))
    return "Password must contain both letters and numbers";
  return "";
};

const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  if (!/^(010|011|012|015)[0-9]{8}$/.test(phone))
    return "Must start with 010, 011, 012, or 015 followed by 8 digits";
  return "";
};

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Name max length enforcement
    if (name === "name" && value.length > 20) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    setServerError("");

    // Live validation after touched
    if (touched[name]) {
      const validators = {
        name: validateName,
        email: validateEmail,
        password: validatePassword,
        phoneNumber: validatePhone,
      };
      setErrors((prev) => ({
        ...prev,
        [name]: validators[name]?.(value) || "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validators = {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
      phoneNumber: validatePhone,
    };
    setErrors((prev) => ({ ...prev, [name]: validators[name]?.(value) || "" }));
  };

  const validate = () => {
    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      phoneNumber: validatePhone(form.phoneNumber),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, phoneNumber: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/login", { replace: true });
      } else {
        setServerError(data.message || "Something went wrong");
      }
    } catch (err) {
      setServerError("Server error, please try again", err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-white/5 border text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-all
    ${
      errors[field] && touched[field]
        ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20"
        : "border-white/10 focus:border-green-400 focus:ring-green-400/20"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-[#0B3D4A] border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Create Account</h2>
            <p className="text-gray-400 text-sm mt-1">Join Kza Meza today</p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-400 text-xs font-medium px-4 py-3 rounded-xl mb-5">
              <XCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="flex flex-col gap-5">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <User className="w-3 h-3 text-green-400" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ahmed Mohamed"
                className={inputClass("name")}
              />
              <div className="flex items-center justify-between mt-1.5">
                {errors.name && touched.name ? (
                  <p className="text-red-400 text-[11px] flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {errors.name}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-[11px] ${form.name.length > 16 ? "text-yellow-400" : "text-gray-500"}`}
                >
                  {form.name.length}/20
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-green-400" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={inputClass("email")}
              />
              {errors.email && touched.email && (
                <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1.5">
                  <XCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
              {!errors.email && touched.email && form.email && (
                <p className="text-green-400 text-[11px] flex items-center gap-1 mt-1.5">
                  <CheckCircle className="w-3 h-3" /> Valid email
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-green-400" /> Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="01xxxxxxxxx"
                className={inputClass("phoneNumber")}
              />
              {errors.phoneNumber && touched.phoneNumber ? (
                <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1.5">
                  <XCircle className="w-3 h-3" /> {errors.phoneNumber}
                </p>
              ) : (
                <p className="text-gray-500 text-[11px] mt-1.5">
                  Format: 01xxxxxxxxx
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-green-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={inputClass("password") + " pr-10"}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300
                          ${i <= passwordStrength.score ? passwordStrength.color : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-[11px] font-semibold ${passwordStrength.text}`}
                  >
                    {passwordStrength.label}
                  </p>
                </div>
              )}

              {errors.password && touched.password && (
                <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1.5">
                  <XCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
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
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          <p className="text-center text-gray-400 text-sm mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-400 font-semibold hover:text-green-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
