"use client";

import { useState, useEffect } from "react";
import TableActions from "@/app/components/TableActions";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { HealthProgram, ProgramCategory } from "@/app/types";
import Link from "next/link";

export default function HealthProgramsPage() {
  const [programs, setPrograms] = useState<HealthProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<HealthProgram | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    startDate: "",
    endDate: "",
    location: "",
    maxParticipants: "",
    status: "active",
  });
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch health programs from API
  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/health-programs");

      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error("Error fetching health programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch program categories from API
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/program-categories?isActive=true");

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching program categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      startDate: "",
      endDate: "",
      location: "",
      maxParticipants: "",
      status: "active",
    });
    setCurrentProgram(null);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert maxParticipants to number if it's not empty
      const formDataToSend = {
        ...formData,
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : undefined,
        categoryId: formData.categoryId || null,
      };

      if (currentProgram) {
        // Edit existing program
        const response = await fetch(
          `/api/admin/health-programs/${currentProgram.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formDataToSend),
          }
        );

        if (response.ok) {
          // Refresh the list
          fetchPrograms();
        }
      } else {
        // Add new program
        const response = await fetch("/api/admin/health-programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formDataToSend),
        });

        if (response.ok) {
          // Refresh the list
          fetchPrograms();
        }
      }

      // Close form and reset
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving health program:", error);
    }
  };

  const handleEdit = (program: HealthProgram) => {
    setCurrentProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      categoryId: program.categoryId || "",
      startDate: program.startDate,
      endDate: program.endDate || "",
      location: program.location || "",
      maxParticipants: program.maxParticipants
        ? program.maxParticipants.toString()
        : "",
      status: program.status,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!currentProgram) return;

    try {
      const response = await fetch(
        `/api/admin/health-programs/${currentProgram.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the list
        fetchPrograms();
      }

      setIsDeleteDialogOpen(false);
      setCurrentProgram(null);
    } catch (error) {
      console.error("Error deleting health program:", error);
    }
  };

  const confirmDelete = (program: HealthProgram) => {
    setCurrentProgram(program);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black bg-white">
          Health Programs Management
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchPrograms}
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
            Add New Program
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {currentProgram
                ? "Edit Health Program"
                : "Add New Health Program"}
            </h2>
            <form onSubmit={handleAddEdit}>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="name">
                  Program Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="categoryId">
                  Program Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <p className="text-sm text-gray-500 mt-1">
                    Loading categories...
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="endDate">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-black mb-2"
                  htmlFor="maxParticipants"
                >
                  Maximum Participants
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>
              <div className="mb-6">
                <label className="block text-black mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-black hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
                >
                  {currentProgram ? "Save Changes" : "Add Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Health Programs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Program Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-black">
                  No health programs found. Add a new program to get started.
                </td>
              </tr>
            ) : (
              programs.map((program) => (
                <tr key={program.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {program.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {program.category ? (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          program.category.color
                            ? `bg-${program.category.color}-100 text-${program.category.color}-800`
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {program.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {new Date(program.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {program.endDate
                      ? new Date(program.endDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {program.location || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        program.status === "active"
                          ? "bg-green-100 text-green-800"
                          : program.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {program.status === "active"
                        ? "Active"
                        : program.status === "completed"
                        ? "Completed"
                        : "Cancelled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <TableActions
                      onEdit={() => handleEdit(program)}
                      onDelete={() => confirmDelete(program)}
                    >
                      <Link
                        href={`/admin/health-programs/${program.id}/tasks`}
                        className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
                        title="Manage Tasks"
                      >
                        Kelola Tugas
                      </Link>
                    </TableActions>
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
        title="Delete Health Program"
        message={`Are you sure you want to delete ${currentProgram?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
