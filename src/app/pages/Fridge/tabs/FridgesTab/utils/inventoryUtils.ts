/**
 * Format a date string to French locale format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get a preview string of inventory items
 */
export const getInventoryPreview = (inventory: any[]): string => {
  if (!inventory || inventory.length === 0) return 'Inventaire vide';
  
  const itemNames = inventory
    .slice(0, 3)
    .map(item => item.name || item.item || 'Article')
    .join(', ');
  
  const remaining = inventory.length - 3;
  return remaining > 0 ? `${itemNames} et ${remaining} autre${remaining > 1 ? 's' : ''}` : itemNames;
};