import logger from '../utils/logger.js';
import config from '../config/environment.js';

/**
 * Financial Metric Extraction Engine
 * Identifies and extracts financial metrics from document text using pattern matching
 */
export class MetricExtractor {
  constructor() {
    this.patterns = {
      // Revenue patterns
      revenue: [
        /revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /total\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /net\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /sales.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
      ],
      
      // Valuation patterns
      valuation: [
        /valuation.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /enterprise\s+value.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /market\s+cap.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /company\s+value.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
      ],
      
      // ARR (Annual Recurring Revenue) patterns
      arr: [
        /arr.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /annual\s+recurring\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /recurring\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
      ],
      
      // Growth rate patterns
      growth_rate: [
        /growth\s+rate.*?([\d.]+)%/gi,
        /revenue\s+growth.*?([\d.]+)%/gi,
        /annual\s+growth.*?([\d.]+)%/gi,
        /yoy\s+growth.*?([\d.]+)%/gi,
        /year.over.year.*?([\d.]+)%/gi
      ],
      
      // Customer count patterns
      customer_count: [
        /customers?.*?([\d,]+)/gi,
        /active\s+users.*?([\d,]+)/gi,
        /subscriber.*?([\d,]+)/gi,
        /client.*?([\d,]+)/gi
      ],
      
      // Burn rate patterns
      burn_rate: [
        /burn\s+rate.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /monthly\s+burn.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /cash\s+burn.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
      ]
    };
    
    this.multipliers = {
      'k': 1000,
      'thousand': 1000,
      'm': 1000000,
      'million': 1000000,
      'b': 1000000000,
      'billion': 1000000000
    };
    
    this.currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];
  }

  /**
   * Extract all financial metrics from document text
   * @param {string} text - Document text content
   * @param {string} documentSource - Source document identifier
   * @returns {Object} Extracted metrics with confidence scores
   */
  extractMetrics(text, documentSource) {
    const timer = logger.timer('metric-extraction');
    const extractedMetrics = {};
    
    try {
      // Process each metric type
      Object.keys(this.patterns).forEach(metricType => {
        const metrics = this.extractMetricType(text, metricType, documentSource);
        if (metrics.length > 0) {
          extractedMetrics[metricType] = metrics;
        }
      });
      
      // Calculate overall confidence
      const totalMetrics = Object.values(extractedMetrics).flat().length;
      const avgConfidence = totalMetrics > 0 
        ? Object.values(extractedMetrics).flat()
            .reduce((sum, metric) => sum + metric.confidence, 0) / totalMetrics
        : 0;
      
      const duration = timer.end({
        documentSource,
        metricsFound: totalMetrics,
        avgConfidence: avgConfidence.toFixed(3)
      });
      
      logger.metricExtraction(
        'unknown-company', // Company will be determined by calling service
        documentSource,
        extractedMetrics,
        avgConfidence
      );
      
      return {
        metrics: extractedMetrics,
        summary: {
          totalMetrics,
          avgConfidence,
          processingTime: duration,
          documentSource,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      timer.end({ error: error.message });
      logger.error('Metric extraction failed', {
        error: error.message,
        documentSource,
        textLength: text.length
      });
      throw error;
    }
  }

  /**
   * Extract metrics for a specific type
   * @param {string} text - Document text
   * @param {string} metricType - Type of metric to extract
   * @param {string} documentSource - Source document
   * @returns {Array} Array of extracted metric objects
   */
  extractMetricType(text, metricType, documentSource) {
    const patterns = this.patterns[metricType];
    const results = [];
    
    patterns.forEach((pattern, patternIndex) => {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      
      while ((match = pattern.exec(text)) !== null) {
        const rawValue = match[1];
        const fullMatch = match[0];
        const context = this.extractContext(text, match.index, 100);
        
        const metric = this.processMetricMatch({
          metricType,
          rawValue,
          fullMatch,
          context,
          documentSource,
          patternIndex,
          position: match.index
        });
        
        if (metric && metric.confidence >= config.metrics.confidenceThreshold) {
          results.push(metric);
        }
      }
    });
    
    // Deduplicate and sort by confidence
    return this.deduplicateMetrics(results)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Process a single metric match
   * @param {Object} matchData - Match data object
   * @returns {Object} Processed metric object
   */
  processMetricMatch(matchData) {
    const {
      metricType,
      rawValue,
      fullMatch,
      context,
      documentSource,
      patternIndex,
      position
    } = matchData;
    
    // Parse numerical value
    const numericValue = this.parseNumericValue(rawValue, fullMatch);
    if (numericValue === null) return null;
    
    // Detect currency
    const currency = this.detectCurrency(fullMatch, context);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence({
      metricType,
      fullMatch,
      context,
      patternIndex,
      numericValue
    });
    
    // Detect time period
    const period = this.detectPeriod(context);
    
    return {
      type: metricType,
      value: numericValue,
      currency: currency,
      unit: this.getUnit(metricType),
      rawMatch: fullMatch,
      rawValue: rawValue,
      context: context.trim(),
      confidence: confidence,
      period: period,
      timestamp: new Date().toISOString(),
      documentSource: documentSource,
      position: position,
      patternIndex: patternIndex
    };
  }

  /**
   * Parse numeric value with multiplier support
   * @param {string} rawValue - Raw numeric string
   * @param {string} fullMatch - Full match context
   * @returns {number|null} Parsed numeric value
   */
  parseNumericValue(rawValue, fullMatch) {
    try {
      // Remove commas and parse base number
      const baseNumber = parseFloat(rawValue.replace(/,/g, ''));
      if (isNaN(baseNumber)) return null;
      
      // Check for multipliers
      const lowerMatch = fullMatch.toLowerCase();
      for (const [key, multiplier] of Object.entries(this.multipliers)) {
        if (lowerMatch.includes(key)) {
          return baseNumber * multiplier;
        }
      }
      
      return baseNumber;
    } catch (error) {
      logger.warn('Failed to parse numeric value', { rawValue, error: error.message });
      return null;
    }
  }

  /**
   * Detect currency from text context
   * @param {string} match - Matched text
   * @param {string} context - Surrounding context
   * @returns {string} Detected currency code
   */
  detectCurrency(match, context) {
    const combinedText = (match + ' ' + context).toLowerCase();
    
    // Symbol-based detection
    if (combinedText.includes('$')) return 'USD';
    if (combinedText.includes('€')) return 'EUR';
    if (combinedText.includes('£')) return 'GBP';
    if (combinedText.includes('¥')) return 'JPY';
    
    // Word-based detection
    if (combinedText.includes('dollar') || combinedText.includes('usd')) return 'USD';
    if (combinedText.includes('euro') || combinedText.includes('eur')) return 'EUR';
    if (combinedText.includes('pound') || combinedText.includes('gbp')) return 'GBP';
    if (combinedText.includes('yen') || combinedText.includes('jpy')) return 'JPY';
    
    return 'USD'; // Default assumption
  }

  /**
   * Extract surrounding context from text
   * @param {string} text - Full text
   * @param {number} position - Match position
   * @param {number} contextLength - Characters before/after
   * @returns {string} Context string
   */
  extractContext(text, position, contextLength = 100) {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + contextLength);
    return text.substring(start, end);
  }

  /**
   * Calculate confidence score for extracted metric
   * @param {Object} params - Confidence calculation parameters
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(params) {
    const { metricType, fullMatch, context, patternIndex, numericValue } = params;
    let confidence = 0.5; // Base confidence
    
    // Pattern specificity bonus
    confidence += (0.3 - (patternIndex * 0.05)); // Earlier patterns are more specific
    
    // Context quality bonus
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes(metricType) || lowerContext.includes(metricType.replace('_', ' '))) {
      confidence += 0.2;
    }
    
    // Reasonable value check
    if (this.isReasonableValue(metricType, numericValue)) {
      confidence += 0.1;
    } else {
      confidence -= 0.2;
    }
    
    // Currency/unit presence
    if (this.currencies.some(curr => fullMatch.includes(curr) || context.includes(curr))) {
      confidence += 0.1;
    }
    
    // Ensure confidence is within bounds
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Check if value is reasonable for metric type
   * @param {string} metricType - Type of metric
   * @param {number} value - Numeric value
   * @returns {boolean} Whether value is reasonable
   */
  isReasonableValue(metricType, value) {
    const ranges = {
      revenue: { min: 1000, max: 1000000000000 }, // $1K to $1T
      valuation: { min: 10000, max: 10000000000000 }, // $10K to $10T
      arr: { min: 1000, max: 10000000000 }, // $1K to $10B
      growth_rate: { min: -100, max: 1000 }, // -100% to 1000%
      customer_count: { min: 1, max: 10000000000 }, // 1 to 10B customers
      burn_rate: { min: 1000, max: 1000000000 } // $1K to $1B monthly
    };
    
    const range = ranges[metricType];
    if (!range) return true; // Unknown metric types assumed reasonable
    
    return value >= range.min && value <= range.max;
  }

  /**
   * Detect time period from context
   * @param {string} context - Text context
   * @returns {string} Detected period
   */
  detectPeriod(context) {
    const lowerContext = context.toLowerCase();
    
    if (lowerContext.includes('quarter') || lowerContext.includes('q1') || 
        lowerContext.includes('q2') || lowerContext.includes('q3') || 
        lowerContext.includes('q4')) {
      return 'quarterly';
    }
    
    if (lowerContext.includes('annual') || lowerContext.includes('year') || 
        lowerContext.includes('yearly')) {
      return 'annual';
    }
    
    if (lowerContext.includes('month') || lowerContext.includes('monthly')) {
      return 'monthly';
    }
    
    return 'unknown';
  }

  /**
   * Get unit for metric type
   * @param {string} metricType - Metric type
   * @returns {string} Unit string
   */
  getUnit(metricType) {
    const units = {
      revenue: 'currency',
      valuation: 'currency',
      arr: 'currency',
      burn_rate: 'currency',
      growth_rate: 'percentage',
      customer_count: 'count'
    };
    
    return units[metricType] || 'unknown';
  }

  /**
   * Remove duplicate metrics based on similarity
   * @param {Array} metrics - Array of metrics
   * @returns {Array} Deduplicated metrics
   */
  deduplicateMetrics(metrics) {
    if (metrics.length <= 1) return metrics;
    
    const deduplicated = [];
    
    metrics.forEach(metric => {
      const isDuplicate = deduplicated.some(existing => {
        return Math.abs(existing.value - metric.value) / Math.max(existing.value, metric.value) < 0.05 && // 5% tolerance
               existing.type === metric.type &&
               Math.abs(existing.position - metric.position) < 200; // Position tolerance
      });
      
      if (!isDuplicate) {
        deduplicated.push(metric);
      }
    });
    
    return deduplicated;
  }

  /**
   * Format metrics for database storage
   * @param {Object} extractionResult - Result from extractMetrics
   * @param {string} companyName - Company name
   * @returns {Array} Array of formatted database records
   */
  formatForDatabase(extractionResult, companyName) {
    const records = [];
    const { metrics, summary } = extractionResult;
    
    Object.entries(metrics).forEach(([metricType, metricList]) => {
      metricList.forEach(metric => {
        records.push({
          timestamp: metric.timestamp,
          company_name: companyName,
          document_source: metric.documentSource,
          metric_name: metricType,
          metric_value: metric.value,
          currency: metric.currency,
          unit: metric.unit,
          period: metric.period,
          extracted_by: 'ai-extraction',
          confidence: metric.confidence,
          raw_match: metric.rawMatch,
          context: metric.context,
          processing_time: summary.processingTime
        });
      });
    });
    
    return records;
  }
}

export default MetricExtractor;