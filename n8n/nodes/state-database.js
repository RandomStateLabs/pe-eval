/**
 * n8n Code Node: State Database Operations
 * Translates StateDatabase.js logic for Google Sheets operations
 * Manages time-series data and historical metrics
 * Enhanced with LLM-validated metrics and delta intelligence
 */

// Input: LLM-validated metrics data from previous node
const items = $input.all();
const results = [];

// Enhanced configuration
const CONFIG = {
  enableDeltaIntelligence: true,
  enableHistoricalLookup: true,
  enableDebugLogging: true,
  deltaSignificanceThreshold: 10 // percentage change for significance
};

// Helper functions for Google Sheets operations
function generateTimestamp() {
  return new Date().toISOString();
}

function createMetricRecord(companyName, documentSource, metric, analysisId) {
  return {
    timestamp: generateTimestamp(),
    company_name: companyName,
    document_source: documentSource || 'unknown',
    analysis_id: analysisId,
    metric_name: metric.type,
    metric_value: metric.value,
    currency: metric.currency || 'USD',
    unit: getUnit(metric.type),
    period: detectPeriod(metric.context),
    extracted_by: 'ai-regex-extraction',
    confidence: metric.confidence,
    raw_match: metric.rawMatch,
    context: metric.context,
    position: metric.position
  };
}

function getUnit(metricType) {
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

function detectPeriod(context) {
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

// Calculate delta intelligence (historical comparison)
function calculateDeltas(currentMetrics, historicalData) {
  const deltas = {};
  
  Object.keys(currentMetrics).forEach(metricType => {
    const currentValues = currentMetrics[metricType];
    const historical = historicalData[metricType] || [];
    
    if (currentValues && currentValues.length > 0 && historical.length > 0) {
      const currentValue = currentValues[0].value; // Highest confidence
      const lastValue = historical[0].value; // Most recent historical
      
      const delta = currentValue - lastValue;
      const deltaPercent = lastValue > 0 ? ((delta / lastValue) * 100) : 0;
      
      deltas[metricType] = {
        current: currentValue,
        previous: lastValue,
        delta: delta,
        delta_percent: deltaPercent,
        trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
        significance: Math.abs(deltaPercent) > 10 ? 'high' : 
                     Math.abs(deltaPercent) > 5 ? 'medium' : 'low'
      };
    }
  });
  
  return deltas;
}

// Helper function to detect time period from context
function detectPeriod(context) {
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

// Process each input item
for (const item of items) {
  // Handle both regex-extracted and LLM-validated metrics
  const extractedMetrics = item.json.extracted_metrics || {};
  const llmValidatedMetrics = item.json.llm_validated_metrics || extractedMetrics;
  const validationStatus = item.json.llm_validation_status || 'not_validated';
  
  const metricsToProcess = validationStatus === 'validated' ? llmValidatedMetrics : extractedMetrics;
  const metricsFound = Object.values(metricsToProcess).reduce((sum, metrics) => sum + metrics.length, 0);
  
  const companyName = item.json.company_name || 'Unknown';
  const documentSource = item.json.document_source || 'unknown';
  const analysisId = item.json.analysis_id || `analysis-${Date.now()}`;
  
  if (CONFIG.enableDebugLogging) {
    console.log(`🏭 Processing ${companyName}: ${metricsFound} metrics (${validationStatus})`);
  }
  
  if (metricsFound === 0) {
    results.push({
      json: {
        ...item.json,
        database_records: [],
        delta_intelligence: {},
        database_summary: {
          records_created: 0,
          company_name: companyName,
          analysis_id: analysisId,
          timestamp: generateTimestamp(),
          validation_status: validationStatus
        },
        ready_for_sheets_update: true
      }
    });
    continue;
  }
  
  // Convert metrics to database records
  const databaseRecords = [];
  
  Object.entries(metricsToProcess).forEach(([metricType, metrics]) => {
    metrics.forEach(metric => {
      const record = createMetricRecord(companyName, documentSource, metric, analysisId);
      // Add validation metadata
      record.validation_status = validationStatus;
      record.llm_enhanced = validationStatus === 'validated';
      databaseRecords.push(record);
    });
  });
  
  // Simulate historical data lookup (in real implementation, this would query Google Sheets)
  // For MVP, we'll create placeholder historical context
  const historicalData = {
    revenue: [{value: 50000000, timestamp: '2024-06-01'}], // $50M last quarter
    valuation: [{value: 500000000, timestamp: '2024-06-01'}], // $500M last valuation
    growth_rate: [{value: 15.5, timestamp: '2024-06-01'}] // 15.5% last growth
  };
  
  // Calculate delta intelligence using processed metrics
  const deltaIntelligence = CONFIG.enableDeltaIntelligence ? 
    calculateDeltas(metricsToProcess, historicalData) : {};
  
  // Prepare sheets data structure (organized by metric type)
  const sheetsData = {
    revenue_history: databaseRecords.filter(r => r.metric_name === 'revenue'),
    valuation_history: databaseRecords.filter(r => r.metric_name === 'valuation'),
    kpi_snapshots: databaseRecords.filter(r => 
      ['arr', 'growth_rate', 'customer_count', 'burn_rate'].includes(r.metric_name)
    ),
    company_metadata: [{
      company_name: companyName,
      analysis_id: analysisId,
      document_source: documentSource,
      last_updated: generateTimestamp(),
      total_metrics: metricsFound
    }]
  };
  
  results.push({
    json: {
      ...item.json,
      database_records: databaseRecords,
      sheets_data: sheetsData,
      delta_intelligence: deltaIntelligence,
      database_summary: {
        records_created: databaseRecords.length,
        company_name: companyName,
        analysis_id: analysisId,
        timestamp: generateTimestamp(),
        metrics_by_type: Object.fromEntries(
          Object.entries(extractedMetrics).map(([type, metrics]) => [type, metrics.length])
        )
      },
      // Enhanced context for AI agents
      historical_context: {
        has_previous_data: Object.keys(deltaIntelligence).length > 0,
        significant_changes: Object.values(deltaIntelligence)
          .filter(d => d.significance === 'high'),
        trend_summary: Object.fromEntries(
          Object.entries(deltaIntelligence).map(([type, data]) => [type, data.trend])
        ),
        validation_metadata: {
          status: validationStatus,
          llm_enhanced: validationStatus === 'validated',
          enhancement_type: item.json.llm_enhancement_type || 'none'
        }
      },
      ready_for_sheets_update: true,
      mvp_processing_complete: true
    }
  });
}

return results;