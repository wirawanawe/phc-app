import React, { useState, useEffect } from "react";
import { HealthProgram, ProgramCategory } from "@/app/types";

interface HealthProgramFormProps {
  program?: HealthProgram | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const HealthProgramForm: React.FC<HealthProgramFormProps> = ({
  program,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    startDate: "",
    endDate: "",
    location: "",
    maxParticipants: "",
    status: "active",
  });
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (program) {
      // Format dates to YYYY-MM-DD for the date inputs
      const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        name: program.name || "",
        description: program.description || "",
        categoryId: program.categoryId || "",
        startDate: formatDate(program.startDate),
        endDate: formatDate(program.endDate),
        location: program.location || "",
        maxParticipants: program.maxParticipants?.toString() || "",
        status: program.status || "active",
      });
    }

    fetchCategories();
  }, [program]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/program-categories?isActive=true");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert maxParticipants to a number if it's not empty
    const data = {
      ...formData,
      maxParticipants: formData.maxParticipants
        ? parseInt(formData.maxParticipants)
        : undefined,
      categoryId: formData.categoryId || null,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Nama Program <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Contoh: Program Kesehatan Jantung"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Kategori Program
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Memuat kategori...
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Deskripsi <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Deskripsi tentang program kesehatan"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Tanggal Mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Tanggal Selesai
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Lokasi
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Lokasi program kesehatan"
          />
        </div>
        <div>
          <label
            htmlFor="maxParticipants"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Maksimal Peserta
          </label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="1"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Jumlah maksimal peserta"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        >
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : program ? "Perbarui" : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default HealthProgramForm;
