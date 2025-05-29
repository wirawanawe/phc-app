"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  imageUrl: string | null;
  publishedDate: string | null;
  createdAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${articleId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }

        const data = await response.json();
        setArticle(data);
      } catch (error) {
        toast.error("Failed to load article");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-6 main-content">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#E32345] border-t-transparent"></div>
            <p className="mt-4 text-black">Memuat artikel...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-6 main-content">
          <div className="text-center py-8 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-black mb-4">
              Artikel Tidak Ditemukan
            </h1>
            <p className="text-black mb-6">
              Artikel yang Anda cari tidak ada atau telah dihapus.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center text-[#E32345] hover:text-[#c51e3b]"
            >
              <span>← Kembali ke Daftar Artikel</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <Link
            href="/articles"
            className="inline-flex items-center text-[#E32345] hover:text-[#c51e3b] mb-4 text-sm"
          >
            <span>← Kembali ke Daftar Artikel</span>
          </Link>

          <article className="bg-white rounded-lg overflow-hidden">
            {article.imageUrl && (
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="px-1 py-2">
              <h1 className="text-2xl font-bold text-black mb-3">
                {article.title}
              </h1>

              <div className="flex items-center text-sm text-black mb-6">
                <span className="mr-3">Oleh {article.author}</span>
                <span>•</span>
                <span className="ml-3">
                  {formatDate(article.publishedDate)}
                </span>
              </div>

              <div className="prose max-w-none">
                <p className="text-base text-black mb-6">{article.summary}</p>
                <div
                  className="text-base text-black space-y-4 article-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </div>
  );
}
