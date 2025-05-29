"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  author: string;
  imageUrl: string | null;
  publishedDate: string | null;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/articles?published=true");

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();
        setArticles(data);
      } catch (error) {
        toast.error("Failed to load articles");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-6 main-content">
        <Toaster position="top-right" />

        <div className="mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">
              Artikel Kesehatan
            </h1>
            <p className="text-sm text-black">
              Temukan informasi terbaru seputar kesehatan dan gaya hidup sehat
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#E32345] border-t-transparent"></div>
              <p className="mt-4 text-black">Memuat artikel...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-black">Tidak ada artikel</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="block"
                >
                  <article className="bg-white rounded-lg overflow-hidden h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    {article.imageUrl ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}

                    <div className="p-4 flex-grow">
                      <h2 className="text-lg font-semibold text-black mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      <div className="flex items-center text-xs text-black mb-2">
                        <span className="mr-2">Oleh {article.author}</span>
                        <span>•</span>
                        <span className="ml-2">
                          {formatDate(article.publishedDate)}
                        </span>
                      </div>
                      <p className="text-sm text-black line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="mt-3">
                        <span className="text-[#E32345] text-xs font-medium">
                          Baca selengkapnya →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
