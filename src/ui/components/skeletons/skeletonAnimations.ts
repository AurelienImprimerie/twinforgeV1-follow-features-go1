export const SKELETON_ANIMATION_TIMINGS = {
  shimmerDuration: 2,
  pulseDuration: 2,
  fadeIn: 0.3,
  fadeOut: 0.3,
  staggerDelay: 0.1
};

export const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }
`;

export const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
`;

export const skeletonVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: SKELETON_ANIMATION_TIMINGS.fadeIn
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: SKELETON_ANIMATION_TIMINGS.fadeOut
    }
  }
};

export const staggerContainerVariants = {
  animate: {
    transition: {
      staggerChildren: SKELETON_ANIMATION_TIMINGS.staggerDelay
    }
  }
};

export const staggerItemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};
