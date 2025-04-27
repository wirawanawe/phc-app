/**
 * Helper functions for working with user roles
 */

/**
 * Normalisasi role agar konsisten baik untuk display maupun validasi
 * @param role - Role user yang akan dinormalisasi
 * @returns Role yang sudah dinormalisasi
 */
export function normalizeRole(role: string): string {
  if (role === "part") return "participant";
  return role;
}

/**
 * Cek apakah user memiliki role tertentu
 * @param userRole - Role user yang akan dicek
 * @param expectedRole - Role yang diharapkan
 * @returns true jika role sesuai
 */
export function hasRole(userRole: string, expectedRole: string): boolean {
  const normalizedUserRole = normalizeRole(userRole);
  return normalizedUserRole === expectedRole;
}

/**
 * Menampilkan role dalam format yang lebih user-friendly
 * @param role - Role yang akan ditampilkan
 * @returns String role yang sudah diformat
 */
export function displayRole(role: string): string {
  const normalized = normalizeRole(role);

  // Format dengan huruf kapital di awal
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Mengkonversi role untuk penyimpanan di database
 * @param role - Role yang akan dikonversi
 * @returns Role untuk disimpan di database
 */
export function storageRole(role: string): string {
  if (role === "participant") return "part";
  return role;
}
