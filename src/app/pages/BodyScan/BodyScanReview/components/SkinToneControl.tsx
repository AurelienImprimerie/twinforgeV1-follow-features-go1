/**
 * Skin Tone Control Component
 * User interface to preview and adjust skin tone from Vision AI
 */

import React, { useState, useCallback } from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../../hooks/useBodyScanPerformance';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { SkinToneV2 } from '../../../../../lib/scan/normalizeSkinTone';
import { createCompleteSkinTone } from '../../../../../lib/scan/normalizeSkinTone';
import logger from '../../../../../lib/utils/logger';

interface SkinToneControlProps {
  skinTone: SkinToneV2;
  onSkinToneChange: (newSkinTone: SkinToneV2) => void;
  isLocked?: boolean;
}

export const SkinToneControl: React.FC<SkinToneControlProps> = ({
  skinTone,
  onSkinToneChange,
  isLocked = false
}) => {
  const performanceConfig = useBodyScanPerformance();
  const [isEditing, setIsEditing] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  // Convert RGB to HSL for editing
  const rgbToHsl = useCallback((r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  // Convert HSL to RGB
  const hslToRgb = useCallback((h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }, []);

  // Initialize HSL from current skin tone
  React.useEffect(() => {
    if (skinTone && skinTone.rgb) {
      const hsl = rgbToHsl(skinTone.rgb.r, skinTone.rgb.g, skinTone.rgb.b);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [skinTone, rgbToHsl]);

  const handleStartEdit = () => {
    if (isLocked) return;
    setIsEditing(true);
    logger.info('SKIN_TONE_CONTROL', 'User started editing skin tone', {
      originalHex: skinTone.hex,
      source: skinTone.source
    });
  };

  const handleResetToAI = () => {
    if (isLocked) return;

    logger.info('SKIN_TONE_CONTROL', 'User reset to Vision AI skin tone', {
      currentHex: skinTone.hex,
      aiHex: skinTone.hex
    });

    setIsEditing(false);

    // Re-initialize from original
    const hsl = rgbToHsl(skinTone.rgb.r, skinTone.rgb.g, skinTone.rgb.b);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  };

  const handleApplyChanges = () => {
    const newRgb = hslToRgb(hue, saturation, lightness);
    const newSkinTone = createCompleteSkinTone(
      newRgb.r,
      newRgb.g,
      newRgb.b,
      'user_adjusted',
      skinTone.confidence || 0.9
    );

    logger.info('SKIN_TONE_CONTROL', 'User applied custom skin tone', {
      originalHex: skinTone.hex,
      newHex: newSkinTone.hex,
      adjustments: { hue, saturation, lightness }
    });

    onSkinToneChange(newSkinTone);
    setIsEditing(false);
  };

  const previewRgb = hslToRgb(hue, saturation, lightness);
  const previewHex = `#${previewRgb.r.toString(16).padStart(2, '0')}${previewRgb.g.toString(16).padStart(2, '0')}${previewRgb.b.toString(16).padStart(2, '0')}`;

  return (
    <GlassCard className="skin-tone-control">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <SpatialIcon icon={ICONS.palette} size={24} />
          <div>
            <h3 className="text-lg font-semibold text-white">Couleur de Peau</h3>
            <p className="text-sm text-white/60">
              {skinTone.source === 'vision_ai_colorimetric_analysis' || skinTone.source === 'vision_ai_analysis'
                ? 'Analysée par Vision IA'
                : 'Ajustée manuellement'}
            </p>
          </div>
        </div>

        {skinTone.confidence && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/60">Confiance:</span>
            <span className="text-white font-medium">
              {Math.round(skinTone.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Color Preview */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-20 h-20 rounded-xl border-2 border-white/20 shadow-lg"
          style={{ backgroundColor: isEditing ? previewHex : skinTone.hex }}
        />
        <div className="flex-1">
          <div className="text-sm text-white/60 mb-1">
            {isEditing ? 'Aperçu' : 'Couleur actuelle'}
          </div>
          <div className="font-mono text-lg text-white">
            {isEditing ? previewHex.toUpperCase() : skinTone.hex.toUpperCase()}
          </div>
          <div className="text-xs text-white/50 mt-1">
            RGB({isEditing ? previewRgb.r : skinTone.rgb.r},
            {isEditing ? previewRgb.g : skinTone.rgb.g},
            {isEditing ? previewRgb.b : skinTone.rgb.b})
          </div>
        </div>
      </div>

      {/* AI Metadata */}
      {(skinTone as any).undertone && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex-1">
            <div className="text-xs text-white/60 mb-1">Sous-ton</div>
            <div className="text-sm text-white font-medium capitalize">
              {(skinTone as any).undertone}
            </div>
          </div>
          {(skinTone as any).zones_analyzed && (
            <div className="flex-1">
              <div className="text-xs text-white/60 mb-1">Zones analysées</div>
              <div className="text-sm text-white font-medium">
                {(skinTone as any).zones_analyzed.length} zones
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editing Controls */}
      {isEditing && (
        <ConditionalMotion
          initial={performanceConfig.enableInitialAnimations ? { opacity: 0, height: 0 } : false}
          animate={performanceConfig.enableInitialAnimations ? { opacity: 1, height: 'auto' } : { opacity: 1 }}
          exit={performanceConfig.enableInitialAnimations ? { opacity: 0, height: 0 } : undefined}
          className="space-y-4 mb-4"
        >
          {/* Hue Slider */}
          <div>
            <label className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span>Teinte</span>
              <span className="font-mono">{hue}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                  hsl(0, 100%, 50%),
                  hsl(60, 100%, 50%),
                  hsl(120, 100%, 50%),
                  hsl(180, 100%, 50%),
                  hsl(240, 100%, 50%),
                  hsl(300, 100%, 50%),
                  hsl(360, 100%, 50%)
                )`
              }}
            />
          </div>

          {/* Saturation Slider */}
          <div>
            <label className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span>Saturation</span>
              <span className="font-mono">{saturation}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                  hsl(${hue}, 0%, ${lightness}%),
                  hsl(${hue}, 100%, ${lightness}%)
                )`
              }}
            />
          </div>

          {/* Lightness Slider */}
          <div>
            <label className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span>Luminosité</span>
              <span className="font-mono">{lightness}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                  hsl(${hue}, ${saturation}%, 0%),
                  hsl(${hue}, ${saturation}%, 50%),
                  hsl(${hue}, ${saturation}%, 100%)
                )`
              }}
            />
          </div>
        </ConditionalMotion>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isEditing ? (
          <>
            <button
              onClick={handleStartEdit}
              disabled={isLocked}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-all"
            >
              Ajuster la couleur
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleResetToAI}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-white transition-all"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleApplyChanges}
              className="flex-1 px-4 py-3 bg-blue-500/80 hover:bg-blue-500 rounded-xl font-medium text-white transition-all"
            >
              Appliquer
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-white/40 mt-3 text-center">
        {isEditing
          ? 'Ajustez teinte, saturation et luminosité pour personnaliser votre couleur de peau'
          : 'La couleur de peau a été analysée automatiquement par notre IA. Vous pouvez l\'ajuster si nécessaire.'}
      </p>
    </GlassCard>
  );
};

export default SkinToneControl;
