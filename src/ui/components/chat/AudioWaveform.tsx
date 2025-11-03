/**
 * Audio Waveform Component
 * Visualisation des fréquences audio en temps réel
 * Optimisé pour performances mobiles avec GPU
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  frequencies: number[];
  color: string;
  isActive: boolean;
  height?: number;
  barCount?: number;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  frequencies,
  color,
  isActive,
  height = 80,
  barCount = 32,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    const barWidth = rect.width / barCount;
    const barGap = 2;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Interpoler les fréquences si nécessaire
        const freqIndex = Math.floor((i / barCount) * frequencies.length);
        const value = frequencies[freqIndex] || 0;

        // Normaliser la valeur (0-1)
        const normalized = Math.min(value / 255, 1);

        // Calculer la hauteur de la barre
        const barHeight = normalized * height * 0.8;
        const x = i * barWidth;
        const y = height - barHeight;

        // Gradient pour chaque barre
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}40`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - barGap, barHeight);

        // Glow effect si actif
        if (isActive && normalized > 0.1) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
          ctx.fillRect(x, y, barWidth - barGap, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [frequencies, color, isActive, height, barCount]);

  return (
    <div className={`audio-waveform-container ${className}`} style={{ width: '100%', height }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />
      {!isActive && (
        <motion.div
          className="waveform-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center'
            }}
          >
            En attente...
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AudioWaveform;
