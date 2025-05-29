"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import React from "react";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    author: "",
    imageUrl: "",
    isPublished: false,
  });

  // State for file upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Fetch article data on component mount
    const fetchArticle = async () => {
      if (!articleId) return;

      try {
        setLoading(true);

        // Get token from localStorage first
        let authToken = localStorage.getItem("phc_token");

        // If no token in localStorage, try to get from user data
        if (!authToken) {
          const userData = localStorage.getItem("phc_user");
          if (userData) {
            try {
              const user = JSON.parse(userData);
              if (user.token) {
                authToken = user.token;
              }
            } catch (e) {
              console.error("Failed to parse user data:", e);
            }
          }
        }

        // If still no token, try to get from cookie
        if (!authToken) {
          const cookies = document.cookie
            .split(";")
            .map((cookie) => cookie.trim());
          const phcTokenCookie = cookies.find((cookie) =>
            cookie.startsWith("phc_token=")
          );
          if (phcTokenCookie) {
            authToken = phcTokenCookie.substring("phc_token=".length);
          }
        }

        if (!authToken) {
          toast.error("Authentication token not found. Please login again.");
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/articles/${articleId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Session expired. Please login again.");
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch article");
        }

        const article = await response.json();
        setFormData({
          title: article.title,
          summary: article.summary,
          content: article.content,
          author: article.author,
          imageUrl: article.imageUrl || "",
          isPublished: article.isPublished,
        });
      } catch (error) {
        toast.error("Failed to load article data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle image file change
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file and get URL
  const uploadFile = async (file: File): Promise<string> => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Allowed types: JPEG, PNG, WebP");
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "article");

    // Get token from localStorage first
    let authToken = localStorage.getItem("phc_token");

    // If no token in localStorage, try to get from user data
    if (!authToken) {
      const userData = localStorage.getItem("phc_user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.token) {
            authToken = user.token;
          }
        } catch (e) {
          console.error("Failed to parse user data:", e);
        }
      }
    }

    // If still no token, try to get from cookie
    if (!authToken) {
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
      const phcTokenCookie = cookies.find((cookie) =>
        cookie.startsWith("phc_token=")
      );
      if (phcTokenCookie) {
        authToken = phcTokenCookie.substring("phc_token=".length);
      }
    }

    if (!authToken) {
      throw new Error("Authentication token not found. Please login again.");
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(data.error || "Upload failed");
      }

      // Make sure the URL starts with a slash
      let url = data.data.url;
      if (url && !url.startsWith("/")) {
        url = "/" + url;
      }

      return url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error instanceof Error ? error : new Error("Unknown upload error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.content ||
      !formData.summary ||
      !formData.author
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!articleId) {
      toast.error("Article ID is missing");
      return;
    }

    try {
      setSubmitting(true);

      // Get token from localStorage first
      let authToken = localStorage.getItem("phc_token");

      // If no token in localStorage, try to get from user data
      if (!authToken) {
        const userData = localStorage.getItem("phc_user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.token) {
              authToken = user.token;
            }
          } catch (e) {
            console.error("Failed to parse user data:", e);
          }
        }
      }

      // If still no token, try to get from cookie
      if (!authToken) {
        const cookies = document.cookie
          .split(";")
          .map((cookie) => cookie.trim());
        const phcTokenCookie = cookies.find((cookie) =>
          cookie.startsWith("phc_token=")
        );
        if (phcTokenCookie) {
          authToken = phcTokenCookie.substring("phc_token=".length);
        }
      }

      if (!authToken) {
        toast.error("Authentication token not found. Please login again.");
        router.push("/login");
        return;
      }

      // Upload image if selected
      let updatedFormData = { ...formData };

      if (imageFile) {
        try {
          const imageUrl = await uploadFile(imageFile);
          updatedFormData.imageUrl = imageUrl;
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          toast.error(
            `${
              uploadError instanceof Error
                ? uploadError.message
                : "File upload failed"
            }`
          );
          setSubmitting(false);
          return;
        }
      }

      // Make API request with Authorization header
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedFormData),
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        }
        throw new Error(errorData.error || "Failed to update article");
      }

      toast.success("Article updated successfully");
      router.push("/admin/articles");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update article"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading article data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black bg-white">Edit Article</h1>
        <Link
          href="/admin/articles"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Articles
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-black mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="author"
              className="block text-sm font-medium text-black mb-1"
            >
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-black mb-1"
            >
              Summary *
            </label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Brief summary of the article (150-200 characters recommended)
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-black mb-1"
            >
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-black mb-2"
            >
              Featured Image
            </label>
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-2 rounded-lg mb-4 w-40 h-40 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Article Featured Image Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Current Featured Image"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="text-black text-sm text-center">No image</div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-black">
                  Recommended size: 1200x630px. Max file size: 5MB.
                </p>
                {formData.imageUrl && !imagePreview && (
                  <p className="mt-2 text-xs text-black">
                    Current URL: {formData.imageUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublished"
                className="ml-2 block text-sm text-black"
              >
                Published
              </label>
            </div>
            <p className="text-xs text-black mt-1">
              Toggle to publish or unpublish this article
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/articles")}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded mr-2"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Update Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
