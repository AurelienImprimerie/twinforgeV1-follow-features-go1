import React from 'react';
import { useLowTokensStore } from '../../../system/store/lowTokensStore';
import LowTokensModal from './LowTokensModal';

const GlobalLowTokensModal: React.FC = () => {
  const { isOpen, requiredTokens, availableTokens, closeLowTokensModal } = useLowTokensStore();

  return (
    <LowTokensModal
      isOpen={isOpen}
      requiredTokens={requiredTokens}
      availableTokens={availableTokens}
      onClose={closeLowTokensModal}
    />
  );
};

export default GlobalLowTokensModal;
