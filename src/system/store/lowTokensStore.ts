import { create } from 'zustand';
import logger from '../../lib/utils/logger';

interface LowTokensState {
  isOpen: boolean;
  requiredTokens: number;
  availableTokens: number;
  showLowTokensModal: (required: number, available: number) => void;
  closeLowTokensModal: () => void;
}

export const useLowTokensStore = create<LowTokensState>((set) => ({
  isOpen: false,
  requiredTokens: 0,
  availableTokens: 0,

  showLowTokensModal: (required: number, available: number) => {
    logger.info('LOW_TOKENS_STORE', 'Showing low tokens modal', {
      requiredTokens: required,
      availableTokens: available
    });

    set({
      isOpen: true,
      requiredTokens: required,
      availableTokens: available
    });
  },

  closeLowTokensModal: () => {
    logger.info('LOW_TOKENS_STORE', 'Closing low tokens modal');

    set({
      isOpen: false,
      requiredTokens: 0,
      availableTokens: 0
    });
  }
}));
