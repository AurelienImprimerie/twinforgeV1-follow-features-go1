/**
 * Utility functions for shopping list components
 */

/**
 * Helper function to check CSS support with fallback
 */
export const cssSupports = (property: string, value: string, fallback: string): string => {
  return CSS.supports(property, value) ? value : fallback;
};