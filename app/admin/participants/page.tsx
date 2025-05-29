"use client";

import { useState, useEffect } from "react";
import TableActions from "@/app/components/TableActions";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { Participant, Insurance } from "@/app/types";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [currentParticipant, setCurrentParticipant] =
    useState<Participant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    identityNumber: "",
    insuranceId: "",
    insuranceNumber: "",
  });

  // Fetch participants from MySQL API
  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/participants");

      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch insurances from API
  const fetchInsurances = async () => {
    try {
      const response = await fetch("/api/admin/insurances");
      if (response.ok) {
        const data = await response.json();
        setInsurances(data);
      }
    } catch (error) {
      console.error("Error fetching insurances:", error);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchInsurances();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      identityNumber: "",
      insuranceId: "",
      insuranceNumber: "",
    });
    setCurrentParticipant(null);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentParticipant) {
        // Edit existing participant
        const response = await fetch(
          `/api/admin/participants/${currentParticipant.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          // Refresh the list
          fetchParticipants();
        }
      } else {
        // Add new participant
        const response = await fetch("/api/admin/participants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Refresh the list
          fetchParticipants();
        }
      }

      // Close form and reset
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving participant:", error);
    }
  };

  const handleEdit = (participant: Participant) => {
    setCurrentParticipant(participant);
    setFormData({
      name: participant.name,
      email: participant.email,
      phone: participant.phone || "",
      dateOfBirth: participant.dateOfBirth || "",
      address: participant.address || "",
      identityNumber: participant.identityNumber || "",
      insuranceId: participant.insuranceId || "",
      insuranceNumber: participant.insuranceNumber || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!currentParticipant) return;

    try {
      const response = await fetch(
        `/api/admin/participants/${currentParticipant.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the list
        fetchParticipants();
      }

      setIsDeleteDialogOpen(false);
      setCurrentParticipant(null);
    } catch (error) {
      console.error("Error deleting participant:", error);
    }
  };

  const confirmDelete = (participant: Participant) => {
    setCurrentParticipant(participant);
    setIsDeleteDialogOpen(true);
  };

  // Function to check if insurance number field should be shown
  const shouldShowInsuranceNumber = () => {
    // Get selected insurance from the list
    if (!formData.insuranceId) return false;

    const selectedInsurance = insurances.find(
      (ins) => ins.id === formData.insuranceId
    );
    // Only show insurance number field if insurance is not "Umum"
    return selectedInsurance && selectedInsurance.name !== "Umum";
  };

  // Add a function to synchronize participants data
  const synchronizeParticipants = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/admin/participants/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSyncMessage({
          text: "Participants synchronized successfully. Refreshing data...",
          type: "success",
        });
        // Refresh the list after successful sync
        await fetchParticipants();
      } else {
        const errorData = await response.json();
        setSyncMessage({
          text: errorData.error || "Failed to synchronize participants data",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error synchronizing participants:", error);
      setSyncMessage({
        text: "An error occurred while synchronizing participants data",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setSyncMessage(null);
      }, 5000);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">
          Participants Management
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={synchronizeParticipants}
            disabled={isSyncing}
            className={`px-4 py-2 ${
              isSyncing ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"
            } text-white rounded flex items-center`}
          >
            {isSyncing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Synchronizing...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Sync Participants
              </>
            )}
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Participant
          </button>
        </div>
      </div>

      {/* Synchronization Message */}
      {syncMessage && (
        <div
          className={`mb-4 p-3 rounded-md ${
            syncMessage.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {syncMessage.text}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {currentParticipant ? "Edit Participant" : "Add New Participant"}
            </h2>
            <form onSubmit={handleAddEdit}>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="name">
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
                <label className="block text-black mb-2" htmlFor="email">
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
                <label className="block text-black mb-2" htmlFor="phone">
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
              <div className="mb-4">
                <label
                  className="block text-black mb-2"
                  htmlFor="identityNumber"
                >
                  Identity Number
                </label>
                <input
                  type="text"
                  id="identityNumber"
                  name="identityNumber"
                  value={formData.identityNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="insuranceId">
                  Insurance
                </label>
                <select
                  id="insuranceId"
                  name="insuranceId"
                  value={formData.insuranceId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                >
                  <option value="">Select Insurance</option>
                  {insurances.map((insurance) => (
                    <option key={insurance.id} value={insurance.id}>
                      {insurance.name}
                    </option>
                  ))}
                </select>
              </div>

              {shouldShowInsuranceNumber() && (
                <div className="mb-4">
                  <label
                    className="block text-black mb-2"
                    htmlFor="insuranceNumber"
                  >
                    Insurance Number
                  </label>
                  <input
                    type="text"
                    id="insuranceNumber"
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="dateOfBirth">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>
              <div className="mb-6">
                <label className="block text-black mb-2" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  rows={3}
                />
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
                  {currentParticipant ? "Save Changes" : "Add Participant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Date of Birth
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Insurance
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
            ) : participants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-black">
                  No participants found. Add a new participant to get started.
                </td>
              </tr>
            ) : (
              participants.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {participant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {participant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {participant.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {participant.dateOfBirth || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {participant.insuranceId ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {insurances.find(
                          (i) => i.id === participant.insuranceId
                        )?.name || "Unknown"}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <TableActions
                      onEdit={() => handleEdit(participant)}
                      onDelete={() => confirmDelete(participant)}
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
        title="Delete Participant"
        message={`Are you sure you want to delete ${currentParticipant?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
