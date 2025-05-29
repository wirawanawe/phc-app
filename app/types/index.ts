export interface Doctor {
  id: string;
  name: string;
  spesialization: string;
  email?: string;
  phone?: string;
  schedule?: string; // JSON string containing doctor's practice schedule
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  identityNumber?: string;
  insuranceId?: string;
  insuranceNumber?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  participantId: string;
  doctorId: string;
  date: string;
  time?: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

export interface ProgramCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

export interface HealthProgram {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  maxParticipants?: number;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  category?: ProgramCategory;
}

export interface Task {
  id: string;
  healthProgramId: string;
  title: string;
  description: string;
  timePerformed?: string;
  status: "active" | "inactive";
  priority: "low" | "medium" | "high";
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  password?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  token?: string; // Token autentikasi JWT
}

export interface Spesialization {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Insurance {
  id: string;
  name: string;
  description: string;
  coverage: string;
  isActive: boolean;
  createdAt: string;
}
