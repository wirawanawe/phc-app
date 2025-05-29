"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { TextField, Divider, Chip } from "@mui/material";

interface WebsiteSettings {
  id: string;
  logoUrl: string;
  heroBackgroundUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  mapLocation?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export default function WebsiteSettingsPage() {
  // State for settings data
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for file uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  // Fetch settings on page load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const { data } = await response.json();
          setSettings(data);
        } else {
          toast.error("Failed to load website settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Error loading settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (settings) {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };

  // Handle logo file change
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle hero background file change
  const handleHeroChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setHeroPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file and get path
  const uploadFile = async (
    file: File,
    type: "logo" | "hero"
  ): Promise<string> => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: JPEG, PNG, WebP`);
    }

    // Check file size
    const maxSize = type === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for logo, 5MB for hero
    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    // Get user data from localStorage to pass in headers
    const userData = localStorage.getItem("phc_user");
    if (!userData) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          // Include user data in header for authentication
          "x-user": userData,
        },
        body: formData,
        credentials: "include", // Include cookies for authentication
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error(
            "Authentication failed: " + (data.error || "Unauthorized")
          );
        } else if (response.status === 403) {
          throw new Error("Access denied: " + (data.error || "Forbidden"));
        } else if (response.status === 400) {
          throw new Error(data.error || "Invalid file");
        } else {
          throw new Error(data.error || "Upload failed");
        }
      }

      console.log("Upload response:", data);

      // Make sure the URL starts with a slash
      let url = data.data.url;
      if (url && !url.startsWith("/")) {
        url = "/" + url;
      }

      return url; // Return URL instead of filePath
    } catch (error) {
      console.error(`Upload error:`, error);
      throw error instanceof Error ? error : new Error("Unknown upload error");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);

    try {
      // Upload files if selected
      let updatedSettings = { ...settings };

      try {
        if (logoFile) {
          const logoUrl = await uploadFile(logoFile, "logo");
          updatedSettings.logoUrl = logoUrl;
          console.log("Logo uploaded successfully:", logoUrl);
        }

        if (heroFile) {
          console.log("Uploading hero file...");
          const heroUrl = await uploadFile(heroFile, "hero");
          updatedSettings.heroBackgroundUrl = heroUrl;
          console.log("Hero background uploaded successfully:", heroUrl);
        }
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        toast.error(
          `${
            uploadError instanceof Error
              ? uploadError.message
              : "File upload failed"
          }`
        );
        setSaving(false);
        return;
      }

      // Save updated settings
      console.log("Saving settings:", updatedSettings);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Include user data in header for authentication
          "x-user": localStorage.getItem("phc_user") || "",
        },
        body: JSON.stringify(updatedSettings),
        credentials: "include", // Include cookies for authentication
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Website settings updated successfully");
        setSettings(responseData.data);

        // Reset file states
        setLogoFile(null);
        setHeroFile(null);
        setLogoPreview(null);
        setHeroPreview(null);
      } else {
        console.error("Settings update error:", responseData);
        toast.error(
          `Failed to update settings: ${responseData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        `Error updating settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-4 bg-gray-300 rounded w-1/4 mb-6"></div>
        <div className="animate-pulse h-32 bg-gray-300 rounded mb-6"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black bg-white mb-2">
          Website Settings
        </h1>
        <p className="text-black">
          Manage website logo, hero background, and contact information.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 text-black">
                Website Logo
              </h2>
              <div className="flex items-start space-x-4">
                <div className="bg-gray-100 p-4 rounded-lg mb-4 w-32 h-32 flex items-center justify-center">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : settings?.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Current Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-black text-sm text-center">
                      No logo
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-1">
                    Upload New Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-black">
                    Recommended size: 150x150px. Max file size: 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Background Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 text-black">
                Hero Background
              </h2>
              <div className="bg-gray-100 p-2 rounded-lg mb-4 w-full h-40 overflow-hidden">
                {heroPreview ? (
                  <img
                    src={heroPreview}
                    alt="Hero Background Preview"
                    className="w-full h-full object-cover"
                  />
                ) : settings?.heroBackgroundUrl ? (
                  <img
                    src={
                      settings.heroBackgroundUrl.startsWith("/")
                        ? settings.heroBackgroundUrl
                        : `/${settings.heroBackgroundUrl}`
                    }
                    alt="Current Hero Background"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(
                        "Failed to load hero image:",
                        settings?.heroBackgroundUrl
                      );
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-black text-sm">
                    No hero background
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Upload New Hero Background
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-black">
                  Recommended size: 1920x600px. Max file size: 5MB.
                </p>
              </div>
            </div>
          </div>

          <hr className="my-8" />

          {/* Contact Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings?.email || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={settings?.phone || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={settings?.whatsapp || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
                <p className="mt-1 text-xs text-black">
                  Format: +628123456789 (include country code without spaces)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={settings?.address || ""}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">
                  Working Hours
                </label>
                <textarea
                  name="workingHours"
                  value={settings?.workingHours || ""}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="Example: Senin - Jumat: 08.00 - 17.00&#10;Sabtu: 09.00 - 15.00&#10;Minggu: Tutup"
                />
                <p className="mt-1 text-xs text-black">
                  Enter each day on a new line
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">
                  Map Location (Google Maps Embed URL)
                </label>
                <input
                  type="text"
                  name="mapLocation"
                  value={settings?.mapLocation || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="mt-1 text-xs text-black">
                  Masukkan URL embed Google Maps untuk menampilkan lokasi di
                  halaman Hubungi Kami
                </p>
                {settings?.mapLocation && (
                  <div className="mt-3 bg-gray-100 p-2 rounded-lg">
                    <p className="text-sm font-medium text-black mb-2">
                      Preview:
                    </p>
                    <div className="h-40 rounded-md overflow-hidden">
                      <iframe
                        src={settings.mapLocation}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider className="my-4">
            <Chip label="Social Media Links" />
          </Divider>

          <TextField
            name="facebook"
            label="Facebook URL"
            value={settings?.facebook || ""}
            onChange={handleChange}
            fullWidth
            placeholder="https://facebook.com/yourpage"
          />

          <TextField
            name="twitter"
            label="Twitter URL"
            value={settings?.twitter || ""}
            onChange={handleChange}
            fullWidth
            placeholder="https://twitter.com/yourhandle"
          />

          <TextField
            name="instagram"
            label="Instagram URL"
            value={settings?.instagram || ""}
            onChange={handleChange}
            fullWidth
            placeholder="https://instagram.com/yourprofile"
          />

          <TextField
            name="youtube"
            label="YouTube URL"
            value={settings?.youtube || ""}
            onChange={handleChange}
            fullWidth
            placeholder="https://youtube.com/yourchannel"
          />

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {saving ? (
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
          </div>
        </form>
      </div>
    </div>
  );
}
