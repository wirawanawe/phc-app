"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  imageUrl: string | null;
  isPublished: boolean;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const queryParam =
        filter === "published"
          ? "?published=true"
          : filter === "draft"
          ? "?published=false"
          : "";

      const response = await fetch(`/api/articles${queryParam}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      // Remove the deleted article from the state
      setArticles(articles.filter((article) => article.id !== id));
      toast.success("Article deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete article"
      );
    }
  };

  const togglePublishStatus = async (article: Article) => {
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          isPublished: !article.isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update article status");
      }

      const updatedArticle = await response.json();

      // Update the article in the local state
      setArticles(
        articles.map((a) => (a.id === article.id ? updatedArticle : a))
      );

      toast.success(
        `Article ${
          updatedArticle.isPublished ? "published" : "unpublished"
        } successfully`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update article status"
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Article
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            All Articles
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-2 rounded ${
              filter === "published"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded ${
              filter === "draft"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading articles...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No articles found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Author</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Published Date</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {article.imageUrl && (
                        <div className="mr-3 w-10 h-10 relative overflow-hidden rounded">
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            width={40}
                            height={40}
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {article.summary.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{article.author}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        article.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {article.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(article.publishedDate)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => togglePublishStatus(article)}
                        className={`px-2 py-1 rounded text-xs ${
                          article.isPublished
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {article.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/admin/articles/edit/${article.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
