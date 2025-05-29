/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns Formatted date string in the format "DD MMMM YYYY"
 */
export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return "-";
  }

  // Define months in Bahasa Indonesia
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format a time string to a more readable format
 * @param time Time string in format "HH:MM:SS"
 * @returns Formatted time string in the format "HH:MM"
 */
export function formatTime(time: string): string {
  if (!time) return "-";

  // Extract hours and minutes from the time string
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return time;

  return `${hours}:${minutes}`;
}

/**
 * Format a date to a short string
 * @param date The date to format
 * @returns Formatted date string in the format "DD/MM/YYYY"
 */
export function formatShortDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format a date to be used in an input[type="date"] field
 * @param date The date to format
 * @returns Formatted date string in the format "YYYY-MM-DD"
 */
export function formatDateForInput(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
