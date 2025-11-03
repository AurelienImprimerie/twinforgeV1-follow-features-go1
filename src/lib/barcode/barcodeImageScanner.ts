export interface BarcodeImageScanResult {
  success: boolean;
  barcode?: string;
  format?: string;
  error?: string;
}

export const scanBarcodeFromImage = async (file: File): Promise<BarcodeImageScanResult> => {
  try {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return {
        success: false,
        error: 'Failed to get canvas context',
      };
    }

    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(objectUrl);

    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: [
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'code_128',
            'code_39',
          ],
        });

        const barcodes = await barcodeDetector.detect(canvas);

        if (barcodes.length > 0) {
          return {
            success: true,
            barcode: barcodes[0].rawValue,
            format: barcodes[0].format,
          };
        }
      } catch (detectorError) {
        console.warn('BarcodeDetector failed, falling back to error:', detectorError);
      }
    }

    return {
      success: false,
      error: 'Aucun code-barre détecté dans l\'image. La détection de code-barres sur image n\'est pas supportée par votre navigateur.',
    };
  } catch (error) {
    console.error('Error scanning barcode from image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du scan de l\'image',
    };
  }
};
