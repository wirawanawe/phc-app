"use client";

import { useState, useEffect } from "react";
import TableActions from "@/app/components/TableActions";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { Spesialization } from "@/app/types";

// Define day names for the schedule

export default function SpesializationsPage() {
  const [Spesializations, setSpesializations] = useState<Spesialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSpesialization, setCurrentSpesialization] =
    useState<Spesialization | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });

  // Fetch Spesializations from API
  const fetchSpesializations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/spesializations");

      if (response.ok) {
        const data = await response.json();
        setSpesializations(data);
      }
    } catch (error) {
      console.error("Error fetching Spesializations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpesializations();
  }, []);

  // Convert schedule JSON string to object when editing

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes to the schedule form

  const resetForm = () => {
    setFormData({
      name: "",
      isActive: true,
    });
    setCurrentSpesialization(null);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentSpesialization) {
        // Edit existing Spesialization
        const response = await fetch(
          `/api/admin/spesializations/${currentSpesialization.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          // Refresh the list
          fetchSpesializations();
        }
      } else {
        // Add new Spesialization
        const response = await fetch("/api/admin/spesializations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Refresh the list
          fetchSpesializations();
        }
      }

      // Close form and reset
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving Spesialization:", error);
    }
  };

  const handleEdit = (Spesialization: Spesialization) => {
    setCurrentSpesialization(Spesialization);
    setFormData({
      name: Spesialization.name,
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!currentSpesialization) return;

    try {
      const response = await fetch(
        `/api/admin/spesializations/${currentSpesialization.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the list
        fetchSpesializations();
      }

      setIsDeleteDialogOpen(false);
      setCurrentSpesialization(null);
    } catch (error) {
      console.error("Error deleting Spesialization:", error);
    }
  };

  const confirmDelete = (Spesialization: Spesialization) => {
    setCurrentSpesialization(Spesialization);
    setIsDeleteDialogOpen(true);
  };

  // Format the schedule for display in the table
  const formatSchedule = (scheduleJson?: string) => {
    if (!scheduleJson) return "-";

    try {
      const schedule = JSON.parse(scheduleJson);
      return Object.entries(schedule)
        .map(([day, time]) => `${day}: ${time}`)
        .join(", ");
    } catch (error) {
      return "-";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">
          Specializations Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Specialization
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {currentSpesialization
                ? "Edit Specialization"
                : "Add New Specialization"}
            </h2>
            <form onSubmit={handleAddEdit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Name
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
                  {currentSpesialization
                    ? "Save Changes"
                    : "Add Spesialization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spesializations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
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
            ) : Spesializations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No Specializations found. Add a new Specialization to get
                  started.
                </td>
              </tr>
            ) : (
              Spesializations.map((spesialization) => (
                <tr key={spesialization.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {spesialization.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        spesialization.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {spesialization.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <TableActions
                      onEdit={() => handleEdit(spesialization)}
                      onDelete={() => confirmDelete(spesialization)}
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
        title="Delete Spesialization"
        message={`Are you sure you want to delete ${currentSpesialization?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
