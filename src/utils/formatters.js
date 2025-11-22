/**
 * Formatters
 * Currency, percentage, and number formatting
 */

/**
 * Format currency
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 * @param {number} value - Decimal value (0-1)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
  return `${Math.round(value * 100)}%`;
}

/**
 * Format large numbers (e.g., 15000 -> "15k")
 */
export function formatLargeNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

