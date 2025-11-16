import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import WidgetHeader from '../../../shared/WidgetHeader';
import { useBodyScanData } from '@/hooks/useBodyScanData';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

export default function BodyMetricsSection() {
  const navigate = useNavigate();
  const { bodyScanData, isLoading } = useBodyScanData();
  const { performanceMode } = usePerformanceMode();

  const handleNavigateToBodyScan = () => {
    navigate('/body-scan');
  };

  // Extract measurements from body scan data
  const extractMeasurements = () => {
    if (!bodyScanData) return null;

    const rawMeasurements = bodyScanData.raw_measurements || {};

    // Try multiple sources for measurements
    const waist = rawMeasurements.waist_cm || bodyScanData.waist_circumference || null;
    const chest = rawMeasurements.chest_cm || null;
    const hips = rawMeasurements.hips_cm || null;

    return { waist, chest, hips };
  };

  const measurements = extractMeasurements();
  const hasAnyMeasurement = measurements && (measurements.waist || measurements.chest || measurements.hips);

  return (
    <motion.button
      onClick={handleNavigateToBodyScan}
      className="w-full text-left glass-card-premium rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden cursor-pointer group"
      style={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(247, 147, 30, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(251, 191, 36, 0.12) 0%, transparent 50%),
          rgba(255, 255, 255, 0.03)
        `,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: '1px solid rgba(247, 147, 30, 0.3)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Hover glow effect */}
      {performanceMode === 'premium' && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(247, 147, 30, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Widget Header */}
      <div className="relative">
        <WidgetHeader
          icon="Scan"
          mainColor="#F7931E"
          glowColor="#FBBF24"
          title={hasAnyMeasurement ? "Données Corporelles" : "Créez votre Twin"}
          subtitle={hasAnyMeasurement ? "Consulter vos mensurations" : "Réalisez votre premier scan pour visualiser vos mensurations en temps réel"}
          animationType="glow"
        />
      </div>

      {/* Content */}
      <div className="relative space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-4 animate-pulse"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="h-4 w-20 bg-white/10 rounded mb-2" />
                <div className="h-8 w-16 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : hasAnyMeasurement ? (
          <div className="grid grid-cols-3 gap-3">
            {/* Tour de taille */}
            {measurements.waist && (
              <div
                className="glass-card rounded-xl p-4 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(251, 191, 36, 0.05))'
                }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <SpatialIcon name="Circle" size={14} color="#F7931E" />
                  <span className="text-xs text-white/60 font-medium">Taille</span>
                </div>
                <p className="text-2xl font-black text-white">{measurements.waist.toFixed(1)}</p>
                <p className="text-xs text-white/50 mt-0.5">cm</p>
              </div>
            )}

            {/* Tour de poitrine */}
            {measurements.chest && (
              <div
                className="glass-card rounded-xl p-4 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(251, 191, 36, 0.05))'
                }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <SpatialIcon name="User" size={14} color="#F7931E" />
                  <span className="text-xs text-white/60 font-medium">Poitrine</span>
                </div>
                <p className="text-2xl font-black text-white">{measurements.chest.toFixed(1)}</p>
                <p className="text-xs text-white/50 mt-0.5">cm</p>
              </div>
            )}

            {/* Tour de hanches */}
            {measurements.hips && (
              <div
                className="glass-card rounded-xl p-4 border border-white/10 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(251, 191, 36, 0.05))'
                }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <SpatialIcon name="CircleDot" size={14} color="#F7931E" />
                  <span className="text-xs text-white/60 font-medium">Hanches</span>
                </div>
                <p className="text-2xl font-black text-white">{measurements.hips.toFixed(1)}</p>
                <p className="text-xs text-white/50 mt-0.5">cm</p>
              </div>
            )}
          </div>
        ) : null}

        {/* CTA Button */}
        <motion.div
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg relative overflow-hidden flex items-center justify-center gap-2"
          style={{
            boxShadow: '0 4px 20px rgba(247, 147, 30, 0.4)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SpatialIcon name="Scan" size={18} color="white" />
          <span>
            {hasAnyMeasurement ? 'Scanner mon corps' : 'Créer mon twin'}
          </span>
        </motion.div>
      </div>
    </motion.button>
  );
}
