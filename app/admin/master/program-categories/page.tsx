"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { ProgramCategory } from "@/app/types";

const COLORS = [
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Red", value: "red" },
  { name: "Yellow", value: "yellow" },
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Gray", value: "gray" },
  { name: "Indigo", value: "indigo" },
  { name: "Teal", value: "teal" },
  { name: "Orange", value: "orange" },
];

export default function ProgramCategoriesPage() {
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] =
    useState<ProgramCategory | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<string>("all");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue",
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [filterActive]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let url = "/api/program-categories";
      if (filterActive !== "all") {
        url += `?isActive=${filterActive === "active"}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError("Failed to load categories. Please try again later.");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "blue",
      isActive: true,
    });
    setFormError(null);
    setCurrentCategory(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (category: ProgramCategory) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      color: category.color || "blue",
      isActive: category.isActive,
    });
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name) {
        setFormError("Category name is required");
        setIsSubmitting(false);
        return;
      }

      // Create or update category
      const url =
        formMode === "create"
          ? "/api/program-categories"
          : `/api/program-categories/${currentCategory?.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${formMode} category`);
      }

      // Refresh data and close form
      await fetchCategories();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || `Failed to ${formMode} category`);
      console.error(
        `Error ${formMode === "create" ? "creating" : "updating"} category:`,
        err
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteError(null);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/program-categories/${categoryToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            "Failed to delete category. It may be in use by health programs."
        );
      }

      await fetchCategories();
    } catch (err: any) {
      setDeleteError(err.message);
      console.error("Error deleting category:", err);
    } finally {
      setIsSubmitting(false);
      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleStatus = async (category: ProgramCategory) => {
    try {
      const response = await fetch(`/api/program-categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !category.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category status");
      }

      await fetchCategories();
    } catch (err) {
      setError("Failed to update category status");
      console.error("Error updating category status:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black bg-white">
          Program Categories Management
        </h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Category
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {deleteError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {deleteError}
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-black">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-black">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-black line-clamp-2">
                      {category.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full bg-${category.color}-500 mr-2`}
                      ></div>
                      <span className="text-sm text-black capitalize">
                        {category.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category)}
                      className={`mr-3 ${
                        category.isActive
                          ? "text-amber-600 hover:text-amber-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {category.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {formMode === "create" ? "Add New Category" : "Edit Category"}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-black mb-1"
                  htmlFor="name"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                  required
                  placeholder="Category name"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                  rows={3}
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="color"
                >
                  Color
                </label>
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                >
                  {COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full bg-${formData.color}-500 mr-2`}
                  ></div>
                  <span className="text-sm text-gray-500">Color preview</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-black">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : formMode === "create"
                    ? "Create"
                    : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={confirmDeleteCategory}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
}
