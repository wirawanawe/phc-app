"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import ConfirmDialog from "@/app/components/ConfirmDialog";

interface Insurance {
  id: string;
  name: string;
  description: string;
  coverage: string;
  isActive: boolean;
  createdAt: string;
}

export default function InsurancePage() {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentInsurance, setCurrentInsurance] = useState<Insurance | null>(
    null
  );
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<Partial<Insurance>>({
    name: "",
    description: "",
    coverage: "",
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch insurance data
  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/insurances");

      if (!response.ok) {
        throw new Error(`Error fetching insurances: ${response.status}`);
      }

      const data = await response.json();
      setInsurances(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch insurances:", err);
      setError(err.message || "Failed to fetch insurances");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInsurances();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      coverage: "",
      isActive: true,
    });
    setFormError(null);
    setCurrentInsurance(null);
  };

  // Open form for creating new insurance
  const handleCreateNew = () => {
    resetForm();
    setFormMode("create");
    setIsFormOpen(true);
  };

  // Open form for editing existing insurance
  const handleEdit = (insurance: Insurance) => {
    setCurrentInsurance(insurance);
    setFormData({
      id: insurance.id,
      name: insurance.name,
      description: insurance.description,
      coverage: insurance.coverage,
      isActive: insurance.isActive,
    });
    setFormMode("edit");
    setIsFormOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // Validate form
      if (!formData.name) {
        setFormError("Name is a required field");
        return;
      }

      // Create or update insurance
      const url =
        formMode === "create"
          ? "/api/admin/insurances"
          : `/api/admin/insurances/${formData.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${formMode} insurance`);
      }

      // Refresh data and close form
      await fetchInsurances();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(
        `Error ${formMode === "create" ? "creating" : "updating"} insurance:`,
        err
      );
      setFormError(err.message || `Failed to ${formMode} insurance`);
    }
  };

  // Confirm delete dialog
  const confirmDelete = (insurance: Insurance) => {
    setCurrentInsurance(insurance);
    setIsDeleteDialogOpen(true);
  };

  // Handle insurance deletion
  const handleDelete = async () => {
    if (!currentInsurance) return;

    try {
      const response = await fetch(
        `/api/admin/insurances/${currentInsurance.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete insurance");
      }

      // Refresh data
      await fetchInsurances();
      setIsDeleteDialogOpen(false);
      setCurrentInsurance(null);
    } catch (err: any) {
      console.error("Error deleting insurance:", err);
      setError(err.message || "Failed to delete insurance");
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl text-black font-bold">Management Insurance</h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchInsurances}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Insurance
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl text-black font-semibold mb-4">
              {formMode === "create" ? "Add New Insurance" : "Edit Insurance"}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="name"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                  required
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
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="coverage"
                >
                  Coverage Details
                </label>
                <textarea
                  id="coverage"
                  name="coverage"
                  value={formData.coverage || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {formMode === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-md shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : insurances.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No insurance records found
                  </td>
                </tr>
              ) : (
                insurances.map((insurance) => (
                  <tr key={insurance.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {insurance.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {insurance.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          insurance.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {insurance.isActive ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimes className="mr-1" />
                        )}
                        {insurance.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(insurance)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => confirmDelete(insurance)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Insurance"
        message={`Are you sure you want to delete ${currentInsurance?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
