"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiChevronLeft, FiChevronRight, FiEdit2 } from "react-icons/fi";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const PAGE_SIZE = 10;

const roleBadge: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
  user: "bg-gray-100 text-gray-700",
};

const roleOptions = ["super_admin", "admin", "student"];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async (p: number, role: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      if (role) params.set("role", role);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || data || []);
      setTotal(data.pagination?.total || data.total || data.length || 0);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, roleFilter);
  }, [page, roleFilter]);

  const handleRoleUpdate = async (userId: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }
      toast.success("Role updated successfully");
      setEditingId(null);
      fetchUsers(page, roleFilter);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            View, filter and manage user roles
          </p>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiUsers className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          >
                            {roleOptions.map((r) => (
                              <option key={r} value={r}>
                                {r.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              roleBadge[user.role] || roleBadge.user
                            }`}
                          >
                            {user.role.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRoleUpdate(user.id)}
                              disabled={updating || editRole === user.role}
                              className="px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                            >
                              {updating ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 text-gray-600 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(user.id);
                              setEditRole(user.role);
                            }}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                            title="Change role"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
