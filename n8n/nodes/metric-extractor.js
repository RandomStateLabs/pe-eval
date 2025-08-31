/**
 * n8n Code Node: Financial Metric Extraction
 * Translates MetricExtractor.js logic for n8n workflow
 * 89.6% accuracy baseline from Phase 1 testing
 * Enhanced with LLM validation pipeline integration
 */

// Input: Document text from previous node
const items = $input.all();
const results = [];

// Configuration
const CONFIG = {
  confidenceThreshold: 0.4,
  maxMetricsPerType: 10,
  enableDebugLogging: true
};

// Financial metric patterns (from MetricExtractor.js)
const patterns = {
  revenue: [
    /revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /total\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /net\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /sales.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
  ],
  valuation: [
    /valuation.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /enterprise\s+value.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /market\s+cap.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
  ],
  arr: [
    /arr.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /annual\s+recurring\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
  ],
  growth_rate: [
    /growth\s+rate.*?([\d.]+)%/gi,
    /revenue\s+growth.*?([\d.]+)%/gi,
    /annual\s+growth.*?([\d.]+)%/gi,
    /yoy\s+growth.*?([\d.]+)%/gi
  ],
  customer_count: [
    /customers?.*?([\d,]+)/gi,
    /active\s+users.*?([\d,]+)/gi,
    /subscriber.*?([\d,]+)/gi
  ],
  burn_rate: [
    /burn\s+rate.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /monthly\s+burn.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi
  ]
};

const multipliers = {
  'k': 1000, 'thousand': 1000,
  'm': 1000000, 'million': 1000000,
  'b': 1000000000, 'billion': 1000000000
};

// Parse numeric value with multipliers
function parseNumericValue(rawValue, fullMatch) {
  try {
    const baseNumber = parseFloat(rawValue.replace(/,/g, ''));
    if (isNaN(baseNumber)) return null;
    
    const lowerMatch = fullMatch.toLowerCase();
    for (const [key, multiplier] of Object.entries(multipliers)) {
      if (lowerMatch.includes(key)) {
        return baseNumber * multiplier;
      }
    }
    return baseNumber;
  } catch (error) {
    return null;
  }
}

// Detect currency from context
function detectCurrency(match, context) {
  const combinedText = (match + ' ' + context).toLowerCase();
  if (combinedText.includes('$')) return 'USD';
  if (combinedText.includes('€')) return 'EUR';
  if (combinedText.includes('£')) return 'GBP';
  if (combinedText.includes('¥')) return 'JPY';
  return 'USD'; // Default
}

// Calculate confidence score
function calculateConfidence(metricType, fullMatch, context, patternIndex, numericValue) {
  let confidence = 0.5;
  
  // Pattern specificity bonus
  confidence += (0.3 - (patternIndex * 0.05));
  
  // Context quality bonus
  const lowerContext = context.toLowerCase();
  if (lowerContext.includes(metricType) || lowerContext.includes(metricType.replace('_', ' '))) {
    confidence += 0.2;
  }
  
  // Reasonable value check
  if (isReasonableValue(metricType, numericValue)) {
    confidence += 0.1;
  } else {
    confidence -= 0.2;
  }
  
  return Math.max(0, Math.min(1, confidence));
}

// Check if value is reasonable for metric type
function isReasonableValue(metricType, value) {
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

// Extract context around match
function extractContext(text, position, contextLength = 100) {
  const start = Math.max(0, position - contextLength);
  const end = Math.min(text.length, position + contextLength);
  return text.substring(start, end);
}

// Process each input item
for (const item of items) {
  const documentText = item.json.document_text || item.json.text || '';
  const companyName = item.json.company_name || 'Unknown';
  const documentSource = item.json.document_source || item.json.source || 'unknown';
  
  if (!documentText) {
    results.push({
      json: {
        ...item.json,
        extracted_metrics: {},
        metrics_found: 0,
        confidence: 0,
        processing_error: 'No document text provided'
      }
    });
    continue;
  }
  
  const extractedMetrics = {};
  let totalMetrics = 0;
  let totalConfidence = 0;
  
  // Process each metric type
  Object.keys(patterns).forEach(metricType => {
    const metricPatterns = patterns[metricType];
    const metrics = [];
    
    metricPatterns.forEach((pattern, patternIndex) => {
      let match;
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(documentText)) !== null) {
        const rawValue = match[1];
        const fullMatch = match[0];
        const context = extractContext(documentText, match.index, 100);
        
        const numericValue = parseNumericValue(rawValue, fullMatch);
        if (numericValue === null) continue;
        
        const currency = detectCurrency(fullMatch, context);
        const confidence = calculateConfidence(metricType, fullMatch, context, patternIndex, numericValue);
        
        if (confidence >= CONFIG.confidenceThreshold) {
          metrics.push({
            type: metricType,
            value: numericValue,
            currency: currency,
            rawMatch: fullMatch,
            context: context.trim(),
            confidence: confidence,
            timestamp: new Date().toISOString(),
            position: match.index,
            patternIndex: patternIndex,
            period: detectPeriod(context),
            unit: getUnit(metricType)
          });
          
          totalMetrics++;
          totalConfidence += confidence;
        }
      }
    });
    
    if (metrics.length > 0) {
      // Remove duplicates and sort by confidence
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
      
      // Limit metrics per type and sort by confidence
      const sorted = deduplicated.sort((a, b) => b.confidence - a.confidence);
      extractedMetrics[metricType] = sorted.slice(0, CONFIG.maxMetricsPerType);
      
      if (CONFIG.enableDebugLogging && sorted.length > CONFIG.maxMetricsPerType) {
        console.log(`⚠️ Limited ${metricType} metrics from ${sorted.length} to ${CONFIG.maxMetricsPerType}`);
      }
    }
  });
  
  const avgConfidence = totalMetrics > 0 ? totalConfidence / totalMetrics : 0;
  
  // Enhanced output for LLM validation pipeline
  const enhancedOutput = {
    ...item.json,
    extracted_metrics: extractedMetrics,
    metrics_summary: {
      total_metrics: totalMetrics,
      avg_confidence: avgConfidence,
      company_name: companyName,
      document_source: documentSource,
      timestamp: new Date().toISOString(),
      extraction_method: 'ai-regex-patterns',
      phase1_accuracy: '89.6%'
    },
    // LLM validation preparation
    llm_validation_context: {
      document_snippet: documentText.substring(0, 2000), // First 2K chars for context
      metrics_for_validation: Object.entries(extractedMetrics).map(([type, metrics]) => ({
        metric_type: type,
        extracted_values: metrics.slice(0, 3).map(m => ({
          value: m.value,
          currency: m.currency,
          confidence: m.confidence,
          context: m.context
        }))
      })),
      validation_prompt: `Please validate these extracted financial metrics from the document. Company: ${companyName}, Source: ${documentSource}`
    },
    metrics_ready_for_llm: true
  };
  
  if (CONFIG.enableDebugLogging) {
    console.log(`📊 Extracted ${totalMetrics} metrics for ${companyName} (avg confidence: ${avgConfidence.toFixed(3)})`);
  }
  
  results.push({
    json: enhancedOutput
  });
}

return results;