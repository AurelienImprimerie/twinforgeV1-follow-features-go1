import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useUserStore } from '../../../../system/store/userStore';
import { bodyScanRepo } from '../../../../system/data/repositories/bodyScanRepo';
import HistoricalScanModal from './HistoricalScanModal';
import EmptyAvatarHistoryState from './EmptyAvatarHistoryState';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import { ConditionalMotion } from '../../../../lib/motion/ConditionalMotion';

const isValidNumber = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n);

const toNumber = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string') {
    const parsed = parseFloat(v);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  
  return undefined;
};

const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const formatOneDecimal = (n: number | undefined) =>
  isValidNumber(n) ? n.toFixed(1) : '-';

const formatWithUnit = (n: number | undefined, unit: string) =>
  isValidNumber(n) ? `${n.toFixed(1)} ${unit}` : '-';

const Badge: React.FC<{ children: React.ReactNode; tone?: 'info' | 'muted' }> = ({ children, tone = 'info' }) => (
  <span
    className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
      tone === 'info'
        ? 'bg-blue-500/15 text-blue-200 border border-blue-400/20'
        : 'bg-white/5 text-white/50 border border-white/10'
    }`}
  >
    {children}
  </span>
);

const Row: React.FC<{ icon: keyof typeof ICONS; label: string; value: string | number | undefined }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
      <SpatialIcon Icon={ICONS[icon]} size={14} className="text-white/70" />
    </div>
    <div className="flex-1 flex justify-between items-baseline">
      <span className="text-white/60 text-xs">{label}</span>
      <span className="text-white font-medium text-sm">{typeof value === 'number' ? value.toFixed(1) : value}</span>
    </div>
  </div>
);

const HistoryTab: React.FC = () => {
  const { profile } = useUserStore();
  const userId = profile?.userId;
  const { isPerformanceMode } = usePerformanceMode();

  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(4);

  const { data: scans, isLoading, error } = useQuery({
    queryKey: ['body-scan-history', userId, displayLimit],
    queryFn: () => bodyScanRepo.getHistory(userId!, displayLimit),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - reduced from 5 minutes for faster updates
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
  });

  const handleViewScan = (scanId: string) => {
    setSelectedScanId(scanId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedScanId(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <GlassCard 
        className="text-center p-8"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-body-scan-primary) 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity-base)
          `,
          borderColor: 'color-mix(in srgb, var(--color-body-scan-primary) 25%, transparent)',
          boxShadow: `
            var(--glass-shadow-sm),
            0 0 16px color-mix(in srgb, var(--color-body-scan-primary) 10%, transparent)
          `
        }}
      >
        <SpatialIcon Icon={ICONS.Loader2} size={48} className="bodyscan-text-accent loader-essential mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-3">Chargement de l'historique...</h3>
        <p className="text-white/70 text-sm">Récupération de vos scans passés.</p>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard 
        className="text-center p-8"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-body-scan-error) 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity-base)
          `,
          borderColor: 'color-mix(in srgb, var(--color-body-scan-error) 25%, transparent)',
          boxShadow: `
            var(--glass-shadow-sm),
            0 0 16px color-mix(in srgb, var(--color-body-scan-error) 10%, transparent)
          `
        }}
      >
        <SpatialIcon Icon={ICONS.AlertCircle} size={48} className="bodyscan-text-error mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-3">Erreur de chargement</h3>
        <p className="bodyscan-text-error text-sm mb-6">{(error as any)?.message}</p>
        <button onClick={() => window.location.reload()} className="btn-glass--primary">
          Réessayer
        </button>
      </GlassCard>
    );
  }

  if (!scans || scans.length === 0) {
    return <EmptyAvatarHistoryState />;
  }

  // Filter scans to only include those with valid UUIDs
  const validScans = scans.filter((scan: any) => {
    const hasValidId = scan.id && typeof scan.id === 'string' && isValidUUID(scan.id);
    console.log('Scan ID:', scan.id, 'Valid UUID:', hasValidId);
    return hasValidId;
  });

  const HistoryIcon = ICONS.History;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 4);
  };

  const canLoadMore = scans && scans.length > 0 && scans.length === displayLimit;

  return (
    <ConditionalMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6 w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {validScans.map((scan: any) => {
            const scanDate = new Date(scan.created_at);

            // 1) Récupération depuis metrics
            const metrics = scan?.metrics;
            const weightFromScan =
              toNumber(metrics?.estimate_result?.extracted_data?.raw_measurements?.weight_kg) ??
              toNumber(metrics?.estimate_result?.weight_kg) ??
              toNumber(metrics?.weight_kg);

            const heightFromScan =
              toNumber(metrics?.estimate_result?.extracted_data?.raw_measurements?.height_cm) ??
              toNumber(metrics?.estimate_result?.height_cm) ??
              toNumber(metrics?.height_cm);

            const bmiFromScan =
              toNumber(metrics?.estimate_result?.estimated_bmi) ??
              toNumber(metrics?.estimated_bmi);

            // 2) Fallback profil
            const usedProfileWeight = !isValidNumber(weightFromScan) && isValidNumber(toNumber(profile?.weight_kg));
            const usedProfileHeight = !isValidNumber(heightFromScan) && isValidNumber(toNumber(profile?.height_cm));

            const resolvedWeightKg = weightFromScan ?? toNumber(profile?.weight_kg);
            const resolvedHeightCm = heightFromScan ?? toNumber(profile?.height_cm);

            // 3) Calcul IMC si nécessaire
            let resolvedBmi = bmiFromScan;
            if (
              !isValidNumber(resolvedBmi) &&
              isValidNumber(resolvedWeightKg) &&
              isValidNumber(resolvedHeightCm) &&
              resolvedHeightCm > 0
            ) {
              const hMeters = resolvedHeightCm / 100;
              resolvedBmi = resolvedWeightKg / (hMeters * hMeters);
            }

            const confidence = toNumber(
              metrics?.estimate_result?.extracted_data?.processing_confidence
            );

            return (
              <ConditionalMotion
                key={scan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard
                  interactive
                  className="p-6"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-body-scan-primary) 8%, transparent) 0%, transparent 60%),
                      var(--glass-opacity-base)
                    `,
                    borderColor: 'color-mix(in srgb, var(--color-body-scan-primary) 25%, transparent)',
                    boxShadow: `
                      var(--glass-shadow-sm),
                      0 0 16px color-mix(in srgb, var(--color-body-scan-primary) 10%, transparent)
                    `
                  }}
                  onClick={() => handleViewScan(scan.id)}
                >
                  {/* En-tête */}
                  <div className="bodyscan-flex-between">
                    <div className="bodyscan-flex-center bodyscan-gap-sm">
                      <div className="bodyscan-header-icon-container" style={{ width: '2.25rem', height: '2.25rem' }}>
                        <SpatialIcon Icon={HistoryIcon} size={18} style={{ color: 'var(--color-body-scan-primary)' }} variant="pure" />
                      </div>
                      <h4 className="text-white font-semibold text-lg">
                        Scan du {format(scanDate, 'dd MMMM yyyy', { locale: fr })}
                      </h4>
                    </div>
                    <div className="text-xs text-white/50">
                      {format(scanDate, 'HH:mm', { locale: fr })}
                    </div>
                  </div>

                  {/* Valeurs */}
                  <div className="space-y-3 mt-4">
                    <div className="history-metric-row">
                      <Row icon="Scale" label="Poids" value={isValidNumber(resolvedWeightKg) ? resolvedWeightKg : '-' as any} />
                      {usedProfileWeight && <Badge tone="muted">profil</Badge>}
                    </div>
                    <div className="history-metric-row">
                      <Row icon="Ruler" label="Taille" value={isValidNumber(resolvedHeightCm) ? resolvedHeightCm : '-' as any} />
                      {usedProfileHeight && <Badge tone="muted">profil</Badge>}
                    </div>
                    <div className="history-metric-row">
                      <Row icon="Activity" label="IMC" value={isValidNumber(resolvedBmi) ? resolvedBmi : '-' as any} />
                    </div>
                    {isValidNumber(confidence) && (
                      <div className="history-metric-row flex items-center gap-2 text-xs text-white/60">
                        <SpatialIcon Icon={ICONS.Shield} size={14} className="text-white/60" />
                        <span>Confiance</span>
                        <span className="text-white/80 font-medium">{Math.round(confidence * 100)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Séparateur + bouton (espacé) */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button className="btn-glass--secondary-nav bodyscan-size-full py-2 text-sm">
                      Voir le scan
                    </button>
                  </div>
                </GlassCard>
              </ConditionalMotion>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {canLoadMore && (
        <div className="flex justify-center mt-8">
          <ConditionalMotion
            as="button"
            onClick={handleLoadMore}
            className="btn-glass--secondary px-6 py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.ChevronDown} size={16} className="text-white/70" />
              <span>Charger plus de scans</span>
            </div>
          </ConditionalMotion>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && selectedScanId && (
          <HistoricalScanModal scanId={selectedScanId} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </ConditionalMotion>
  );
};

export default HistoryTab;