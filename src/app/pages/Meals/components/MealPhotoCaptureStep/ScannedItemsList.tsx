// src/app/pages/Meals/components/MealPhotoCaptureStep/ScannedItemsList.tsx
/**
 * Scanned Items List Component
 * Displays lists of scanned barcodes and analyzed products
 */

import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import ScannedProductCard from './ScannedProductCard';
import type { ScannedBarcode, ScannedProduct } from './types';

interface ScannedItemsListProps {
  scannedBarcodes: ScannedBarcode[];
  scannedProducts: ScannedProduct[];
  capturedPhoto: any | null;
  onBarcodeRemove: (barcode: string) => void;
  onProductPortionChange: (barcode: string, multiplier: number) => void;
  onProductRemove: (barcode: string) => void;
  onCameraClick: () => void;
  onGalleryClick: () => void;
}

const ScannedItemsList: React.FC<ScannedItemsListProps> = ({
  scannedBarcodes,
  scannedProducts,
  capturedPhoto,
  onBarcodeRemove,
  onProductPortionChange,
  onProductRemove,
  onCameraClick,
  onGalleryClick
}) => {
  return (
    <>
      {scannedBarcodes.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              <SpatialIcon Icon={ICONS.ScanBarcode} size={20} className="text-indigo-400" />
              <span>Codes-barres détectés</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                {scannedBarcodes.length}
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {scannedBarcodes.map((barcodeItem, index) => (
              <GlassCard
                key={`barcode-${barcodeItem.barcode}-${index}-${barcodeItem.scannedAt}`}
                className="p-4"
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(79, 70, 229, 0.2))',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                      }}
                    >
                      <SpatialIcon Icon={ICONS.ScanBarcode} size={24} className="text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm mb-1">{barcodeItem.barcode}</p>
                      <p className="text-indigo-300 text-xs">En attente d'analyse</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onBarcodeRemove(barcodeItem.barcode)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20"
                    style={{
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <SpatialIcon Icon={ICONS.X} size={16} className="text-red-400" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {!capturedPhoto && scannedBarcodes.length > 0 && (
            <div className="mt-4">
              <GlassCard
                className="p-4 text-center"
                style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderColor: 'rgba(99, 102, 241, 0.2)',
                }}
              >
                <p className="text-gray-300 text-sm mb-3">
                  Ajouter une photo pour enrichir votre analyse nutritionnelle
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onCameraClick}
                    className="flex-1 btn-glass touch-feedback-css"
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderColor: 'rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <SpatialIcon Icon={ICONS.Camera} size={16} />
                      <span className="text-sm font-medium">Appareil photo</span>
                    </div>
                  </button>
                  <button
                    onClick={onGalleryClick}
                    className="flex-1 btn-glass touch-feedback-css"
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderColor: 'rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <SpatialIcon Icon={ICONS.Image} size={16} />
                      <span className="text-sm font-medium">Galerie</span>
                    </div>
                  </button>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {scannedProducts.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Check} size={20} className="text-green-400" />
              <span>Produits analysés</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs font-bold">
                {scannedProducts.length}
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {scannedProducts.map((product) => (
              <ScannedProductCard
                key={product.barcode}
                product={product}
                onPortionChange={onProductPortionChange}
                onRemove={onProductRemove}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ScannedItemsList;
