import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();
  
  const logoSrc = "https://www.teqmates.com/pommaholidays/logo.png";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        // Redirect to /pommaadmin/dashboard to stay under /pommaadmin/ path
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/pommaadmin')) {
          // Redirect to /pommaadmin/dashboard (stays under /pommaadmin/ path)
          window.location.href = '/pommaadmin/dashboard';
        } else {
          // For other paths, use React Router navigation
          navigate("/dashboard", { replace: true });
        }
      } else {
        alert("Login failed: No token received from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Login failed. Please check your credentials.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4" style={{ backgroundColor: '#f0f9f4' }}>
      {/* Light Greenish Gradient Background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"></div>

      {/* Floating green particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-10 h-10 bg-green-300/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-green-100">
        {/* Logo Section - Maximum Visibility */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-6">
          <div className="relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-green-200/30 rounded-full blur-2xl animate-pulse"></div>
            
            {/* White background circle for logo */}
            <div className="relative bg-white rounded-full p-4 sm:p-5 md:p-6 shadow-xl border-4 border-green-100 flex items-center justify-center">
              {!logoError ? (
                <img 
                  src={logoSrc}
                  alt="Pomma Holidays Logo"
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
                  onError={() => setLogoError(true)}
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(15, 81, 50, 0.3))' }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-green-600 via-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider drop-shadow-lg">PH</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm sm:text-base font-medium">Sign in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email / Username
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="admin@teqmates.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Pomma Holidays. TeqMates.
        </div>
      </div>

      {/* Tailwind animations */}
      <style>
        {`
          @keyframes gradient-bg {
            0%,100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-bg 15s ease infinite;
          }

          @keyframes float {
            0% { transform: translateY(0) translateX(0) rotate(0deg); opacity:0.3; }
            50% { transform: translateY(-50px) translateX(20px) rotate(180deg); opacity:0.15; }
            100% { transform: translateY(0) translateX(0) rotate(360deg); opacity:0.3; }
          }
          .animate-float {
            animation-name: float;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          
          @keyframes logo-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
            50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.5); }
          }
        `}
      </style>
    </div>
  );
}
