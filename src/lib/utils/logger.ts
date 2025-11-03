// src/lib/utils/logger.ts
/**
 * Logging utility with context provider and strict contract enforcement
 * Structured logging with single payload to prevent [object Object] issues
 */


type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Configuration des niveaux de log par environnement
 */
const LOG_LEVEL_CONFIG = {
  development: {
    level: 'info' as LogLevel, // Suppress trace and debug logs by default
  },
  staging: {
    level: 'warn' as LogLevel, // Only warnings and errors in staging
  },
  production: {
    level: 'error' as LogLevel, // ERROR in production - only critical errors, no info/warn/debug
  },
} as const;

/**
 * Get current environment log configuration
 */
function getCurrentLogConfig() {
  const env = import.meta.env.MODE as keyof typeof LOG_LEVEL_CONFIG;
  return LOG_LEVEL_CONFIG[env] || LOG_LEVEL_CONFIG.development;
}


// Context provider to avoid circular dependencies
let contextProvider: (() => { clientScanId?: string; serverScanId?: string }) | null = null;

/**
 * Set context provider for automatic ID injection
 */
function setContextProvider(provider: () => { clientScanId?: string; serverScanId?: string }) {
  contextProvider = provider;
}

/**
 * Get current context from provider
 */
function getCurrentContext(): { clientScanId?: string; serverScanId?: string } {
  try {
    return contextProvider?.() || {};
  } catch (error) {
    console.warn('Failed to get context from provider:', error);
    return {};
  }
}

/**
 * Check if a log level should be displayed based on current configuration
 */
function shouldLog(level: LogLevel): boolean {
  const config = getCurrentLogConfig();

  // SILENT mode - no logs at all (production)
  if (config.level === 'silent') {
    return false;
  }

  const levelOrder = {
    'trace': 0,
    'debug': 1,
    'info': 2,
    'warn': 3,
    'error': 4
  };

  const currentLevelValue = levelOrder[config.level as LogLevel];
  const messageLevelValue = levelOrder[level];

  // More restrictive logging - only show important logs
  if (import.meta.env.DEV) {
    // Only show debug logs for critical components
    if (level === 'debug') {
      return messageLevelValue >= Math.max(currentLevelValue, 2); // Require at least info level
    }
    // Only show trace logs for very specific debugging
    if (level === 'trace') {
      return false; // Disable trace logs in dev unless explicitly needed
    }
  }

  return messageLevelValue >= currentLevelValue;
}

/**
 * Create structured log payload with automatic context injection
 * Supports both 3-param (category, message, context) and 2-param (message, context) signatures
 */
function createLogPayload(level: LogLevel, categoryOrMessage: string, messageOrContext?: any, context?: any) {
  const autoContext = getCurrentContext();

  let category: string | undefined;
  let message: string;
  let finalContext: any;

  // Detect which signature is being used
  if (context !== undefined) {
    // 3-param signature: (level, category, message, context)
    category = categoryOrMessage;
    message = messageOrContext;
    finalContext = context;
  } else if (typeof messageOrContext === 'string') {
    // 3-param signature: (level, category, message, undefined)
    category = categoryOrMessage;
    message = messageOrContext;
    finalContext = undefined;
  } else {
    // 2-param signature: (level, message, context)
    category = undefined;
    message = categoryOrMessage;
    finalContext = messageOrContext;
  }

  // Handle case where context is a string (common mistake)
  if (finalContext && typeof finalContext !== 'object') {
    message = `${message} — ${String(finalContext)}`;
    finalContext = undefined;
  }

  // Build the full message with category prefix
  const fullMessage = category ? `${category} — ${message}` : message;

  // Merge auto context with provided context, and add category if present
  const mergedContext = {
    ...autoContext,
    ...(category && { category }),
    ...(finalContext || {})
  };

  // Always add context property, even if empty, for debugging purposes
  const payload: Record<string, any> = {
    level,
    message: fullMessage,
    timestamp: new Date().toISOString(),
    context: mergedContext // Always include context
  };

  return payload;
}

/**
 * Core logging functions - support both 2-param and 3-param signatures
 * 2-param: logger.info(message, context)
 * 3-param: logger.info(category, message, context)
 */
function trace(categoryOrMessage: string, messageOrContext?: any, context?: Record<string, any>) {
  if (!shouldLog('trace')) return;
  const payload = createLogPayload('trace', categoryOrMessage, messageOrContext, context);
  console.trace(JSON.stringify(payload, null, 2));
}

function debug(categoryOrMessage: string, messageOrContext?: any, context?: Record<string, any>) {
  if (!shouldLog('debug')) return;
  const payload = createLogPayload('debug', categoryOrMessage, messageOrContext, context);
  console.debug(JSON.stringify(payload, null, 2));
}

function info(categoryOrMessage: string, messageOrContext?: any, context?: Record<string, any>) {
  if (!shouldLog('info')) return;
  const payload = createLogPayload('info', categoryOrMessage, messageOrContext, context);
  console.log(JSON.stringify(payload, null, 2));
}

function warn(categoryOrMessage: string, messageOrContext?: any, context?: Record<string, any>) {
  if (!shouldLog('warn')) return;
  const payload = createLogPayload('warn', categoryOrMessage, messageOrContext, context);
  console.warn(JSON.stringify(payload, null, 2));
}

function error(categoryOrMessage: string, messageOrContext?: any, context?: Record<string, any>) {
  if (!shouldLog('error')) return;
  const payload = createLogPayload('error', categoryOrMessage, messageOrContext, context);
  console.error(JSON.stringify(payload, null, 2));
}

/**
 * Progress logging function for tracking operation progress
 */
function progress(category: string, progressValue: number, message: string, subMessage?: string) {
  if (!shouldLog('info')) return;
  const safeProgress = Number.isFinite(progressValue) && !Number.isNaN(progressValue) ? 
    Math.max(0, Math.min(100, progressValue)) : 0;
  
  const payload = createLogPayload('info', `${category}: ${safeProgress}% - ${message}`, {
    category,
    progress: safeProgress,
    message,
    ...(subMessage && { subMessage })
  });
  
  console.log(JSON.stringify(payload, null, 2));
}

/**
 * Enhanced error logging with context
 */
function logError(message: string, err: unknown, context: Record<string, any> = {}) {
  if (!shouldLog('error')) return;
  const e = err as any;
  const payload = createLogPayload('error', message, {
    error: {
      name: e?.name || 'Unknown',
      message: e?.message || 'No message',
      stack: e?.stack || 'No stack trace'
    },
    ...context
  });
  console.error(JSON.stringify(payload, null, 2));
}

/**
 * Default export with all logging functions
 */
const logger = {
  trace,
  info,
  warn,
  debug,
  error,
  progress,
  logError,
  logOnce,
  setContextProvider,
  jsonLog,
};

export default logger;

/**
 * Log once utility to prevent repetitive logs
 */
const loggedOnce = new Set<string>();

export function logOnce(key: string, level: 'trace' | 'debug' | 'info' | 'warn' | 'error', message: string, context?: Record<string, any>) {
  if (loggedOnce.has(key)) return;
  loggedOnce.add(key);
  
  switch (level) {
    case 'trace': trace(message, context); break;
    case 'debug': debug(message, context); break;
    case 'info': info(message, context); break;
    case 'warn': warn(message, context); break;
    case 'error': error(message, context); break;
  }
}

/**
 * Clear logged once cache (useful for testing)
 */
function clearLogOnceCache() {
  loggedOnce.clear();
}

/**
 * JSON logging function for structured data (useful for cache debugging)
 */
function jsonLog(category: string, message: string, data: any): void {
  if (!shouldLog('info')) return;
  
  const payload = createLogPayload('info', `${category}: ${message}`, {
    category,
    data,
    structured: true
  });
  
  console.log(JSON.stringify(payload, null, 2));
}