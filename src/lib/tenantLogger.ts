/**
 * Structured logging utility with tenant context
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: unknown;
}

function log(level: LogLevel, tenantId: string | null, message: string, meta?: LogMeta) {
  const logEntry = {
    level,
    tenantId: tenantId || 'no-tenant',
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  
  // In production, this would send to a logging service
  // For now, we use console with structured format
  const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  logFn(JSON.stringify(logEntry));
}

export const tenantLogger = {
  info: (tenantId: string | null, message: string, meta?: LogMeta) => {
    log('info', tenantId, message, meta);
  },
  
  warn: (tenantId: string | null, message: string, meta?: LogMeta) => {
    log('warn', tenantId, message, meta);
  },
  
  error: (tenantId: string | null, message: string, error?: Error, meta?: LogMeta) => {
    log('error', tenantId, message, {
      error: error?.message,
      stack: error?.stack,
      ...meta,
    });
  },
  
  debug: (tenantId: string | null, message: string, meta?: LogMeta) => {
    if (import.meta.env.DEV) {
      log('debug', tenantId, message, meta);
    }
  },
};
