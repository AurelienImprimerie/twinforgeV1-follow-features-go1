// Mobile detection utility - Placeholder

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isLowEndDevice(): boolean {
  return isMobileDevice();
}

export function detectDeviceCapabilities() {
  return {
    isMobile: isMobileDevice(),
    isLowEnd: isLowEndDevice(),
    recommendedQuality: isLowEndDevice() ? 'low' : 'high'
  };
}
