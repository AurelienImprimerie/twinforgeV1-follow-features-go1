/**
 * Utility functions for shopping list components
 */

/**
 * Helper function to check CSS support with fallback
 */
export const cssSupports = (property: string, value: string, fallback: string): string => {
  return CSS.supports(property, value) ? value : fallback;
};

/**
 * Format cents to euros with proper currency formatting
 * @param cents - Amount in cents (integer)
 * @param options - Formatting options
 * @returns Formatted string like "12,50 €" or "12.50 EUR"
 */
export function formatCentsToEuros(
  cents: number,
  options: {
    showSymbol?: boolean;
    locale?: string;
    compact?: boolean;
  } = {}
): string {
  const {
    showSymbol = true,
    locale = 'fr-FR',
    compact = false
  } = options;

  if (cents === 0 || cents === null || cents === undefined) {
    return showSymbol ? '0 €' : '0';
  }

  const euros = cents / 100;

  if (compact && euros >= 1000) {
    // For large amounts, show as "1,2k €"
    return `${(euros / 1000).toFixed(1)}k ${showSymbol ? '€' : ''}`.trim();
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(euros);

  return formatted;
}

/**
 * Format a budget range from min/max cents
 * @param minCents - Minimum amount in cents
 * @param maxCents - Maximum amount in cents
 * @returns Formatted string like "60-85 €"
 */
export function formatBudgetRange(minCents: number, maxCents: number, locale: string = 'fr-FR'): string {
  if (!minCents && !maxCents) {
    return 'Non estimé';
  }

  if (minCents === maxCents) {
    return formatCentsToEuros(minCents, { locale });
  }

  const minEuros = (minCents / 100).toFixed(0);
  const maxEuros = (maxCents / 100).toFixed(0);

  return `${minEuros}-${maxEuros} €`;
}