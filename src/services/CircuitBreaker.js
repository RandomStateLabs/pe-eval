/**
 * Circuit Breaker Service for API Resilience
 * Implements circuit breaker pattern for Google API operations
 */

import logger from '../utils/logger.js';
import config from '../config/environment.js';

export class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      recoveryTimeout: options.recoveryTimeout || 60000, // 1 minute
      monitoringWindow: options.monitoringWindow || 300000, // 5 minutes
      ...options
    };
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = [];
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.requestCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
    
    // Performance tracking
    this.responseTimeHistory = [];
    this.maxHistorySize = 100;
    
    logger.info('CircuitBreaker initialized', {
      service: this.service,
      failureThreshold: this.options.failureThreshold,
      recoveryTimeout: this.options.recoveryTimeout
    });
  }

  /**
   * Execute operation with circuit breaker protection
   * @param {Function} operation - Operation to execute
   * @param {string} operationName - Name for logging
   * @returns {Promise<*>} Operation result
   */
  async execute(operation, operationName = 'unknown') {
    const timer = logger.timer(`circuit-breaker-${operationName}`);
    
    try {
      // Check if circuit is open
      if (this.state === 'OPEN') {
        if (!this.shouldAttemptReset()) {
          const error = new Error(`Circuit breaker is OPEN for service: ${this.service}`);
          error.code = 'CIRCUIT_BREAKER_OPEN';
          throw error;
        } else {
          this.state = 'HALF_OPEN';
          logger.info('Circuit breaker transitioning to HALF_OPEN', {
            service: this.service,
            operationName
          });
        }
      }

      // Execute the operation
      const startTime = Date.now();
      const result = await operation();
      const responseTime = Date.now() - startTime;
      
      // Record success
      this.onSuccess(responseTime);
      const duration = timer.end({
        service: this.service,
        operation: operationName,
        state: this.state,
        responseTime: `${responseTime}ms`
      });
      
      return result;
      
    } catch (error) {
      // Record failure
      this.onFailure(error);
      timer.end({ 
        error: error.message,
        service: this.service,
        operation: operationName,
        state: this.state
      });
      throw error;
    }
  }

  /**
   * Record successful operation
   * @param {number} responseTime - Response time in milliseconds
   */
  onSuccess(responseTime) {
    this.requestCount++;
    this.successCount++;
    this.lastSuccessTime = Date.now();
    
    // Record response time
    this.responseTimeHistory.push({
      time: this.lastSuccessTime,
      responseTime
    });
    
    // Limit history size
    if (this.responseTimeHistory.length > this.maxHistorySize) {
      this.responseTimeHistory.shift();
    }
    
    // Reset circuit breaker if it was half-open
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = [];
      logger.info('Circuit breaker RESET to CLOSED', {
        service: this.service,
        responseTime: `${responseTime}ms`
      });
    }
    
    // Clean up old failures outside monitoring window
    this.cleanupOldFailures();
  }

  /**
   * Record failed operation
   * @param {Error} error - The error that occurred
   */
  onFailure(error) {
    this.requestCount++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // Record failure
    this.failures.push({
      time: this.lastFailureTime,
      error: error.message,
      code: error.code || 'UNKNOWN'
    });
    
    logger.warn('Circuit breaker recorded failure', {
      service: this.service,
      error: error.message,
      failureCount: this.getRecentFailureCount(),
      threshold: this.options.failureThreshold
    });
    
    // Check if we should open the circuit
    if (this.shouldOpen()) {
      this.state = 'OPEN';
      logger.error('Circuit breaker OPENED', {
        service: this.service,
        recentFailures: this.getRecentFailureCount(),
        threshold: this.options.failureThreshold,
        nextRetryIn: `${this.options.recoveryTimeout}ms`
      });
    }
    
    // Clean up old failures
    this.cleanupOldFailures();
  }

  /**
   * Check if circuit should open due to failures
   * @returns {boolean} Whether circuit should open
   */
  shouldOpen() {
    const recentFailures = this.getRecentFailureCount();
    return this.state === 'CLOSED' && recentFailures >= this.options.failureThreshold;
  }

  /**
   * Check if circuit should attempt to reset from OPEN to HALF_OPEN
   * @returns {boolean} Whether reset should be attempted
   */
  shouldAttemptReset() {
    if (!this.lastFailureTime) return false;
    return (Date.now() - this.lastFailureTime) >= this.options.recoveryTimeout;
  }

  /**
   * Get count of failures within monitoring window
   * @returns {number} Recent failure count
   */
  getRecentFailureCount() {
    const cutoffTime = Date.now() - this.options.monitoringWindow;
    return this.failures.filter(failure => failure.time >= cutoffTime).length;
  }

  /**
   * Clean up failures outside monitoring window
   */
  cleanupOldFailures() {
    const cutoffTime = Date.now() - this.options.monitoringWindow;
    this.failures = this.failures.filter(failure => failure.time >= cutoffTime);
  }

  /**
   * Get circuit breaker health metrics
   * @returns {Object} Health metrics
   */
  getHealthMetrics() {
    const recentFailures = this.getRecentFailureCount();
    const recentResponseTimes = this.responseTimeHistory
      .filter(entry => entry.time >= Date.now() - this.options.monitoringWindow);
    
    const avgResponseTime = recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((sum, entry) => sum + entry.responseTime, 0) / recentResponseTimes.length
      : 0;

    return {
      service: this.service,
      state: this.state,
      totalRequests: this.requestCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      recentFailures: recentFailures,
      failureRate: this.requestCount > 0 ? (this.failureCount / this.requestCount) : 0,
      recentFailureRate: recentFailures / Math.max(recentResponseTimes.length, 1),
      averageResponseTime: Math.round(avgResponseTime),
      lastSuccessTime: this.lastSuccessTime,
      lastFailureTime: this.lastFailureTime,
      uptime: this.calculateUptime(),
      nextRetryIn: this.state === 'OPEN' && this.lastFailureTime
        ? Math.max(0, this.options.recoveryTimeout - (Date.now() - this.lastFailureTime))
        : 0
    };
  }

  /**
   * Calculate uptime percentage
   * @returns {number} Uptime percentage
   */
  calculateUptime() {
    if (this.requestCount === 0) return 100;
    return ((this.successCount / this.requestCount) * 100).toFixed(2);
  }

  /**
   * Force circuit breaker state (for testing)
   * @param {string} state - New state (OPEN, CLOSED, HALF_OPEN)
   */
  forceState(state) {
    logger.warn('Circuit breaker state forced', {
      service: this.service,
      oldState: this.state,
      newState: state
    });
    this.state = state;
  }

  /**
   * Reset circuit breaker metrics
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = [];
    this.responseTimeHistory = [];
    this.requestCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    
    logger.info('Circuit breaker reset', {
      service: this.service
    });
  }
}

/**
 * Circuit Breaker Manager for multiple services
 */
export class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
    this.globalConfig = {
      failureThreshold: config.circuitBreaker?.failureThreshold || 5,
      recoveryTimeout: config.circuitBreaker?.recoveryTimeout || 60000,
      monitoringWindow: config.circuitBreaker?.monitoringWindow || 300000
    };
    
    logger.info('CircuitBreakerManager initialized', {
      globalConfig: this.globalConfig
    });
  }

  /**
   * Get or create circuit breaker for service
   * @param {string} service - Service name
   * @param {Object} options - Circuit breaker options
   * @returns {CircuitBreaker} Circuit breaker instance
   */
  getBreaker(service, options = {}) {
    if (!this.breakers.has(service)) {
      const breakerOptions = { ...this.globalConfig, ...options };
      this.breakers.set(service, new CircuitBreaker(service, breakerOptions));
    }
    return this.breakers.get(service);
  }

  /**
   * Execute operation with circuit breaker protection
   * @param {string} service - Service name
   * @param {Function} operation - Operation to execute
   * @param {string} operationName - Operation name
   * @param {Object} options - Circuit breaker options
   * @returns {Promise<*>} Operation result
   */
  async execute(service, operation, operationName, options = {}) {
    const breaker = this.getBreaker(service, options);
    return breaker.execute(operation, operationName);
  }

  /**
   * Get health metrics for all circuit breakers
   * @returns {Object} Combined health metrics
   */
  getGlobalHealthMetrics() {
    const metrics = {
      totalServices: this.breakers.size,
      servicesDown: 0,
      servicesHealthy: 0,
      servicesDegraded: 0,
      services: {}
    };

    for (const [service, breaker] of this.breakers) {
      const serviceMetrics = breaker.getHealthMetrics();
      metrics.services[service] = serviceMetrics;

      if (serviceMetrics.state === 'OPEN') {
        metrics.servicesDown++;
      } else if (serviceMetrics.recentFailureRate > 0.1) {
        metrics.servicesDegraded++;
      } else {
        metrics.servicesHealthy++;
      }
    }

    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const [service, breaker] of this.breakers) {
      breaker.reset();
    }
    logger.info('All circuit breakers reset');
  }

  /**
   * Get circuit breaker for service (if exists)
   * @param {string} service - Service name
   * @returns {CircuitBreaker|null} Circuit breaker or null
   */
  getBreakerIfExists(service) {
    return this.breakers.get(service) || null;
  }
}

// Global circuit breaker manager instance
export const circuitBreakerManager = new CircuitBreakerManager();

export default { CircuitBreaker, CircuitBreakerManager, circuitBreakerManager };