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

/**
 * Formats backend and RPC errors into clear, explanatory user-friendly messages.
 *
 * @param err - Unknown error object, PostgREST error, or string
 * @param actionContext - Context prefix describing what action failed
 * @returns Clean message e.g. "Transaction was not successfully created: Insufficient balance in Maya (₱200.00 available, ₱500.00 required)."
 */
export function formatErrorMessage(err: unknown, actionContext?: string): string {
  let reason = 'An unexpected error occurred';

  if (typeof err === 'string') {
    reason = err;
  } else if (err && typeof err === 'object') {
    const anyErr = err as {
      message?: string;
      details?: string;
      hint?: string;
      error_description?: string;
    };
    if (anyErr.message) {
      reason = anyErr.message;
    } else if (anyErr.error_description) {
      reason = anyErr.error_description;
    } else if (anyErr.details) {
      reason = anyErr.details;
    }
  }

  console.log(reason);

  // Strip Postgres exception codes like "P0001: " or "error: "
  reason = reason.replace(/^[A-Z0-9]{5}:\s*/, '');
  reason = reason.replace(/^error:\s*/i, '');
  const trimmed = reason.trim();

  if (actionContext) {
    return `${actionContext}: ${trimmed}`;
  }

  console.log(trimmed);
  return trimmed;
  

}
