/**
 * Comprehensive Monitoring Service
 * Provides system health monitoring, metrics collection, and alerting
 */

import logger from '../utils/logger.js';
import config from '../config/environment.js';
import { circuitBreakerManager } from './CircuitBreaker.js';

export class MonitoringService {
  constructor() {
    this.metrics = {
      system: {
        startTime: Date.now(),
        requests: 0,
        errors: 0,
        warnings: 0,
        criticalErrors: 0
      },
      documents: {
        processed: 0,
        failed: 0,
        avgProcessingTime: 0,
        totalProcessingTime: 0
      },
      metrics: {
        extracted: 0,
        avgConfidence: 0,
        totalConfidence: 0
      },
      database: {
        operations: 0,
        failures: 0,
        avgResponseTime: 0,
        totalResponseTime: 0
      },
      spreadsheets: {
        created: 0,
        updated: 0,
        errors: 0
      }
    };
    
    this.alerts = [];
    this.healthChecks = new Map();
    this.thresholds = {
      errorRate: config.monitoring?.errorRateThreshold || 0.05, // 5%
      responseTime: config.monitoring?.responseTimeThreshold || 5000, // 5 seconds
      confidence: config.monitoring?.confidenceThreshold || 0.7, // 70%
      criticalErrorCount: config.monitoring?.criticalErrorThreshold || 3,
      memoryUsage: config.monitoring?.memoryThreshold || 0.8 // 80%
    };
    
    // Start periodic health checks
    this.startHealthChecks();
    
    logger.info('MonitoringService initialized', {
      thresholds: this.thresholds,
      healthCheckInterval: config.monitoring?.healthCheckInterval || 60000
    });
  }

  /**
   * Record a system request
   * @param {string} type - Request type
   * @param {number} duration - Request duration in milliseconds
   * @param {boolean} success - Whether request was successful
   */
  recordRequest(type, duration, success = true) {
    this.metrics.system.requests++;
    
    if (!success) {
      this.metrics.system.errors++;
    }
    
    logger.info('Request recorded', {
      type,
      duration: `${duration}ms`,
      success,
      totalRequests: this.metrics.system.requests,
      errorRate: this.getErrorRate()
    });
    
    // Check for threshold violations
    this.checkThresholds();
  }

  /**
   * Record document processing metrics
   * @param {string} documentName - Document name
   * @param {number} processingTime - Processing time in milliseconds
   * @param {boolean} success - Whether processing was successful
   * @param {Object} extractionResult - Metric extraction result
   */
  recordDocumentProcessing(documentName, processingTime, success, extractionResult = null) {
    this.metrics.documents.processed++;
    this.metrics.documents.totalProcessingTime += processingTime;
    this.metrics.documents.avgProcessingTime = 
      this.metrics.documents.totalProcessingTime / this.metrics.documents.processed;
    
    if (!success) {
      this.metrics.documents.failed++;
    }
    
    // Record metric extraction if provided
    if (extractionResult && success) {
      const { totalMetrics, avgConfidence } = extractionResult.summary;
      this.metrics.metrics.extracted += totalMetrics;
      this.metrics.metrics.totalConfidence += avgConfidence;
      this.metrics.metrics.avgConfidence = 
        this.metrics.metrics.totalConfidence / this.metrics.documents.processed;
    }
    
    logger.info('Document processing recorded', {
      document: documentName,
      processingTime: `${processingTime}ms`,
      success,
      metricsExtracted: extractionResult?.summary?.totalMetrics || 0,
      avgConfidence: extractionResult?.summary?.avgConfidence || 0,
      totalProcessed: this.metrics.documents.processed
    });
    
    this.checkThresholds();
  }

  /**
   * Record database operation metrics
   * @param {string} operation - Operation type
   * @param {number} responseTime - Response time in milliseconds
   * @param {boolean} success - Whether operation was successful
   * @param {number} recordsAffected - Number of records affected
   */
  recordDatabaseOperation(operation, responseTime, success, recordsAffected = 0) {
    this.metrics.database.operations++;
    this.metrics.database.totalResponseTime += responseTime;
    this.metrics.database.avgResponseTime = 
      this.metrics.database.totalResponseTime / this.metrics.database.operations;
    
    if (!success) {
      this.metrics.database.failures++;
    }
    
    logger.stateUpdate(
      'system',
      operation,
      recordsAffected,
      {
        responseTime: `${responseTime}ms`,
        success,
        avgResponseTime: `${Math.round(this.metrics.database.avgResponseTime)}ms`
      }
    );
    
    this.checkThresholds();
  }

  /**
   * Record spreadsheet operation metrics
   * @param {string} operation - Operation type (created, updated, error)
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {Object} details - Additional details
   */
  recordSpreadsheetOperation(operation, spreadsheetId, details = {}) {
    switch (operation) {
      case 'created':
        this.metrics.spreadsheets.created++;
        break;
      case 'updated':
        this.metrics.spreadsheets.updated++;
        break;
      case 'error':
        this.metrics.spreadsheets.errors++;
        break;
    }
    
    logger.info('Spreadsheet operation recorded', {
      operation,
      spreadsheetId,
      ...details,
      totalCreated: this.metrics.spreadsheets.created,
      totalUpdated: this.metrics.spreadsheets.updated,
      totalErrors: this.metrics.spreadsheets.errors
    });
  }

  /**
   * Record a warning event
   * @param {string} message - Warning message
   * @param {Object} details - Warning details
   */
  recordWarning(message, details = {}) {
    this.metrics.system.warnings++;
    
    logger.warn('System warning', {
      message,
      ...details,
      totalWarnings: this.metrics.system.warnings
    });
    
    this.addAlert('warning', message, details);
  }

  /**
   * Record a critical error
   * @param {string} message - Error message
   * @param {Object} details - Error details
   */
  recordCriticalError(message, details = {}) {
    this.metrics.system.criticalErrors++;
    
    logger.error('Critical system error', {
      message,
      ...details,
      totalCriticalErrors: this.metrics.system.criticalErrors
    });
    
    this.addAlert('critical', message, details);
    this.checkThresholds();
  }

  /**
   * Add alert to alert queue
   * @param {string} severity - Alert severity
   * @param {string} message - Alert message
   * @param {Object} details - Alert details
   */
  addAlert(severity, message, details = {}) {
    const alert = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      severity,
      message,
      details,
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    logger.info('Alert added', {
      severity,
      message,
      alertId: alert.id,
      totalAlerts: this.alerts.length
    });
  }

  /**
   * Check system thresholds and generate alerts
   */
  checkThresholds() {
    const errorRate = this.getErrorRate();
    const avgResponseTime = this.metrics.database.avgResponseTime;
    const avgConfidence = this.metrics.metrics.avgConfidence;
    const criticalErrorCount = this.metrics.system.criticalErrors;
    
    // Error rate threshold
    if (errorRate > this.thresholds.errorRate) {
      this.addAlert('high', 'High error rate detected', {
        currentRate: errorRate,
        threshold: this.thresholds.errorRate,
        totalRequests: this.metrics.system.requests,
        totalErrors: this.metrics.system.errors
      });
    }
    
    // Response time threshold
    if (avgResponseTime > this.thresholds.responseTime) {
      this.addAlert('medium', 'High database response time', {
        currentTime: avgResponseTime,
        threshold: this.thresholds.responseTime,
        totalOperations: this.metrics.database.operations
      });
    }
    
    // Confidence threshold
    if (avgConfidence < this.thresholds.confidence && this.metrics.documents.processed > 0) {
      this.addAlert('medium', 'Low metric extraction confidence', {
        currentConfidence: avgConfidence,
        threshold: this.thresholds.confidence,
        totalProcessed: this.metrics.documents.processed
      });
    }
    
    // Critical error threshold
    if (criticalErrorCount >= this.thresholds.criticalErrorCount) {
      this.addAlert('critical', 'Critical error threshold exceeded', {
        currentCount: criticalErrorCount,
        threshold: this.thresholds.criticalErrorCount
      });
    }
  }

  /**
   * Get current error rate
   * @returns {number} Error rate (0-1)
   */
  getErrorRate() {
    if (this.metrics.system.requests === 0) return 0;
    return this.metrics.system.errors / this.metrics.system.requests;
  }

  /**
   * Get system uptime in milliseconds
   * @returns {number} Uptime in milliseconds
   */
  getUptime() {
    return Date.now() - this.metrics.system.startTime;
  }

  /**
   * Get comprehensive system health report
   * @returns {Object} Health report
   */
  getHealthReport() {
    const uptime = this.getUptime();
    const errorRate = this.getErrorRate();
    const memoryUsage = process.memoryUsage();
    const circuitBreakerMetrics = circuitBreakerManager.getGlobalHealthMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      uptime: {
        milliseconds: uptime,
        formatted: this.formatUptime(uptime)
      },
      system: {
        ...this.metrics.system,
        errorRate: errorRate,
        memoryUsage: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          usage: memoryUsage.heapUsed / memoryUsage.heapTotal
        }
      },
      documents: this.metrics.documents,
      metrics: this.metrics.metrics,
      database: this.metrics.database,
      spreadsheets: this.metrics.spreadsheets,
      circuitBreakers: circuitBreakerMetrics,
      alerts: {
        total: this.alerts.length,
        unresolved: this.alerts.filter(a => !a.resolved).length,
        critical: this.alerts.filter(a => a.severity === 'critical').length,
        recent: this.alerts.slice(-5)
      },
      healthChecks: this.getHealthCheckResults(),
      status: this.getSystemStatus()
    };
  }

  /**
   * Get overall system status
   * @returns {string} System status (healthy, degraded, critical)
   */
  getSystemStatus() {
    const errorRate = this.getErrorRate();
    const criticalAlerts = this.alerts.filter(a => 
      a.severity === 'critical' && !a.resolved
    ).length;
    const memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
    const circuitBreakerMetrics = circuitBreakerManager.getGlobalHealthMetrics();
    
    if (criticalAlerts > 0 || 
        errorRate > this.thresholds.errorRate * 2 || 
        memoryUsage > this.thresholds.memoryUsage ||
        circuitBreakerMetrics.servicesDown > 0) {
      return 'critical';
    }
    
    if (errorRate > this.thresholds.errorRate || 
        circuitBreakerMetrics.servicesDegraded > 0 ||
        this.metrics.system.warnings > 5) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Format uptime duration
   * @param {number} uptime - Uptime in milliseconds
   * @returns {string} Formatted uptime
   */
  formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Register a health check
   * @param {string} name - Health check name
   * @param {Function} checkFunction - Function that returns health status
   */
  registerHealthCheck(name, checkFunction) {
    this.healthChecks.set(name, checkFunction);
    
    logger.info('Health check registered', {
      name,
      totalHealthChecks: this.healthChecks.size
    });
  }

  /**
   * Run all health checks
   * @returns {Object} Health check results
   */
  async runHealthChecks() {
    const results = {};
    
    for (const [name, checkFunction] of this.healthChecks) {
      try {
        const startTime = Date.now();
        const result = await checkFunction();
        const duration = Date.now() - startTime;
        
        results[name] = {
          status: result.status || 'unknown',
          message: result.message || '',
          duration,
          timestamp: new Date().toISOString(),
          details: result.details || {}
        };
        
      } catch (error) {
        results[name] = {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
          error: error.stack
        };
      }
    }
    
    return results;
  }

  /**
   * Get cached health check results
   * @returns {Object} Cached health check results
   */
  getHealthCheckResults() {
    return this.lastHealthCheckResults || {};
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    const interval = config.monitoring?.healthCheckInterval || 60000; // 1 minute
    
    setInterval(async () => {
      try {
        this.lastHealthCheckResults = await this.runHealthChecks();
        
        // Log unhealthy checks
        Object.entries(this.lastHealthCheckResults).forEach(([name, result]) => {
          if (result.status !== 'healthy') {
            logger.warn('Health check failed', {
              check: name,
              status: result.status,
              message: result.message
            });
          }
        });
        
      } catch (error) {
        logger.error('Health check execution failed', {
          error: error.message
        });
      }
    }, interval);
    
    logger.info('Periodic health checks started', {
      interval: `${interval}ms`
    });
  }

  /**
   * Reset all metrics (for testing)
   */
  resetMetrics() {
    this.metrics = {
      system: {
        startTime: Date.now(),
        requests: 0,
        errors: 0,
        warnings: 0,
        criticalErrors: 0
      },
      documents: {
        processed: 0,
        failed: 0,
        avgProcessingTime: 0,
        totalProcessingTime: 0
      },
      metrics: {
        extracted: 0,
        avgConfidence: 0,
        totalConfidence: 0
      },
      database: {
        operations: 0,
        failures: 0,
        avgResponseTime: 0,
        totalResponseTime: 0
      },
      spreadsheets: {
        created: 0,
        updated: 0,
        errors: 0
      }
    };
    
    this.alerts = [];
    
    logger.info('Monitoring metrics reset');
  }
}

// Global monitoring service instance
export const monitoringService = new MonitoringService();

export default MonitoringService;