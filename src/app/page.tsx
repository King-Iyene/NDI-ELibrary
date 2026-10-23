"use client";

import { FiBook, FiUsers, FiSearch, FiShield } from "react-icons/fi";
import Link from "next/link";

const features = [
  {
    icon: <FiBook className="w-8 h-8" />,
    title: "Vast Book Collection",
    description:
      "Access thousands of academic resources, textbooks, journals, and research papers all in one place.",
  },
  {
    icon: <FiUsers className="w-8 h-8" />,
    title: "Role-Based Access",
    description:
      "Tailored experiences for students, lecturers, and administrators with appropriate permissions.",
  },
  {
    icon: <FiSearch className="w-8 h-8" />,
    title: "Search & Discover",
    description:
      "Powerful search and filtering tools to find exactly the resources you need in seconds.",
  },
  {
    icon: <FiShield className="w-8 h-8" />,
    title: "Reading Tracking",
    description:
      "Track your reading progress, set goals, and keep a history of all your borrowed materials.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-primary-600 to-primary-500 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NDI" className="h-9 w-auto brightness-0 invert" />
            <span className="text-xl font-bold">eLibrary</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-accent-300 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-accent-400 hover:bg-accent-300 text-primary-600 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Register
            </Link>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Welcome to the{" "}
            <span className="text-accent-300">NDI eLibrary</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto text-primary-100 mb-10">
            Niger Delta Innovate&apos;s digital library platform. Discover,
            borrow, and manage academic resources from anywhere, at any time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto bg-accent-400 hover:bg-accent-300 text-primary-600 font-semibold px-8 py-3 rounded-lg transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            A comprehensive digital library built for the Niger Delta Innovate
            community.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          &copy; 2024 Niger Delta Innovate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
