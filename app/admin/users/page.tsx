"use client";

import { useState, useEffect } from "react";
import TableActions from "@/app/components/TableActions";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { User } from "@/app/types";
import { hasRole, displayRole } from "@/app/utils/roleHelper";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "participant",
    isActive: true,
    password: "",
    confirmPassword: "",
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      role: "participant",
      isActive: true,
      password: "",
      confirmPassword: "",
    });
    setCurrentUser(null);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi password
    if (!currentUser && formData.password !== formData.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok");
      return;
    }

    // Validasi password saat membuat user baru
    if (!currentUser && !formData.password) {
      alert("Password diperlukan saat membuat user baru");
      return;
    }

    // Jika update user dan password kosong, berarti tidak ingin mengubah password
    let dataToSubmit: any = { ...formData };

    if (currentUser && !dataToSubmit.password) {
      // Jika password kosong, gunakan spread operator untuk membuat objek baru tanpa password
      const { password, confirmPassword, ...rest } = dataToSubmit;
      dataToSubmit = rest;
    } else {
      // Hapus confirmPassword karena tidak perlu disimpan ke database
      const { confirmPassword, ...rest } = dataToSubmit;
      dataToSubmit = rest;
    }

    try {
      if (currentUser) {
        // Edit existing user
        const response = await fetch(`/api/admin/users/${currentUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSubmit),
        });

        if (response.ok) {
          // Refresh the list
          fetchUsers();
        } else {
          // Handle error response
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
          return;
        }
      } else {
        // Add new user
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Refresh the list
          fetchUsers();
        } else {
          // Handle error response
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
          return;
        }
      }

      // Close form and reset
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      password: "", // Kosongkan password saat edit
      confirmPassword: "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the list
        fetchUsers();
      } else {
        // Handle error response
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }

      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const confirmDelete = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Users Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh Data"}
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New User
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {currentUser ? "Edit User" : "Add New User"}
            </h2>
            <form onSubmit={handleAddEdit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="doctor">Doctor</option>
                  <option value="participant">Participant</option>
                </select>
              </div>
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label className="text-gray-700" htmlFor="isActive">
                  Active
                </label>
              </div>
              {/* Password fields */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  {currentUser
                    ? "Password (kosongkan jika tidak ingin mengubah)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required={!currentUser} // Hanya required saat tambah user baru
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="confirmPassword"
                >
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required={!currentUser} // Hanya required saat tambah user baru
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
                >
                  {currentUser ? "Save Changes" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users found. Add a new user to get started.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        hasRole(user.role, "admin")
                          ? "bg-purple-100 text-purple-800"
                          : hasRole(user.role, "doctor")
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {displayRole(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <TableActions
                      onEdit={() => handleEdit(user)}
                      onDelete={() => confirmDelete(user)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${currentUser?.fullName} (${currentUser?.username})? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
