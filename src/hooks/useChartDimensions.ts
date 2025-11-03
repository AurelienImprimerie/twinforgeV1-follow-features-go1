/**
 * useChartDimensions Hook
 * Calcule automatiquement les dimensions optimales pour les graphiques
 * S'adapte au conteneur et au nombre d'éléments affichés
 */

import { useEffect, useState, useRef, RefObject } from 'react';

interface ChartDimensions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radius?: number;
}

interface UseChartDimensionsOptions {
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  itemCount?: number;
  itemHeight?: number;
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  circuitMode?: boolean;
  stationLabelHeight?: number;
}

export function useChartDimensions<T extends HTMLElement = HTMLDivElement>(
  containerRef: RefObject<T>,
  options: UseChartDimensionsOptions = {}
): ChartDimensions {
  const {
    minHeight = 300,
    maxHeight = 600,
    aspectRatio = 0.625,
    itemCount = 0,
    itemHeight = 120,
    padding = {},
    circuitMode = false,
    stationLabelHeight = 40
  } = options;

  const defaultPadding = {
    top: padding.top ?? 60,
    bottom: padding.bottom ?? 60,
    left: padding.left ?? 40,
    right: padding.right ?? 40
  };

  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 800,
    height: 500,
    centerX: 400,
    centerY: 250,
    radius: 0
  });

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.getBoundingClientRect().width;

      let calculatedHeight: number;

      if (circuitMode) {
        // Pour les circuits, calculer la hauteur basée sur le ratio et assurer l'espace pour les labels
        calculatedHeight = Math.min(containerWidth * aspectRatio, maxHeight);

        // Ajouter de l'espace pour les labels des stations si nécessaire
        if (stationLabelHeight > 0) {
          calculatedHeight += stationLabelHeight * 2;
        }
      } else if (itemCount > 0) {
        // Pour les timelines, calculer basé sur le nombre d'items
        const contentHeight = itemCount * itemHeight;
        calculatedHeight = Math.max(
          minHeight,
          Math.min(
            contentHeight + defaultPadding.top + defaultPadding.bottom,
            maxHeight
          )
        );
      } else {
        // Fallback: utiliser le ratio d'aspect
        calculatedHeight = Math.min(
          containerWidth * aspectRatio,
          maxHeight
        );
      }

      // Assurer une hauteur minimale
      calculatedHeight = Math.max(calculatedHeight, minHeight);

      const width = containerWidth - defaultPadding.left - defaultPadding.right;
      const height = calculatedHeight - defaultPadding.top - defaultPadding.bottom;
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculer le rayon pour les circuits
      let radius = 0;
      if (circuitMode) {
        radius = Math.min(width, height) * 0.35;

        // Ajuster le rayon si on a beaucoup de stations pour éviter le chevauchement des labels
        if (itemCount > 6) {
          radius = Math.min(width, height) * 0.32;
        }
      }

      setDimensions({
        width: containerWidth,
        height: calculatedHeight,
        centerX,
        centerY,
        radius
      });
    };

    // Mise à jour initiale
    updateDimensions();

    // Observer le redimensionnement du conteneur
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateDimensions();
      });

      resizeObserverRef.current.observe(containerRef.current);
    }

    // Écouter le redimensionnement de la fenêtre
    window.addEventListener('resize', updateDimensions);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [
    containerRef,
    minHeight,
    maxHeight,
    aspectRatio,
    itemCount,
    itemHeight,
    circuitMode,
    stationLabelHeight,
    defaultPadding.top,
    defaultPadding.bottom,
    defaultPadding.left,
    defaultPadding.right
  ]);

  return dimensions;
}
