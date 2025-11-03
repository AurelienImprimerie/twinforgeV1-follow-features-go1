import React, { useEffect, useRef } from 'react';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

/**
 * BackgroundManager
 *
 * Gère le fond cosmique avec particules de manière conditionnelle
 * selon le mode performance détecté.
 *
 * MODE QUALITY/BALANCED:
 * - Background animé avec respiration cosmique
 * - Particules ember-rise avec trajectoires complexes
 * - Nébuleuses chaude/froide avec animations
 *
 * MODE HIGH-PERFORMANCE:
 * - Background statique simplifié (1-2 couches)
 * - ZÉRO particules (pas dans le DOM)
 * - ZÉRO animations
 * - Optimisé pour iPhone 10, iPhone 8, Android 5+ ans
 */
export const BackgroundManager: React.FC = () => {
  const { isPerformanceMode, mode } = usePerformanceMode();
  const particlesInitialized = useRef(false);

  useEffect(() => {
    // Apply performance mode classes to body and html
    const body = document.body;
    const html = document.documentElement;

    // Remove all mode classes first
    body.classList.remove('performance-mode', 'mobile-performance-mode', 'mode-quality', 'mode-balanced', 'mode-high-performance');
    html.classList.remove('performance-mode', 'mode-high-performance', 'mode-balanced', 'mode-quality');

    // Apply appropriate classes based on current mode
    if (isPerformanceMode) {
      body.classList.add('performance-mode', 'mobile-performance-mode', 'mode-high-performance');
      body.setAttribute('data-performance-mode', 'true');
      html.classList.add('performance-mode', 'mode-high-performance');
    } else {
      body.removeAttribute('data-performance-mode');

      // Apply the specific mode class
      if (mode === 'quality') {
        body.classList.add('mode-quality');
        html.classList.add('mode-quality');
      } else if (mode === 'balanced') {
        body.classList.add('mode-balanced');
        html.classList.add('mode-balanced');
      }
    }

    return () => {
      // Cleanup on unmount
      body.classList.remove('performance-mode', 'mobile-performance-mode', 'mode-quality', 'mode-balanced', 'mode-high-performance');
      body.removeAttribute('data-performance-mode');
      html.classList.remove('performance-mode', 'mode-high-performance', 'mode-balanced', 'mode-quality');
    };
  }, [isPerformanceMode, mode]);

  useEffect(() => {
    // Particules TOTALEMENT DÉSACTIVÉES - Ne jamais initialiser
    // Cleanup: s'assurer qu'aucune particule n'existe
    const container = document.getElementById('cosmic-forge-particles-container');
    if (container) {
      container.innerHTML = '';
    }
    particlesInitialized.current = false;
  }, [isPerformanceMode, mode]);

  // En mode performance, render fond uni statique SANS classe bg-twinforge-visionos
  if (isPerformanceMode) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--forge-deep)',
          zIndex: -1,
        }}
        aria-hidden="true"
      />
    );
  }

  // En mode quality/balanced, render le fond SANS particules
  return (
    <>
      <div
        className="bg-twinforge-visionos"
        aria-hidden="true"
      />
      {/* Particules totalement désactivées */}
    </>
  );
};

/**
 * Initialise les particules de forge avec positions aléatoires
 * Appelé uniquement en mode quality/balanced
 */
function initializeForgeParticles(mode: 'high-performance' | 'balanced' | 'quality') {
  const container = document.getElementById('cosmic-forge-particles-container');
  if (!container) return;

  // Clear existing particles first
  container.innerHTML = '';

  // Déterminer le nombre de particules selon la taille de l'écran ET le mode performance
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

  let particleCount = 12; // Desktop quality mode par défaut
  let animationSpeed = 22; // Desktop quality mode par défaut

  // Adjust for performance mode
  if (mode === 'balanced') {
    // Balanced: reduce particles by 50%
    if (isMobile) {
      particleCount = 3;
      animationSpeed = 40;
    } else if (isTablet) {
      particleCount = 4;
      animationSpeed = 32;
    } else {
      particleCount = 6;
      animationSpeed = 26;
    }
  } else {
    // Quality mode: full particle count
    if (isMobile) {
      particleCount = 6;
      animationSpeed = 35;
    } else if (isTablet) {
      particleCount = 8;
      animationSpeed = 28;
    }
  }

  // Créer les particules
  for (let i = 1; i <= particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = `forge-particle forge-particle--${i}`;

    // Position horizontale de base (0-100vw)
    const x0 = Math.random() * 100;

    // Dérives horizontales aléatoires
    const x1 = (Math.random() - 0.5) * 50; // -25px à +25px
    const x2 = (Math.random() - 0.5) * 80; // -40px à +40px
    const x3 = (Math.random() - 0.5) * 100; // -50px à +50px
    const x4 = (Math.random() - 0.5) * 120; // -60px à +60px

    // Taille aléatoire
    const size = isMobile
      ? Math.random() * 1 + 2 // 2-3px sur mobile
      : isTablet
        ? Math.random() * 1 + 2.5 // 2.5-3.5px sur tablette
        : Math.random() * 2 + 2; // 2-4px sur desktop

    // Durée d'animation aléatoire autour de la vitesse de base
    const duration = animationSpeed + (Math.random() - 0.5) * 10;

    // Délai aléatoire pour décaler les animations
    const delay = Math.random() * duration;

    // Appliquer les variables CSS
    particle.style.setProperty('--x0', `${x0}vw`);
    particle.style.setProperty('--x1', `${x1}px`);
    particle.style.setProperty('--x2', `${x2}px`);
    particle.style.setProperty('--x3', `${x3}px`);
    particle.style.setProperty('--x4', `${x4}px`);
    particle.style.setProperty('--size', `${size}px`);
    particle.style.setProperty('--duration', `${duration}s`);
    particle.style.setProperty('--delay', `${delay}s`);

    container.appendChild(particle);
  }
}
