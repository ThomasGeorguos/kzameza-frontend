import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center px-4">
      <div className="bg-[#0B3D4A] w-full max-w-lg rounded-3xl shadow-2xl border border-white/10 p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>
        <p className="text-green-400 font-black text-sm tracking-widest uppercase mb-2">
          Oops!
        </p>
        <h1 className="text-7xl font-black text-white mb-2">404</h1>

        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>

        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/30"
        >
          <Home className="w-4 h-4" />
          Back To Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
