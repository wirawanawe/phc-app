import React, { useState, useEffect } from "react";
import { Task } from "@/app/types";
import ConfirmDialog from "./ConfirmDialog";

interface TaskManagerProps {
  healthProgramId: string;
  healthProgramName?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({
  healthProgramId,
  healthProgramName,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    timePerformed: "",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Load tasks for the health program
  useEffect(() => {
    fetchTasks();
  }, [healthProgramId, statusFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `/api/tasks?healthProgramId=${healthProgramId}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Please try again later.");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          healthProgramId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          timePerformed: formData.timePerformed || null,
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        timePerformed: "",
      });

      setShowAddForm(false);
      fetchTasks();
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${currentTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          timePerformed: formData.timePerformed || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setShowEditForm(false);
      setCurrentTask(null);
      fetchTasks();
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error("Error updating task:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      fetchTasks();
    } catch (err) {
      setError("Failed to update task status. Please try again.");
      console.error("Error updating task status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    setTaskToDelete(taskId);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      fetchTasks();
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error("Error deleting task:", err);
    } finally {
      setLoading(false);
      setIsConfirmDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // Edit task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      timePerformed: task.timePerformed || "",
    });
    setShowEditForm(true);
  };

  // Handle form input changes
  const handleInputChange = (
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

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "inactive":
        return "Nonaktif";
      default:
        return status;
    }
  };

  // Format priority for display
  const formatPriority = (priority: string) => {
    switch (priority) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return priority;
    }
  };

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return "-";
    return timeString;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl text-black font-bold">
          Tugas Program {healthProgramName ? `- ${healthProgramName}` : ""}
        </h1>
        <button
          onClick={() => {
            setShowAddForm(true);
            setShowEditForm(false);
            setFormData({
              title: "",
              description: "",
              priority: "medium",
              timePerformed: "",
            });
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Tambah Tugas Baru
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Task List */}
      <div className="bg-white rounded-md shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tugas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioritas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Pelaksanaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Belum ada tugas yang dibuat untuk program ini
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                          task.priority
                        )}`}
                      >
                        {formatPriority(task.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(task.timePerformed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                        className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 mr-3"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl text-black font-semibold mb-4">
              Tambah Tugas Baru
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="title"
                >
                  Judul Tugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="description"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="priority"
                >
                  Prioritas
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="timePerformed"
                >
                  Jam Pelaksanaan
                </label>
                <input
                  type="time"
                  id="timePerformed"
                  name="timePerformed"
                  value={formData.timePerformed}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Form */}
      {showEditForm && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl text-black font-semibold mb-4">
              Edit Tugas
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateTask}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="title"
                >
                  Judul Tugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="description"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="priority"
                >
                  Prioritas
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="timePerformed"
                >
                  Jam Pelaksanaan
                </label>
                <input
                  type="time"
                  id="timePerformed"
                  name="timePerformed"
                  value={formData.timePerformed}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 text-black rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Hapus Tugas"
        message="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat diurungkan."
        onConfirm={confirmDeleteTask}
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};

export default TaskManager;
