import { useLowTokensStore } from '../../system/store/lowTokensStore';
import logger from './logger';

export interface TokenErrorResponse {
  error: string;
  required_tokens?: number;
  available_tokens?: number;
  code?: string;
}

export const handleTokenError = (error: any, context: string = 'unknown'): boolean => {
  if (!error) return false;

  let isTokenError = false;
  let requiredTokens = 0;
  let availableTokens = 0;

  // Check if it's a 402 error (Payment Required)
  if (error.status === 402 || error.statusCode === 402) {
    isTokenError = true;

    // Try to extract token information from error response
    if (error.body) {
      requiredTokens = error.body.required_tokens || 0;
      availableTokens = error.body.available_tokens || 0;
    } else if (error.data) {
      requiredTokens = error.data.required_tokens || 0;
      availableTokens = error.data.available_tokens || 0;
    }
  }

  // Check if error message contains token-related keywords
  if (error.message) {
    const message = error.message.toLowerCase();
    if (
      message.includes('insufficient tokens') ||
      message.includes('not enough tokens') ||
      message.includes('token balance') ||
      message.includes('tokens insuffisants')
    ) {
      isTokenError = true;
    }
  }

  if (isTokenError) {
    logger.warn('TOKEN_ERROR_HANDLER', 'Insufficient tokens detected', {
      context,
      requiredTokens,
      availableTokens,
      error: error.message || 'Unknown error'
    });

    // Show the global modal
    const { showLowTokensModal } = useLowTokensStore.getState();
    showLowTokensModal(requiredTokens, availableTokens);

    return true;
  }

  return false;
};

// Wrapper for fetch calls to automatically detect token errors
export const fetchWithTokenErrorHandling = async (
  url: string,
  options: RequestInit = {},
  context: string = 'api-call'
): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    if (response.status === 402) {
      let errorData: TokenErrorResponse | null = null;

      try {
        errorData = await response.json();
      } catch {
        // Ignore JSON parsing errors
      }

      handleTokenError(
        {
          status: 402,
          data: errorData,
          message: errorData?.error || 'Insufficient tokens'
        },
        context
      );
    }

    return response;
  } catch (error) {
    // Network or other errors
    throw error;
  }
};
