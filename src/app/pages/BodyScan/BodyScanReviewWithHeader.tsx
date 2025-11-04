import React from 'react';
import UnderConstructionCard from '../../components/UnderConstructionCard';

const BodyScanReviewWithHeader: React.FC = () => {
  return (
    <div className="page-container">
      <UnderConstructionCard
        title="Body Scan - Review"
        description="Révision de votre scan corporel"
      />
    </div>
  );
};

export default BodyScanReviewWithHeader;
