import React, { useState, useEffect } from "react";
import { ProgramCategory } from "@/app/types";

interface CategoryFormProps {
  category?: ProgramCategory | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const COLORS = [
  { name: "Biru", value: "blue" },
  { name: "Hijau", value: "green" },
  { name: "Merah", value: "red" },
  { name: "Kuning", value: "yellow" },
  { name: "Ungu", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Abu-abu", value: "gray" },
  { name: "Indigo", value: "indigo" },
  { name: "Teal", value: "teal" },
  { name: "Orange", value: "orange" },
];

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue",
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        color: category.color || "blue",
        isActive: category.isActive,
      });
    }
  }, [category]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Nama Kategori <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Contoh: Kesehatan Jantung"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Deskripsi singkat kategori program"
        ></textarea>
      </div>

      <div className="mb-4">
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Warna
        </label>
        <select
          id="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        >
          {COLORS.map((color) => (
            <option key={color.value} value={color.value}>
              {color.name}
            </option>
          ))}
        </select>
        <div className="mt-2 flex items-center">
          <div
            className={`w-6 h-6 rounded-full bg-${formData.color}-500 mr-2`}
          ></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Preview warna
          </span>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({
              ...formData,
              isActive: e.target.checked,
            })
          }
          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="isActive"
          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Kategori Aktif
        </label>
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
          {isSubmitting ? "Menyimpan..." : category ? "Perbarui" : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
