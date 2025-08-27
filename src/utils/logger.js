import winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import config from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure logs directory exists
const logsDir = join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      service: 'pe-eval-system'
    };

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logEntry = { ...logEntry, ...meta };
    }

    return JSON.stringify(logEntry);
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  defaultMeta: { 
    service: 'pe-eval-system',
    version: '1.0.0'
  },
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    
    // Write to console in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaString = Object.keys(meta).length > 0 
              ? `\n${JSON.stringify(meta, null, 2)}` 
              : '';
            return `${timestamp} [${level}]: ${message}${metaString}`;
          })
        )
      })
    ] : [])
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: join(logsDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: join(logsDir, 'rejections.log') })
  ]
});

// Add performance timing utility
logger.timer = (label) => {
  const start = Date.now();
  return {
    end: (additionalData = {}) => {
      const duration = Date.now() - start;
      logger.info(`Performance: ${label}`, {
        duration: `${duration}ms`,
        ...additionalData
      });
      return duration;
    }
  };
};

// Add structured logging methods for specific operations
logger.apiCall = (method, endpoint, statusCode, duration, additionalData = {}) => {
  logger.info('API Call', {
    method,
    endpoint,
    statusCode,
    duration: `${duration}ms`,
    ...additionalData
  });
};

logger.metricExtraction = (company, document, metrics, confidence, additionalData = {}) => {
  logger.info('Metric Extraction', {
    company,
    document,
    metricsExtracted: Object.keys(metrics).length,
    averageConfidence: confidence,
    metrics: Object.keys(metrics),
    ...additionalData
  });
};

logger.deltaCalculation = (company, metric, delta, significance, additionalData = {}) => {
  logger.info('Delta Calculation', {
    company,
    metric,
    deltaAbsolute: delta.absolute,
    deltaPercentage: delta.percentage,
    significance,
    ...additionalData
  });
};

logger.stateUpdate = (company, operation, recordsAffected, additionalData = {}) => {
  logger.info('State Database Update', {
    company,
    operation,
    recordsAffected,
    ...additionalData
  });
};

logger.authentication = (service, status, additionalData = {}) => {
  logger.info('Authentication', {
    service,
    status,
    ...additionalData
  });
};

export default logger;