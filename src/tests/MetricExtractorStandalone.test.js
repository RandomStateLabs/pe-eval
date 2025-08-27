/**
 * Standalone Metric Extraction Test
 * Tests the MetricExtractor without external dependencies
 */
import { TEST_CONFIG } from './TestEnvironment.js';

// Mock logger for testing
const mockLogger = {
  timer: (label) => ({
    end: (data = {}) => {
      return Math.floor(Math.random() * 100 + 50); // Mock duration
    }
  }),
  info: (msg, data = {}) => console.log(`INFO: ${msg}`, data),
  warn: (msg, data = {}) => console.log(`WARN: ${msg}`, data),
  error: (msg, data = {}) => console.log(`ERROR: ${msg}`, data),
  metricExtraction: (company, doc, metrics, confidence) => {
    console.log(`METRIC_EXTRACTION: ${company} - ${doc} - ${Object.keys(metrics).length} metrics - ${confidence.toFixed(3)} confidence`);
  }
};

/**
 * Standalone Financial Metric Extraction Engine for Testing
 */
class MetricExtractorTest {
  constructor() {
    this.patterns = {
      revenue: [
        /revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /total\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /net\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /sales.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
      ],
      
      valuation: [
        /valuation.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /enterprise\s+value.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /market\s+cap.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /company\s+value.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
      ],
      
      arr: [
        /arr.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /annual\s+recurring\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
        /recurring\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
      ],
      
      growth_rate: [
        /growth\s+rate.*?([\d.]+)%/gi,
        /revenue\s+growth.*?([\d.]+)%/gi,
        /annual\s+growth.*?([\d.]+)%/gi,
        /yoy\s+growth.*?([\d.]+)%/gi,
        /year.over.year.*?([\d.]+)%/gi
      ],
      
      customer_count: [
        /customers?.*?([\d,]+)/gi,
        /active\s+users.*?([\d,]+)/gi,
        /subscriber.*?([\d,]+)/gi,
        /client.*?([\d,]+)/gi
      ],
      
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
  }

  extractMetrics(text, documentSource) {
    const startTime = Date.now();
    const extractedMetrics = {};
    
    try {
      Object.keys(this.patterns).forEach(metricType => {
        const metrics = this.extractMetricType(text, metricType, documentSource);
        if (metrics.length > 0) {
          extractedMetrics[metricType] = metrics;
        }
      });
      
      const totalMetrics = Object.values(extractedMetrics).flat().length;
      const avgConfidence = totalMetrics > 0 
        ? Object.values(extractedMetrics).flat()
            .reduce((sum, metric) => sum + metric.confidence, 0) / totalMetrics
        : 0;
      
      const duration = Date.now() - startTime;
      
      mockLogger.metricExtraction(
        'test-company',
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
      mockLogger.error('Metric extraction failed', {
        error: error.message,
        documentSource,
        textLength: text.length
      });
      throw error;
    }
  }

  extractMetricType(text, metricType, documentSource) {
    const patterns = this.patterns[metricType];
    const results = [];
    
    patterns.forEach((pattern, patternIndex) => {
      let match;
      pattern.lastIndex = 0;
      
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
        
        if (metric && metric.confidence >= TEST_CONFIG.metrics.confidenceThreshold) {
          results.push(metric);
        }
      }
    });
    
    return this.deduplicateMetrics(results)
      .sort((a, b) => b.confidence - a.confidence);
  }

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
    
    const numericValue = this.parseNumericValue(rawValue, fullMatch);
    if (numericValue === null) return null;
    
    const currency = this.detectCurrency(fullMatch, context);
    const confidence = this.calculateConfidence({
      metricType,
      fullMatch,
      context,
      patternIndex,
      numericValue
    });
    
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

  parseNumericValue(rawValue, fullMatch) {
    try {
      const baseNumber = parseFloat(rawValue.replace(/,/g, ''));
      if (isNaN(baseNumber)) return null;
      
      const lowerMatch = fullMatch.toLowerCase();
      for (const [key, multiplier] of Object.entries(this.multipliers)) {
        if (lowerMatch.includes(key)) {
          return baseNumber * multiplier;
        }
      }
      
      return baseNumber;
    } catch (error) {
      return null;
    }
  }

  detectCurrency(match, context) {
    const combinedText = (match + ' ' + context).toLowerCase();
    
    if (combinedText.includes('$')) return 'USD';
    if (combinedText.includes('€')) return 'EUR';
    if (combinedText.includes('£')) return 'GBP';
    if (combinedText.includes('¥')) return 'JPY';
    
    if (combinedText.includes('dollar') || combinedText.includes('usd')) return 'USD';
    if (combinedText.includes('euro') || combinedText.includes('eur')) return 'EUR';
    if (combinedText.includes('pound') || combinedText.includes('gbp')) return 'GBP';
    if (combinedText.includes('yen') || combinedText.includes('jpy')) return 'JPY';
    
    return 'USD';
  }

  extractContext(text, position, contextLength = 100) {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + contextLength);
    return text.substring(start, end);
  }

  calculateConfidence(params) {
    const { metricType, fullMatch, context, patternIndex, numericValue } = params;
    let confidence = 0.5;
    
    confidence += (0.3 - (patternIndex * 0.05));
    
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes(metricType) || lowerContext.includes(metricType.replace('_', ' '))) {
      confidence += 0.2;
    }
    
    if (this.isReasonableValue(metricType, numericValue)) {
      confidence += 0.1;
    } else {
      confidence -= 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  isReasonableValue(metricType, value) {
    const ranges = {
      revenue: { min: 1000, max: 1000000000000 },
      valuation: { min: 10000, max: 10000000000000 },
      arr: { min: 1000, max: 10000000000 },
      growth_rate: { min: -100, max: 1000 },
      customer_count: { min: 1, max: 10000000000 },
      burn_rate: { min: 1000, max: 1000000000 }
    };
    
    const range = ranges[metricType];
    if (!range) return true;
    
    return value >= range.min && value <= range.max;
  }

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

  deduplicateMetrics(metrics) {
    if (metrics.length <= 1) return metrics;
    
    const deduplicated = [];
    
    metrics.forEach(metric => {
      const isDuplicate = deduplicated.some(existing => {
        return Math.abs(existing.value - metric.value) / Math.max(existing.value, metric.value) < 0.05 &&
               existing.type === metric.type &&
               Math.abs(existing.position - metric.position) < 200;
      });
      
      if (!isDuplicate) {
        deduplicated.push(metric);
      }
    });
    
    return deduplicated;
  }

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

// Test execution
async function testMetricExtraction() {
  console.log('🧪 Testing Metric Extraction Engine (Standalone)...\n');
  
  const extractor = new MetricExtractorTest();
  
  const testDocument = `
    PE-Eval Financial Analysis Report
    Q3 2024 Performance Review
    
    Total Revenue: $15.2 million for Q3 2024
    Revenue Growth: 23.5% year-over-year  
    ARR: $45.8M as of September 2024
    Gross Margin: 68.3%
    Customer Count: 1,245 active customers
    Monthly Burn Rate: $890,000
    Company Valuation: $125 million (Series B)
    
    Additional Metrics:
    - Net Revenue Retention: 115%
    - Customer Acquisition Cost: $1,200
    - Average Contract Value: $36,800
    - Sales: $14.1M in direct sales
    - Enterprise Value: $140 million
    - Annual Recurring Revenue: $44.2 million
  `;
  
  try {
    console.log('Extracting metrics from sample document...');
    const result = extractor.extractMetrics(testDocument, 'test-financial-report.pdf');
    
    const { totalMetrics, avgConfidence } = result.summary;
    const { metrics } = result;
    
    console.log(`\n📊 Results:`);
    console.log(`   Total metrics found: ${totalMetrics}`);
    console.log(`   Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Metric types detected: ${Object.keys(metrics).length}`);
    
    console.log(`\n🔍 Detailed breakdown:`);
    Object.entries(metrics).forEach(([type, metricList]) => {
      console.log(`   ${type}: ${metricList.length} metrics`);
      metricList.forEach((metric, index) => {
        console.log(`     ${index + 1}. ${metric.value.toLocaleString()} ${metric.currency || metric.unit} (${(metric.confidence * 100).toFixed(0)}% confidence)`);
        console.log(`        "${metric.rawMatch.trim()}"`);
      });
    });
    
    // Test database formatting
    const formattedRecords = extractor.formatForDatabase(result, 'test-company');
    console.log(`\n💾 Database records formatted: ${formattedRecords.length}`);
    
    // Validation checks
    const expectedTypes = ['revenue', 'growth_rate', 'arr', 'customer_count', 'burn_rate', 'valuation'];
    const foundTypes = Object.keys(metrics);
    const foundExpected = expectedTypes.filter(type => foundTypes.includes(type));
    
    console.log(`\n✅ Test Results:`);
    console.log(`   Expected metric types found: ${foundExpected.length}/${expectedTypes.length}`);
    console.log(`   Found types: ${foundTypes.join(', ')}`);
    console.log(`   Minimum confidence threshold: ${TEST_CONFIG.metrics.confidenceThreshold}`);
    console.log(`   Average confidence achieved: ${(avgConfidence * 100).toFixed(1)}%`);
    
    const passed = totalMetrics >= 8 && avgConfidence >= 0.7 && foundExpected.length >= 5;
    
    if (passed) {
      console.log(`\n🎉 METRIC EXTRACTION TEST PASSED!`);
      console.log(`   ✅ Found sufficient metrics (${totalMetrics} >= 8)`);
      console.log(`   ✅ Good confidence level (${(avgConfidence * 100).toFixed(1)}% >= 70%)`);
      console.log(`   ✅ Detected expected types (${foundExpected.length} >= 5)`);
      return true;
    } else {
      console.log(`\n❌ METRIC EXTRACTION TEST FAILED!`);
      if (totalMetrics < 8) console.log(`   ❌ Insufficient metrics found (${totalMetrics} < 8)`);
      if (avgConfidence < 0.7) console.log(`   ❌ Low confidence level (${(avgConfidence * 100).toFixed(1)}% < 70%)`);
      if (foundExpected.length < 5) console.log(`   ❌ Missing expected types (${foundExpected.length} < 5)`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMetricExtraction()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

export { MetricExtractorTest, testMetricExtraction };