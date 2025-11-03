import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import MealProgressHeader from '../MealProgressHeader';

interface BarcodeAnalysisProcessingStepProps {
  barcode: string;
  productImage?: string;
  progress: number;
  progressMessage: string;
  progressSubMessage: string;
}

const BarcodeAnalysisProcessingStep: React.FC<BarcodeAnalysisProcessingStepProps> = ({
  barcode,
  productImage,
  progress,
  progressMessage,
  progressSubMessage,
}) => {
  return (
    <div className="space-y-6 w-full">
      <MealProgressHeader
        currentStep="processing"
        progress={progress}
        message={progressMessage}
        subMessage={progressSubMessage}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard
          className="p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(79, 70, 229, 0.05))',
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: productImage
                  ? 'rgba(99, 102, 241, 0.1)'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.15))',
                border: '2px solid rgba(99, 102, 241, 0.4)',
              }}
            >
              {productImage ? (
                <motion.img
                  src={productImage}
                  alt="Product"
                  className="w-full h-full object-contain p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              ) : (
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <SpatialIcon Icon={ICONS.ScanBarcode} size={64} className="text-indigo-300" />
                </motion.div>
              )}

              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), transparent)',
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-xl">Analyse du Code-Barre</h3>
              <p className="text-indigo-300 text-sm font-mono">{barcode}</p>
              <p className="text-gray-300 text-sm max-w-md">
                Récupération des données nutritionnelles depuis OpenFoodFacts...
              </p>
            </div>

            <div className="w-full max-w-md">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #6366F1, #818CF8)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-indigo-300 text-xs mt-2 text-center">
                {Math.round(progress)}% complété
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              {[
                { icon: ICONS.Database, label: 'OpenFoodFacts' },
                { icon: ICONS.Package, label: 'Produit' },
                { icon: ICONS.TrendingUp, label: 'Nutrition' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl"
                  style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    animate={{
                      scale: progress > (index + 1) * 30 ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <SpatialIcon
                      Icon={item.icon}
                      size={20}
                      className={progress > (index + 1) * 30 ? 'text-indigo-300' : 'text-gray-500'}
                    />
                  </motion.div>
                  <span
                    className={`text-xs font-medium ${
                      progress > (index + 1) * 30 ? 'text-indigo-300' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default BarcodeAnalysisProcessingStep;
