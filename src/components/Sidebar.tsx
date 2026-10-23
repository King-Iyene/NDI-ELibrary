"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  FiHome,
  FiBook,
  FiBookmark,
  FiClock,
  FiUpload,
  FiGrid,
  FiUsers,
  FiShield,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <FiHome size={20} />, roles: ["student", "admin", "super_admin"] },
  { label: "Browse Books", href: "/books", icon: <FiBook size={20} />, roles: ["student", "admin", "super_admin"] },
  { label: "Bookmarks", href: "/bookmarks", icon: <FiBookmark size={20} />, roles: ["student", "admin", "super_admin"] },
  { label: "Reading History", href: "/history", icon: <FiClock size={20} />, roles: ["student", "admin", "super_admin"] },
  { label: "Manage Books", href: "/admin/books", icon: <FiUpload size={20} />, roles: ["admin", "super_admin"] },
  { label: "Categories", href: "/admin/categories", icon: <FiGrid size={20} />, roles: ["admin", "super_admin"] },
  { label: "Students", href: "/admin/students", icon: <FiUsers size={20} />, roles: ["admin", "super_admin"] },
  { label: "Manage Admins", href: "/super-admin/admins", icon: <FiShield size={20} />, roles: ["super_admin"] },
  { label: "All Users", href: "/super-admin/users", icon: <FiUsers size={20} />, roles: ["super_admin"] },
  { label: "Settings", href: "/super-admin/settings", icon: <FiSettings size={20} />, roles: ["super_admin"] },
];

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700",
  admin: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
};

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = (session?.user as any)?.role || "student";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <img src="/logo.png" alt="NDI" className="h-8 w-auto" />
        <span className="text-lg font-bold text-primary-500">eLibrary</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={isActive ? "text-primary-700" : "text-gray-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 text-gray-600 font-semibold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
              roleBadgeColors[userRole] || "bg-gray-100 text-gray-700"
            }`}
          >
            {userRole.replace("_", " ")}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <FiLogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md md:hidden"
        aria-label="Open menu"
      >
        <FiMenu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close menu"
        >
          <FiX size={20} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>
    </>
  );
}
