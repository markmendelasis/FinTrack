/**
 * Formats a monetary amount into Philippine Peso (₱).
 *
 * @param amount - The numeric monetary value to format
 * @returns Formatted currency string, e.g. "₱1,250.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date string into a localized readable format.
 *
 * @param dateStr - ISO date string or Date object
 * @returns Formatted date string, e.g. "Nov 6, 2026"
 */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
