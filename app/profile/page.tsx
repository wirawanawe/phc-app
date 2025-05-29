"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Participant, Insurance } from "@/app/types";

interface HealthRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  doctor: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [currentInsurance, setCurrentInsurance] = useState<Insurance | null>(
    null
  );

  // Participant data
  const [participant, setParticipant] = useState<Partial<Participant> | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    identityNumber: "",
    insuranceId: "",
    insuranceNumber: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // If user is admin and trying to access participant or health-records tabs, switch to profile tab
    if (
      user.role === "admin" &&
      (activeTab === "participant" || activeTab === "health-records")
    ) {
      setActiveTab("profile");
    }

    // Fetch participant data
    const fetchParticipantData = async () => {
      try {
        const response = await fetch("/api/participants/me", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setParticipant(data);

          // Initialize form data
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            dateOfBirth: data.dateOfBirth || "",
            address: data.address || "",
            identityNumber: data.identityNumber || "",
            insuranceId: data.insuranceId || "",
            insuranceNumber: data.insuranceNumber || "",
          });

          // If participant has insurance, fetch insurance details
          if (data.insuranceId) {
            fetchInsuranceById(data.insuranceId);
          }
        } else {
          console.error("Failed to fetch participant data");
        }
      } catch (error) {
        console.error("Error fetching participant data:", error);
      }
    };

    const fetchInsurances = async () => {
      try {
        const response = await fetch("/api/insurances");
        if (response.ok) {
          const data = await response.json();
          setInsurances(data);
        }
      } catch (error) {
        console.error("Error fetching insurances:", error);
      }
    };

    const fetchInsuranceById = async (insuranceId: string) => {
      try {
        const response = await fetch(`/api/insurances/${insuranceId}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentInsurance(data);
        }
      } catch (error) {
        console.error("Error fetching insurance:", error);
      }
    };

    const fetchHealthRecords = async () => {
      try {
        const response = await fetch(`/api/health-records?userId=${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch health records");
        const data = await response.json();
        setHealthRecords(data);
      } catch (error) {
        console.error("Error fetching health records:", error);
      }
    };

    // Only fetch participant data and health records if user is not admin
    if (user.role !== "admin") {
      fetchParticipantData();
      fetchInsurances();
      fetchHealthRecords();
    }
  }, [user, router, activeTab]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/participants/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedParticipant = await response.json();
      setParticipant(updatedParticipant);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to current participant data
    if (participant) {
      setFormData({
        name: participant.name || "",
        phone: participant.phone || "",
        dateOfBirth: participant.dateOfBirth || "",
        address: participant.address || "",
        identityNumber: participant.identityNumber || "",
        insuranceId: participant.insuranceId || "",
        insuranceNumber: participant.insuranceNumber || "",
      });
    }
    setIsEditing(false);
  };

  // Function to check if insurance number field should be shown
  const shouldShowInsuranceNumber = () => {
    // For display view
    if (!isEditing && participant?.insuranceId) {
      return currentInsurance && currentInsurance.name !== "Umum";
    }

    // For edit view
    if (isEditing) {
      if (!formData.insuranceId) return false;
      const selectedInsurance = insurances.find(
        (ins) => ins.id === formData.insuranceId
      );
      return selectedInsurance && selectedInsurance.name !== "Umum";
    }

    return false;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 pb-20">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            My Profile
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Profile header with user avatar */}
            <div className="bg-gradient-to-r from-blue-500 to-primary p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-bold shadow-md">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : ""}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  <p className="text-blue-100">{user.email}</p>
                  <p className="mt-1 inline-block bg-blue-600 bg-opacity-50 px-2 py-1 rounded text-sm">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs navigation */}
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
              <button
                className={`mr-4 inline-block py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                  activeTab === "profile"
                    ? "border-primary text-primary dark:border-primary dark:text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Account Info
              </button>

              {/* Only show Personal Details tab if user is not admin */}
              {user.role !== "admin" && (
                <button
                  className={`mr-4 inline-block py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                    activeTab === "participant"
                      ? "border-primary text-primary dark:border-primary dark:text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("participant")}
                >
                  Personal Details
                </button>
              )}

              {/* Only show Health Records tab if user is not admin */}
              {user.role !== "admin" && (
                <button
                  className={`mr-4 inline-block py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                    activeTab === "health-records"
                      ? "border-primary text-primary dark:border-primary dark:text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("health-records")}
                >
                  Health Records
                </button>
              )}

              <button
                className={`mr-4 inline-block py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                  activeTab === "password"
                    ? "border-primary text-primary dark:border-primary dark:text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("password")}
              >
                Security
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                {success}
              </div>
            )}

            {/* Tab content area */}
            <div className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Account Information
                  </h3>

                  {user.role === "admin" && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 dark:bg-blue-900/30 dark:border-blue-400">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-blue-500 dark:text-blue-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            As an admin user, you don&apos;t have access to
                            personal details and health records tabs to maintain
                            data privacy.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {user.fullName || "-"}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Email Address
                      </label>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {user.email || "-"}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Username
                      </label>
                      <div className="flex items-center">
                        <p className="text-gray-800 dark:text-white font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-800">
                          {user.username || "-"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This is your full username for logging in
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Role
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.role || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "participant" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Personal Information
                    </h3>

                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center bg-primary bg-opacity-10 text-primary hover:bg-opacity-20 py-1.5 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          ></path>
                        </svg>
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    // Display mode - enhanced with better visual structure
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-800 dark:text-white font-medium">
                          {participant?.name || "-"}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-800 dark:text-white font-medium">
                          {participant?.phone || "-"}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Identity Number
                        </label>
                        <p className="text-gray-800 dark:text-white font-medium">
                          {participant?.identityNumber || "-"}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Insurance
                        </label>
                        <p className="text-gray-800 dark:text-white font-medium">
                          {currentInsurance?.name || "-"}
                        </p>
                      </div>

                      {shouldShowInsuranceNumber() && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Insurance Number
                          </label>
                          <p className="text-gray-800 dark:text-white font-medium">
                            {participant?.insuranceNumber || "-"}
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Date of Birth
                        </label>
                        <p className="text-gray-800 dark:text-white font-medium">
                          {participant?.dateOfBirth
                            ? new Date(
                                participant.dateOfBirth
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg col-span-full">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Address
                        </label>
                        <p className="text-gray-800 dark:text-white font-medium whitespace-pre-wrap">
                          {participant?.address || "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Edit mode - improved form styling
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Identity Number
                          </label>
                          <input
                            type="text"
                            name="identityNumber"
                            value={formData.identityNumber}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Insurance
                          </label>
                          <select
                            name="insuranceId"
                            value={formData.insuranceId}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">
                              Select Insurance (Optional)
                            </option>
                            {insurances.map((insurance) => (
                              <option key={insurance.id} value={insurance.id}>
                                {insurance.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {shouldShowInsuranceNumber() && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Insurance Number
                            </label>
                            <input
                              type="text"
                              name="insuranceNumber"
                              value={formData.insuranceNumber}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {loading ? (
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
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="border border-gray-300 text-gray-700 bg-white py-2 px-4 rounded-md hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === "health-records" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                    Medical Records
                  </h3>

                  {healthRecords.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No medical records
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your health records will appear here once they are added
                        by your healthcare provider.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {healthRecords.map((record) => (
                        <div
                          key={record.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 flex items-center justify-center mr-3">
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  ></path>
                                </svg>
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {record.type}
                              </h3>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                              <svg
                                className="h-4 w-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                ></path>
                              </svg>
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="ml-13 sm:ml-13 pl-0 sm:pl-13 border-l-0 sm:border-l border-gray-200 dark:border-gray-700 mt-2 sm:mt-0">
                            <div className="pl-0 sm:pl-4">
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
                                {record.description}
                              </p>

                              <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <svg
                                  className="h-4 w-4 mr-1 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  ></path>
                                </svg>
                                <span>Dr. {record.doctor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "password" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                    Change Password
                  </h3>

                  <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Create a strong password by using a combination of
                          letters, numbers, and special characters.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-5 max-w-md"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      {loading ? (
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
                          Changing Password...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Log out from your account
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  End your current session and return to login screen.
                </p>
                <div className="mt-4">
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
