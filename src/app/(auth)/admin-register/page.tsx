"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          adminCode: form.adminCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Admin account created! Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="NDI" className="h-10 w-auto" />
            <span className="text-xl font-bold text-primary-500">eLibrary</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Registration</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create an administrator account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="input-field w-full"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="input-field w-full"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="input-field w-full pr-10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className="input-field w-full pr-10"
                placeholder="Repeat your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="adminCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Admin Access Code
            </label>
            <input
              id="adminCode"
              type="password"
              required
              value={form.adminCode}
              onChange={(e) => updateField("adminCode", e.target.value)}
              className="input-field w-full"
              placeholder="Enter the admin access code"
            />
            <p className="text-xs text-gray-400 mt-1">
              Contact your super admin to get the access code
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
