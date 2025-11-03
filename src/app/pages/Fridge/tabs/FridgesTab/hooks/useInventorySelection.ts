import { useState } from 'react';
import { useFeedback } from '../../../../../../hooks/useFeedback';

interface FridgeSession {
  id: string;
  created_at: string;
  inventory_final: any[];
  status: string;
}

export const useInventorySelection = () => {
  const { click } = useFeedback();
  const [selectedInventorySessionId, setSelectedInventorySessionId] = useState<string | null>(null);

  const handleInventorySelect = (session: FridgeSession) => {
    click();
    setSelectedInventorySessionId(session.id);
    
    // Smooth scroll to actions card
    setTimeout(() => {
      const actionsElement = document.getElementById('selected-inventory-actions');
      if (actionsElement) {
        actionsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return {
    selectedInventorySessionId,
    handleInventorySelect,
    setSelectedInventorySessionId
  };
};