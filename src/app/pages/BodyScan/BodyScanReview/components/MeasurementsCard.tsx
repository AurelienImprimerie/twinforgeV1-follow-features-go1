import React from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../../hooks/useBodyScanPerformance';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import { type SkinToneV2, isSkinToneV2 } from '../../../../../lib/scan/normalizeSkinTone';
import logger from '../../../../../lib/utils/logger';
import './measurements.css';

interface MeasurementsCardProps {
  scanResults: any;
  userProfile: {
    sex: 'male' | 'female';
    height_cm: number;
    weight_kg: number;
  };
  skinTone?: SkinToneV2 | null;
}

// Traductions françaises pour les mesures
const MEASUREMENT_TRANSLATIONS: Record<string, string> = {
  waist_cm: 'Tour de taille',
  chest_cm: 'Tour de poitrine',
  hips_cm: 'Tour de hanches',
  shoulder_width_cm: 'Largeur d\'épaules',
  neck_cm: 'Tour de cou',
  arm_length_cm: 'Longueur de bras',
  bicep_cm: 'Tour de biceps',
  thigh_cm: 'Tour de cuisse',
  calf_cm: 'Tour de mollet',
  forearm_cm: 'Tour d\'avant-bras',
  wrist_cm: 'Tour de poignet',
  ankle_cm: 'Tour de cheville',
  height_cm: 'Taille',
  weight_kg: 'Poids',
  inseam_cm: 'Entrejambe',
  torso_length_cm: 'Longueur du torse',
  estimated_body_fat_perc: 'Masse Grasse Estimée',
  estimated_muscle_mass_kg: 'Masse Musculaire Estimée',
  waist_to_hip_ratio: 'Ratio Taille/Hanches',
};

/**
 * Calculate estimated body age based on BMI and body fat percentage
 */
function calculateBodyAge(bmi: number, bodyFatPerc: number, userSex: 'male' | 'female'): number {
  // Simplified formula for illustrative purposes (not medically accurate)
  const baseBMI = 22; // Ideal BMI
  const idealBodyFat = userSex === 'male' ? 15 : 25; // Ideal body fat by gender
  
  // Calculate deviations
  const bmiDeviation = Math.abs(bmi - baseBMI) / baseBMI;
  const bodyFatDeviation = Math.abs(bodyFatPerc - idealBodyFat) / idealBodyFat;
  
  // Base age adjustment (simplified calculation)
  const ageAdjustment = (bmiDeviation + bodyFatDeviation) * 15;
  
  // Assume base age of 30 and adjust
  const estimatedAge = 30 + ageAdjustment;
  
  return Math.max(18, Math.min(65, estimatedAge)); // Clamp between 18-65
}

/**
 * Calculate ideal weight based on height
 */
function calculateIdealWeight(height_cm: number): number {
  // Using BMI of 22 as ideal
  const idealBMI = 22;
  const heightInMeters = height_cm / 100;
  return idealBMI * heightInMeters * heightInMeters;
}

/**
 * Get BMI category and color
 */
function getBMIInfo(bmi: number): { category: string; color: string; description: string } {
  if (bmi < 18.5) {
    return {
      category: 'Insuffisant',
      color: '#06B6D4',
      description: 'Poids en dessous de la normale'
    };
  } else if (bmi < 25) {
    return {
      category: 'Normal',
      color: '#10B981',
      description: 'Poids dans la plage normale'
    };
  } else if (bmi < 30) {
    return {
      category: 'Surpoids',
      color: '#F59E0B',
      description: 'Poids au-dessus de la normale'
    };
  } else {
    return {
      category: 'Obésité',
      color: '#EF4444',
      description: 'Poids significativement élevé'
    };
  }
}

// Helper to get specific class for measurement item
const getMeasurementItemClass = (key: string) => {
  switch (key) {
    case 'weight_kg': return 'measurement-detail-item--weight';
    case 'height_cm': return 'measurement-detail-item--height';
    case 'waist_cm': return 'measurement-detail-item--waist';
    case 'chest_cm': return 'measurement-detail-item--chest';
    default: return ''; // No specific class, rely on generic styles
  }
};

// Helper to get icon for each measurement item
const getMeasurementIcon = (key: string): keyof typeof ICONS => {
  switch (key) {
    case 'weight_kg': return 'Scale';
    case 'height_cm': return 'Ruler';
    case 'waist_cm': return 'Circle';
    case 'chest_cm': return 'Heart';
    case 'hips_cm': return 'Circle';
    case 'shoulder_width_cm': return 'Users';
    case 'neck_cm': return 'Circle';
    case 'arm_length_cm': return 'Minus';
    case 'bicep_cm': return 'Dumbbell';
    case 'thigh_cm': return 'Triangle';
    case 'calf_cm': return 'Triangle';
    case 'forearm_cm': return 'Minus';
    case 'wrist_cm': return 'Circle';
    case 'ankle_cm': return 'Circle';
    case 'inseam_cm': return 'Minus';
    case 'torso_length_cm': return 'Minus';
    case 'estimated_body_fat_perc': return 'Zap';
    case 'estimated_muscle_mass_kg': return 'Dumbbell';
    case 'waist_to_hip_ratio': return 'GitCompare';
    default: return 'Info';
  }
};

export const MeasurementsCard: React.FC<MeasurementsCardProps> = ({
  scanResults,
  userProfile,
  skinTone
}) => {
  const performanceConfig = useBodyScanPerformance();
  const { click } = useFeedback();

  // Extract data from scanResults
  const extractedData = scanResults?.estimate?.extracted_data || {};

  // Extract and validate skin tone from scan results or prop
  let effectiveSkinTone: SkinToneV2 | null = null;

  if (skinTone && isSkinToneV2(skinTone)) {
    effectiveSkinTone = skinTone;
  } else if (extractedData?.skin_tone && isSkinToneV2(extractedData.skin_tone)) {
    effectiveSkinTone = extractedData.skin_tone;
  } else if (scanResults?.commit?.data?.skin_tone && isSkinToneV2(scanResults.commit.data.skin_tone)) {
    effectiveSkinTone = scanResults.commit.data.skin_tone;
  } else if (skinTone) {
    logger.warn('MEASUREMENTS_CARD', 'Received skin tone is not in V2 format', {
      skinTone,
      hasSkinToneProp: !!skinTone,
      skinToneKeys: skinTone ? Object.keys(skinTone) : []
    });
  }
  
  // Robust data validation and default values
  const measurements = extractedData?.raw_measurements || {};
  const waist_cm = Number(measurements.waist_cm) || 0;
  const hips_cm = Number(measurements.hips_cm) || 0;
  const chest_cm = Number(measurements.chest_cm) || 0;
  const height_cm = Number(measurements.height_cm) || userProfile.height_cm || 0;
  const weight_kg = Number(measurements.weight_kg) || userProfile.weight_kg || 0;
  const estimated_body_fat_perc = Number(extractedData.estimated_body_fat_perc) || 0;
  const estimated_muscle_mass_kg = Number(extractedData.estimated_muscle_mass_kg) || 0;
  
  const estimatedBMI = extractedData?.estimated_bmi ?? (userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2));
  const bodyFatPerc = extractedData?.estimated_body_fat_perc ?? (userProfile.sex === 'male' ? 15 : 25);
  const confidence = extractedData?.processing_confidence;

  // Updated data completeness check
  const isSummaryDataComplete =
    waist_cm > 0 &&
    hips_cm > 0 &&
    chest_cm > 0 &&
    height_cm > 0 &&
    weight_kg > 0 &&
    estimated_body_fat_perc > 0 &&
    estimated_muscle_mass_kg > 0;

  // Early return if no data
  if (!extractedData || Object.keys(measurements).length === 0) {
    return null;
  }

  // Calculate BMI from user profile if not provided
  const calculatedBMI = estimatedBMI || (userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2));
  const bmiInfo = getBMIInfo(calculatedBMI);
  
  // Calculate additional metrics
  const bodyAge = calculatedBMI && bodyFatPerc ? 
    calculateBodyAge(calculatedBMI, bodyFatPerc, userProfile.sex) : null;
  const idealWeight = calculateIdealWeight(userProfile.height_cm);

  // Create comprehensive list of all metrics to display
  const allMetricsToDisplay: [string, any][] = [
    ...Object.entries(measurements),
    ['estimated_body_fat_perc', extractedData.estimated_body_fat_perc],
    ['estimated_muscle_mass_kg', extractedData.estimated_muscle_mass_kg]
  ].filter(([key, value]) => value !== undefined && value !== null);

  const measurementItems = allMetricsToDisplay.map(([key, value]) => {
    const translatedName = MEASUREMENT_TRANSLATIONS[key] || key.replace(/_/g, ' ');
    const unit = key.includes('_cm') ? 'cm' : key.includes('_kg') ? 'kg' : key.includes('_perc') ? '%' : '';
    const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
    
    let itemIcon: keyof typeof ICONS = getMeasurementIcon(key);
    let itemColor: string = '#9CA3AF'; // Default color

    // Determine color based on key or value if needed, otherwise use default
    switch (key) {
      case 'weight_kg':
      case 'estimated_muscle_mass_kg':
        itemColor = '#60A5FA'; // Blue for weight/muscle
        break;
      case 'height_cm':
        itemColor = '#8B5CF6'; // Purple for height
        break;
      case 'waist_cm':
      case 'hips_cm':
      case 'chest_cm':
        itemColor = '#10B981'; // Green for body measurements
        break;
      case 'estimated_body_fat_perc':
      case 'waist_to_hip_ratio':
        itemColor = '#F59E0B'; // Orange for percentages/ratios
        break;
      default:
        itemColor = 'var(--color-body-scan-primary)'; // Fallback to primary body scan color
        break;
    }

    return {
      key,
      value: displayValue,
      label: translatedName,
      unit,
      icon: itemIcon,
      color: itemColor,
    };
  });

  return (
    <ConditionalMotion
      className="measurements-card"
      initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 20 } : false}
      animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
      transition={performanceConfig.enableFramerMotion ? { duration: 0.6, ease: "easeOut" } : undefined}
    >
      <GlassCard 
        className="p-6 relative overflow-visible"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-body-scan-primary) 6%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--color-plasma-cyan) 4%, transparent) 0%, transparent 50%),
            rgba(18, 24, 38, 0.7)
          `,
          borderColor: 'color-mix(in srgb, var(--color-body-scan-primary) 20%, transparent)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.25),
            0 0 20px color-mix(in srgb, var(--color-body-scan-primary) 10%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          backdropFilter: 'blur(var(--glass-blur-base)) saturate(var(--glass-saturate-base))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center bodyscan-gap-md">
            <div 
              className="bodyscan-header-icon-container"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, var(--color-body-scan-success) 35%, transparent), color-mix(in srgb, var(--color-body-scan-success) 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, var(--color-body-scan-success) 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, var(--color-body-scan-success) 30%, transparent)'
              }}
            >
              <SpatialIcon 
                Icon={isSummaryDataComplete ? ICONS.Activity : ICONS.Info} 
                size={20} 
                style={{ color: isSummaryDataComplete ? "var(--color-body-scan-success)" : "var(--color-body-scan-warning)" }}
                variant="pure"
              />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Mesures extraites
            </h3>
          </div>
          
          {confidence && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isSummaryDataComplete ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-yellow-500/20 border border-yellow-400/30'}`}>
              <div className={`w-2 h-2 rounded-full ${isSummaryDataComplete ? 'bg-emerald-400' : 'bg-yellow-400'} ${isSummaryDataComplete ? '' : 'animate-pulse'}`} />
              <span className={`${isSummaryDataComplete ? 'text-emerald-400' : 'text-yellow-300'} text-xs font-medium`}>
                {isSummaryDataComplete ? `${Math.round(confidence * 100)}% confiance` : 'Données incomplètes'}
              </span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="measurements-grid mb-8">
          {/* BMI Card */}
          {calculatedBMI && bmiInfo && (
            <ConditionalMotion
              className="measurement-summary-card"
              style={{ '--measurement-color': bmiInfo.color }}
              initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 15 } : false}
              animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
              transition={performanceConfig.enableFramerMotion ? { duration: 0.4, delay: 0.1 } : undefined}
              whileHover={performanceConfig.enableWhileHover ? { scale: 1.02, y: -2 } : undefined}
              onClick={() => click()}
            >
              <div className="measurement-value measurement-value--large">
                {calculatedBMI.toFixed(1)}
              </div>
              <div className="measurement-label measurement-label--primary">
                IMC • {bmiInfo.category}
              </div>
              <div className="measurement-description">
                {bmiInfo.description}
              </div>
            </ConditionalMotion>
          )}

          {/* Body Age Card */}
          {bodyAge && (
            <ConditionalMotion
              className="measurement-detail-item"
              initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 15 } : false}
              animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
              transition={performanceConfig.enableFramerMotion ? { duration: 0.4, delay: 0.2 } : undefined}
              whileHover={performanceConfig.enableWhileHover ? { scale: 1.02, y: -2 } : undefined}
              onClick={() => click()}
            >
              <div className="measurement-value">
                {Math.round(bodyAge)} ans
              </div>
              <div className="measurement-label">
                Âge Corporel
              </div>
            </ConditionalMotion>
          )}

          {/* Ideal Weight Card */}
          <ConditionalMotion
            className="measurement-detail-item"
            initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 15 } : false}
            animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
            transition={performanceConfig.enableFramerMotion ? { duration: 0.4, delay: 0.3 } : undefined}
            whileHover={performanceConfig.enableWhileHover ? { scale: 1.02, y: -2 } : undefined}
            onClick={() => click()}
          >
            <div className="measurement-value">
              {idealWeight.toFixed(1)} kg
            </div>
            <div className="measurement-label">
              Poids Idéal
            </div>
          </ConditionalMotion>
        </div>

        {/* Skin Tone Preview Card */}
        {effectiveSkinTone && effectiveSkinTone.hex && (
          <ConditionalMotion
            className="measurement-detail-item"
            style={{
              '--icon-bg-color': `${effectiveSkinTone.hex}20`,
              '--icon-border-color': `${effectiveSkinTone.hex}50`,
              '--icon-text-color': effectiveSkinTone.hex,
            } as React.CSSProperties}
            initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 15 } : false}
            animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
            transition={performanceConfig.enableFramerMotion ? { duration: 0.4, delay: 0.4 } : undefined}
            whileHover={performanceConfig.enableWhileHover ? { scale: 1.02, y: -2 } : undefined}
            onClick={() => click()}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 shadow-lg"
                style={{
                  backgroundColor: effectiveSkinTone.hex,
                  borderColor: `${effectiveSkinTone.hex}80`,
                  boxShadow: `0 4px 12px ${effectiveSkinTone.hex}40`
                }}
              />
              <div>
                <div className="measurement-value text-sm">
                  {effectiveSkinTone.hex.toUpperCase()}
                </div>
                <div className="measurement-label text-xs">
                  Couleur de Peau Extraite
                  {effectiveSkinTone.confidence && (
                    <span className="ml-2 text-xs opacity-70">
                      {Math.round(effectiveSkinTone.confidence * 100)}% confiance
                    </span>
                  )}
                </div>
              </div>
            </div>
          </ConditionalMotion>
        )}

        {/* Detailed Measurements */}
        <div className="measurements-grid">
          {measurementItems.map((item, index) => (
            <ConditionalMotion
              key={item.key}
              className={`measurement-detail-item ${getMeasurementItemClass(item.key)}`}
              style={{
                '--icon-bg-color': `color-mix(in srgb, ${item.color} 20%, transparent)`,
                '--icon-border-color': `color-mix(in srgb, ${item.color} 30%, transparent)`,
                '--icon-text-color': item.color,
              } as React.CSSProperties}
              initial={performanceConfig.enableStaggerAnimations ? { opacity: 0, y: 20 } : false}
              animate={performanceConfig.enableStaggerAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
              transition={performanceConfig.enableFramerMotion ? {
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut"
              } : undefined}
              whileHover={performanceConfig.enableWhileHover ? { scale: 1.02, y: -2 } : undefined}
              onClick={() => click()}
            >
              <div className="measurement-detail-icon-container">
                <SpatialIcon
                  Icon={ICONS[item.icon]}
                  size={12}
                  style={{ color: item.color }}
                  variant="pure"
                />
              </div>
              <div className="measurement-value">
                {item.value}{item.unit}
              </div>
              <div className="measurement-label">
                {item.label}
              </div>
            </ConditionalMotion>
          ))}
        </div>
      </GlassCard>
    </ConditionalMotion>
  );
};

export default MeasurementsCard;
