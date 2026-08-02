import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Settings,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../auth/UseAuth";
import { apiFetch } from "../config/api";

// ── Validations ──
const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < 4) return "Name must be at least 4 characters";
  if (name.length > 20) return "Name must not exceed 20 characters";
  return "";
};

const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  if (!/^(010|011|012|015)[0-9]{8}$/.test(phone))
    return "Must start with 010, 011, 012, or 015 followed by 8 digits";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password))
    return "Password must contain both letters and numbers";
  return "";
};

// ── Password Strength ──
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "", text: "" };
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

function UserSettings() {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState({ name: "", phoneNumber: "" });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileTouched, setProfileTouched] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const [password, setPassword] = useState({
    oldPass: "",
    newPass: "",
    confirm: "",
  });
  const [passErrors, setPassErrors] = useState({});
  const [passTouched, setPassTouched] = useState({});
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  const passwordStrength = getPasswordStrength(password.newPass);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const inputClass = (err, touched) =>
    `w-full bg-white/5 border text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-all
    ${
      err && touched
        ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20"
        : "border-white/10 focus:border-green-400 focus:ring-green-400/20"
    }`;

  // ── Profile Handlers ──
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && value.length > 20) return;
    setProfile((p) => ({ ...p, [name]: value }));
    if (profileTouched[name]) {
      const validators = { name: validateName, phoneNumber: validatePhone };
      setProfileErrors((prev) => ({
        ...prev,
        [name]: validators[name]?.(value) || "",
      }));
    }
  };

  const handleProfileBlur = (e) => {
    const { name, value } = e.target;
    setProfileTouched((prev) => ({ ...prev, [name]: true }));
    const validators = { name: validateName, phoneNumber: validatePhone };
    setProfileErrors((prev) => ({
      ...prev,
      [name]: validators[name]?.(value) || "",
    }));
  };

  const handleProfileSave = async () => {
    if (!user) return;
    const newErrors = {
      name: validateName(profile.name),
      phoneNumber: validatePhone(profile.phoneNumber),
    };
    setProfileErrors(newErrors);
    setProfileTouched({ name: true, phoneNumber: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setProfileLoading(true);
    try {
      const res = await apiFetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, user.role);
        setProfileMsg({
          type: "success",
          text: "Profile updated successfully!",
        });
      } else {
        setProfileMsg({
          type: "error",
          text: data.message || "Something went wrong",
        });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Server error, please try again" });
    } finally {
      setProfileLoading(false);
      setTimeout(() => setProfileMsg({ type: "", text: "" }), 3000);
    }
  };

  // ── Password Handlers ──
  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassword((p) => ({ ...p, [name]: value }));
    if (passTouched[name]) {
      if (name === "newPass")
        setPassErrors((prev) => ({
          ...prev,
          newPass: validatePassword(value),
        }));
      if (name === "confirm")
        setPassErrors((prev) => ({
          ...prev,
          confirm: value !== password.newPass ? "Passwords do not match" : "",
        }));
      if (name === "oldPass")
        setPassErrors((prev) => ({
          ...prev,
          oldPass: !value ? "Current password is required" : "",
        }));
    }
  };

  const handlePassBlur = (e) => {
    const { name, value } = e.target;
    setPassTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "newPass")
      setPassErrors((prev) => ({ ...prev, newPass: validatePassword(value) }));
    if (name === "confirm")
      setPassErrors((prev) => ({
        ...prev,
        confirm: value !== password.newPass ? "Passwords do not match" : "",
      }));
    if (name === "oldPass")
      setPassErrors((prev) => ({
        ...prev,
        oldPass: !value ? "Current password is required" : "",
      }));
  };

  const handlePasswordSave = async () => {
    if (!user) return;
    const newErrors = {
      oldPass: !password.oldPass ? "Current password is required" : "",
      newPass: validatePassword(password.newPass),
      confirm:
        password.newPass !== password.confirm ? "Passwords do not match" : "",
    };
    setPassErrors(newErrors);
    setPassTouched({ oldPass: true, newPass: true, confirm: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setPassLoading(true);
    try {
      const res = await apiFetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          password: password.newPass,
          oldPassword: password.oldPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg({ type: "success", text: "Password updated successfully!" });
        setPassword({ oldPass: "", newPass: "", confirm: "" });
        setPassTouched({});
      } else {
        setPassMsg({
          type: "error",
          text: data.message || "Something went wrong",
        });
      }
    } catch {
      setPassMsg({ type: "error", text: "Server error, please try again" });
    } finally {
      setPassLoading(false);
      setTimeout(() => setPassMsg({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0B3D4A] border border-white/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0B3D4A]">
              Account Settings
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Manage your profile and password
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Profile Section */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center shrink-0">
                <span className="text-green-400 font-black text-xl">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-bold">{profile.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{user?.email}</p>
              </div>
            </div>

            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-green-400" /> Profile Info
            </h4>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-green-400" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  placeholder="Ahmed Mohamed"
                  className={inputClass(
                    profileErrors.name,
                    profileTouched.name,
                  )}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {profileErrors.name && profileTouched.name ? (
                    <p className="text-red-400 text-[11px] flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {profileErrors.name}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-[11px] ${profile.name.length > 16 ? "text-yellow-400" : "text-gray-500"}`}
                  >
                    {profile.name.length}/20
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-green-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  placeholder="01xxxxxxxxx"
                  className={inputClass(
                    profileErrors.phoneNumber,
                    profileTouched.phoneNumber,
                  )}
                />
                {profileErrors.phoneNumber && profileTouched.phoneNumber ? (
                  <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1.5">
                    <XCircle className="w-3 h-3" /> {profileErrors.phoneNumber}
                  </p>
                ) : (
                  <p className="text-gray-500 text-[11px] mt-1.5">
                    Format: 01xxxxxxxxx
                  </p>
                )}
              </div>
            </div>

            {profileMsg.text && (
              <div
                className={`mt-4 text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2
                ${
                  profileMsg.type === "success"
                    ? "bg-green-500/10 border border-green-400/30 text-green-400"
                    : "bg-red-500/10 border border-red-400/30 text-red-400"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {profileMsg.text}
              </div>
            )}

            <button
              onClick={handleProfileSave}
              disabled={profileLoading}
              className="w-full mt-5 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              {profileLoading ? (
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>

          {/* Password Section */}
          <div className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6">
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" /> Change Password
            </h4>

            <div className="flex flex-col gap-4">
              {/* Old Password */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    name="oldPass"
                    value={password.oldPass}
                    onChange={handlePassChange}
                    onBlur={handlePassBlur}
                    placeholder="••••••••"
                    className={
                      inputClass(passErrors.oldPass, passTouched.oldPass) +
                      " pr-10"
                    }
                  />
                  <button
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showOld ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passErrors.oldPass && passTouched.oldPass && (
                  <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1.5">
                    <XCircle className="w-3 h-3" /> {passErrors.oldPass}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPass"
                    value={password.newPass}
                    onChange={handlePassChange}
                    onBlur={handlePassBlur}
                    placeholder="••••••••"
                    className={
                      inputClass(passErrors.newPass, passTouched.newPass) +
                      " pr-10"
                    }
                  />
                  <button
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {password.newPass && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : "bg-white/10"}`}
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
                {passErrors.newPass && passTouched.newPass && (
                  <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1.5">
                    <XCircle className="w-3 h-3" /> {passErrors.newPass}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    value={password.confirm}
                    onChange={handlePassChange}
                    onBlur={handlePassBlur}
                    placeholder="••••••••"
                    className={
                      inputClass(passErrors.confirm, passTouched.confirm) +
                      " pr-10"
                    }
                  />
                  <button
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passErrors.confirm && passTouched.confirm && (
                  <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1.5">
                    <XCircle className="w-3 h-3" /> {passErrors.confirm}
                  </p>
                )}
                {!passErrors.confirm &&
                  passTouched.confirm &&
                  password.confirm && (
                    <p className="text-green-400 text-[11px] flex items-center gap-1 mt-1.5">
                      <CheckCircle className="w-3 h-3" /> Passwords match
                    </p>
                  )}
              </div>
            </div>

            {passMsg.text && (
              <div
                className={`mt-4 text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2
                ${
                  passMsg.type === "success"
                    ? "bg-green-500/10 border border-green-400/30 text-green-400"
                    : "bg-red-500/10 border border-red-400/30 text-red-400"
                }`}
              >
                {passMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {passMsg.text}
              </div>
            )}

            <button
              onClick={handlePasswordSave}
              disabled={passLoading}
              className="w-full mt-5 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              {passLoading ? (
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Update Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
