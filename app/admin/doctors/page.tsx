"use client";

import { useState, useEffect } from "react";
import TableActions from "@/app/components/TableActions";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { Doctor, Spesialization } from "@/app/types";

// Define day names for the schedule
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [spesializations, setSpesializations] = useState<Spesialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    spesialisasiId: "",
    email: "",
    phone: "",
    schedule: "",
  });
  const [scheduleData, setScheduleData] = useState<string[]>([]);

  // Fetch doctors from API
  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching doctors...");
      const response = await fetch("/api/admin/doctors");

      console.log("Doctors API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched doctors:", data);
        setDoctors(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch doctors - Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        try {
          const errorData = JSON.parse(errorText);
          console.error("Failed to fetch doctors - Parsed error:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();

    // Fetch specializations for the dropdown
    const fetchSpesializations = async () => {
      try {
        console.log("Fetching specializations...");
        const response = await fetch("/api/admin/spesializations");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched specializations:", data);
          setSpesializations(data);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch specializations:", errorData);
        }
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };

    fetchSpesializations();
  }, []);

  // Convert schedule JSON string to object when editing
  useEffect(() => {
    if (formData.schedule) {
      try {
        const parsed = JSON.parse(formData.schedule);
        // Jika format lama (object), ambil hanya hari-harinya
        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          setScheduleData(Object.keys(parsed));
        } else if (Array.isArray(parsed)) {
          setScheduleData(parsed);
        } else {
          setScheduleData([]);
        }
      } catch (error) {
        console.error("Error parsing schedule JSON:", error);
        setScheduleData([]);
      }
    } else {
      setScheduleData([]);
    }
  }, [formData.schedule]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes to the schedule form
  const handleScheduleChange = (day: string, checked: boolean) => {
    let newSchedule = [...scheduleData];

    if (checked && !newSchedule.includes(day)) {
      // Add day if checked and not already in the array
      newSchedule.push(day);
    } else if (!checked && newSchedule.includes(day)) {
      // Remove day if unchecked and in the array
      newSchedule = newSchedule.filter((d) => d !== day);
    }

    // Sort days in a logical order
    const dayOrder: Record<string, number> = {
      Sen: 1,
      Sel: 2,
      Rab: 3,
      Kam: 4,
      Jum: 5,
      Sab: 6,
    };
    newSchedule.sort((a, b) => dayOrder[a] - dayOrder[b]);

    // Update the schedule data
    setScheduleData(newSchedule);
    setFormData((prev) => ({
      ...prev,
      schedule: newSchedule.length ? JSON.stringify(newSchedule) : "",
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      spesialisasiId: "",
      email: "",
      phone: "",
      schedule: "",
    });
    setScheduleData([]);
    setCurrentDoctor(null);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create submission data with correct field name for specialization
    const submissionData = {
      name: formData.name,
      spesialisasiId: formData.spesialisasiId, // Use consistent field name for API
      email: formData.email,
      phone: formData.phone,
      schedule: formData.schedule,
    };

    console.log("Submitting doctor data:", submissionData);

    try {
      if (currentDoctor) {
        // Edit existing doctor
        const response = await fetch(`/api/admin/doctors/${currentDoctor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData), // Use mapped data
        });

        if (response.ok) {
          console.log("Doctor updated successfully");
          // Refresh the list
          fetchDoctors();
        } else {
          const errorData = await response.json();
          console.error("Error updating doctor:", errorData);
        }
      } else {
        // Add new doctor
        const response = await fetch("/api/admin/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData), // Use mapped data
        });

        if (response.ok) {
          console.log("Doctor added successfully");
          // Refresh the list
          fetchDoctors();
        } else {
          const errorData = await response.json();
          console.error("Error adding doctor:", errorData);
        }
      }

      // Close form and reset
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving doctor:", error);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setFormData({
      name: doctor.name,
      spesialisasiId: doctor.spesialization,
      email: doctor.email || "",
      phone: doctor.phone || "",
      schedule: doctor.schedule || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!currentDoctor) return;

    try {
      const response = await fetch(`/api/admin/doctors/${currentDoctor.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the list
        fetchDoctors();
      }

      setIsDeleteDialogOpen(false);
      setCurrentDoctor(null);
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const confirmDelete = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  // Format the schedule for display in the table
  const formatSchedule = (scheduleJson?: string) => {
    if (!scheduleJson) return "-";

    try {
      const schedule = JSON.parse(scheduleJson);
      // Handle both array and object formats for backward compatibility
      let days: string[] = [];

      if (Array.isArray(schedule)) {
        days = schedule;
      } else if (typeof schedule === "object") {
        days = Object.keys(schedule);
      }

      // Sort days in logical order
      const dayOrder: Record<string, number> = {
        Sen: 1,
        Sel: 2,
        Rab: 3,
        Kam: 4,
        Jum: 5,
        Sab: 6,
      };
      days.sort((a, b) => dayOrder[a] - dayOrder[b]);

      return days.join(", ");
    } catch (error) {
      return "-";
    }
  };

  const getSpecializationName = (spesializationId: string) => {
    if (!spesializationId) return "-";

    const spesialization = spesializations.find(
      (s) => s.id === spesializationId
    );
    return spesialization ? spesialization.name : spesializationId;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Doctors Management</h1>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Doctor
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {currentDoctor ? "Edit Doctor" : "Add New Doctor"}
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
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="spesialisasiId"
                >
                  Specialization
                </label>
                <select
                  id="spesialisasiId"
                  name="spesialisasiId"
                  value={formData.spesialisasiId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                >
                  <option value="">Select a specialization</option>
                  {spesializations.map((spesialization) => (
                    <option key={spesialization.id} value={spesialization.id}>
                      {spesialization.name}
                    </option>
                  ))}
                </select>
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
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>

              {/* Schedule Section */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Hari Praktik</label>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    {days.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={scheduleData.includes(day)}
                          onChange={(e) =>
                            handleScheduleChange(day, e.target.checked)
                          }
                          className="border border-gray-300 rounded"
                        />
                        <label htmlFor={`day-${day}`} className="text-gray-700">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
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
                  {currentDoctor ? "Save Changes" : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
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
            ) : doctors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No doctors found. Add a new doctor to get started.
                </td>
              </tr>
            ) : (
              doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {doctor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {getSpecializationName(doctor.spesialization)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {doctor.email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {doctor.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-black line-clamp-2">
                    {formatSchedule(doctor.schedule)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <TableActions
                      onEdit={() => handleEdit(doctor)}
                      onDelete={() => confirmDelete(doctor)}
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
        title="Delete Doctor"
        message={`Are you sure you want to delete ${currentDoctor?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
