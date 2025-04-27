"use client";

import { useState, useEffect } from "react";
import TableActions from "@/app/components/TableActions";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { Appointment, Doctor, Participant } from "@/app/types";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    participantId: "",
    doctorId: "",
    date: "",
    time: "",
    status: "scheduled",
    notes: "",
  });

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await fetch("/api/admin/appointments");

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }

      // Fetch doctors for the dropdown
      const doctorsResponse = await fetch("/api/admin/doctors");

      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);
      }

      // Fetch participants for the dropdown
      const participantsResponse = await fetch("/api/admin/participants");

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setParticipants(participantsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      participantId: "",
      doctorId: "",
      date: "",
      time: "",
      status: "scheduled",
      notes: "",
    });
    setCurrentAppointment(null);
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentAppointment) {
        // Edit existing appointment
        const response = await fetch(
          `/api/admin/appointments/${currentAppointment.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          // Refresh the list
          fetchData();
        }
      } else {
        // Add new appointment
        const response = await fetch("/api/admin/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Refresh the list
          fetchData();
        }
      }

      // Close form and reset
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      participantId: appointment.participantId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time || "",
      status: appointment.status,
      notes: appointment.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!currentAppointment) return;

    try {
      const response = await fetch(
        `/api/admin/appointments/${currentAppointment.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the list
        fetchData();
      }

      setIsDeleteDialogOpen(false);
      setCurrentAppointment(null);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const confirmDelete = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  // Helper function to get doctor/participant name by ID
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((doc) => doc.id === doctorId);
    return doctor ? doctor.name : "Unknown Doctor";
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    return participant ? participant.name : "Unknown Participant";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">
          Appointments Management
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchData}
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
            Add New Appointment
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentAppointment ? "Edit Appointment" : "Add New Appointment"}
            </h2>
            <form onSubmit={handleAddEdit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="participantId"
                >
                  Participant
                </label>
                <select
                  id="participantId"
                  name="participantId"
                  value={formData.participantId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select a participant</option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="doctorId">
                  Doctor
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="date">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="time">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
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
                  {currentAppointment ? "Save Changes" : "Add Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
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
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No appointments found. Add a new appointment to get started.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {getParticipantName(appointment.participantId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {getDoctorName(appointment.doctorId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {appointment.time || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <TableActions
                      onEdit={() => handleEdit(appointment)}
                      onDelete={() => confirmDelete(appointment)}
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
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
