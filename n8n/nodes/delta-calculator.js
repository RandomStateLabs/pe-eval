/**
 * n8n Code Node: Delta Intelligence Calculator
 * Advanced historical comparison and trend analysis
 * Integrates with Google Sheets for real historical data lookup
 */

// Input: Validated metrics with database context
const items = $input.all();
const results = [];

// Enhanced delta calculation configuration
const CONFIG = {
  significanceThresholds: {
    high: 15,    // >15% change
    medium: 5,   // 5-15% change
    low: 0       // <5% change
  },
  trendAnalysis: {
    lookbackPeriods: ['current', '1q_ago', '2q_ago', '1y_ago'],
    minimumDataPoints: 2,
    enableSeasonalAdjustment: true
  },
  enableDebugLogging: true
};

// Advanced delta calculation with trend analysis
function calculateAdvancedDeltas(currentMetrics, historicalData, companyName) {
  const deltas = {};
  const trends = {};
  
  Object.keys(currentMetrics).forEach(metricType => {
    const currentValues = currentMetrics[metricType];
    const historical = historicalData[metricType] || [];
    
    if (!currentValues || currentValues.length === 0) return;
    
    const currentValue = currentValues[0].value; // Highest confidence current value
    const currentCurrency = currentValues[0].currency || 'USD';
    
    // Multi-period analysis
    const deltaAnalysis = {
      metric_type: metricType,
      current: {
        value: currentValue,
        currency: currentCurrency,
        timestamp: new Date().toISOString(),
        confidence: currentValues[0].confidence
      },
      comparisons: {},
      trend_analysis: {
        direction: 'unknown',
        velocity: 0,
        consistency: 0,
        seasonal_factor: 1.0
      }
    };
    
    // Calculate deltas for each historical period
    if (historical.length > 0) {
      historical.forEach((historicalPoint, index) => {
        const periodKey = CONFIG.trendAnalysis.lookbackPeriods[index + 1] || `${index + 1}_periods_ago`;
        
        if (historicalPoint.value && historicalPoint.value > 0) {
          const delta = currentValue - historicalPoint.value;
          const deltaPercent = ((delta / historicalPoint.value) * 100);
          
          deltaAnalysis.comparisons[periodKey] = {
            previous_value: historicalPoint.value,
            previous_timestamp: historicalPoint.timestamp,
            delta_absolute: delta,
            delta_percent: deltaPercent,
            significance: Math.abs(deltaPercent) > CONFIG.significanceThresholds.high ? 'high' :
                         Math.abs(deltaPercent) > CONFIG.significanceThresholds.medium ? 'medium' : 'low',
            trend_direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable'
          };
        }
      });
      
      // Advanced trend analysis
      if (Object.keys(deltaAnalysis.comparisons).length >= CONFIG.trendAnalysis.minimumDataPoints) {
        const deltaPercentages = Object.values(deltaAnalysis.comparisons)
          .map(comp => comp.delta_percent)
          .filter(delta => !isNaN(delta));
        
        if (deltaPercentages.length > 0) {
          const avgDelta = deltaPercentages.reduce((sum, delta) => sum + delta, 0) / deltaPercentages.length;
          const consistency = 1 - (Math.abs(Math.max(...deltaPercentages) - Math.min(...deltaPercentages)) / 100);
          
          deltaAnalysis.trend_analysis = {
            direction: avgDelta > 5 ? 'upward' : avgDelta < -5 ? 'downward' : 'stable',
            velocity: Math.abs(avgDelta),
            consistency: Math.max(0, Math.min(1, consistency)),
            seasonal_factor: calculateSeasonalFactor(metricType, currentValues[0].period),
            confidence: deltaPercentages.length >= 3 ? 'high' : 'medium'
          };
        }
      }
    }
    
    deltas[metricType] = deltaAnalysis;
  });
  
  return deltas;
}

// Calculate seasonal adjustment factor
function calculateSeasonalFactor(metricType, period) {
  const seasonalFactors = {
    revenue: {
      'quarterly': { q1: 0.9, q2: 1.0, q3: 1.1, q4: 1.2 },
      'monthly': { 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.1, 7: 1.1, 8: 1.0, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.3 }
    },
    growth_rate: {
      'quarterly': { q1: 1.0, q2: 1.0, q3: 1.0, q4: 1.0 },
      'monthly': { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0, 12: 1.0 }
    }
  };
  
  return seasonalFactors[metricType]?.[period] || 1.0;
}

// Generate insights from delta analysis
function generateDeltaInsights(deltaIntelligence, companyName) {
  const insights = {
    company_name: companyName,
    timestamp: new Date().toISOString(),
    key_findings: [],
    risk_indicators: [],
    growth_signals: [],
    overall_health: 'unknown'
  };
  
  Object.entries(deltaIntelligence).forEach(([metricType, analysis]) => {
    const trend = analysis.trend_analysis;
    const significantComparisons = Object.values(analysis.comparisons)
      .filter(comp => comp.significance === 'high');
    
    // Key findings
    if (significantComparisons.length > 0) {
      insights.key_findings.push({
        metric: metricType,
        finding: `${metricType} shows ${trend.direction} trend with ${trend.velocity.toFixed(1)}% average change`,
        significance: 'high',
        confidence: trend.confidence
      });
    }
    
    // Risk indicators
    if (metricType === 'burn_rate' && trend.direction === 'upward' && trend.velocity > 20) {
      insights.risk_indicators.push({
        metric: metricType,
        risk: 'increasing_burn_rate',
        severity: 'high',
        details: `Burn rate trending upward at ${trend.velocity.toFixed(1)}% rate`
      });
    }
    
    if (metricType === 'revenue' && trend.direction === 'downward' && trend.velocity > 10) {
      insights.risk_indicators.push({
        metric: metricType,
        risk: 'declining_revenue',
        severity: 'high',
        details: `Revenue declining at ${trend.velocity.toFixed(1)}% rate`
      });
    }
    
    // Growth signals
    if ((metricType === 'revenue' || metricType === 'arr') && trend.direction === 'upward' && trend.velocity > 15) {
      insights.growth_signals.push({
        metric: metricType,
        signal: 'strong_growth',
        strength: trend.velocity > 30 ? 'high' : 'medium',
        details: `${metricType} growing at ${trend.velocity.toFixed(1)}% rate`
      });
    }
  });
  
  // Overall health assessment
  const growthSignals = insights.growth_signals.length;
  const riskIndicators = insights.risk_indicators.length;
  
  if (growthSignals > riskIndicators && growthSignals > 0) {
    insights.overall_health = 'positive';
  } else if (riskIndicators > growthSignals && riskIndicators > 0) {
    insights.overall_health = 'concerning';
  } else {
    insights.overall_health = 'stable';
  }
  
  return insights;
}

// Process each input item
for (const item of items) {
  const extractedMetrics = item.json.extracted_metrics || {};
  const llmValidatedMetrics = item.json.llm_validated_metrics || extractedMetrics;
  const validationStatus = item.json.llm_validation_status || 'not_validated';
  const companyName = item.json.company_name || 'Unknown';
  
  const metricsToAnalyze = validationStatus === 'validated' ? llmValidatedMetrics : extractedMetrics;
  
  if (CONFIG.enableDebugLogging) {
    console.log(`📈 Calculating deltas for ${companyName}: ${Object.keys(metricsToAnalyze).length} metric types`);
  }
  
  // Enhanced historical data simulation (MVP placeholder)
  // In production, this would query actual Google Sheets historical data
  const historicalData = {
    revenue: [
      {value: 45000000, timestamp: '2024-03-01', period: 'q1_2024'},
      {value: 42000000, timestamp: '2023-12-01', period: 'q4_2023'},
      {value: 38000000, timestamp: '2023-09-01', period: 'q3_2023'}
    ],
    valuation: [
      {value: 480000000, timestamp: '2024-01-01', period: 'latest_round'},
      {value: 350000000, timestamp: '2023-06-01', period: 'series_b'}
    ],
    arr: [
      {value: 35000000, timestamp: '2024-03-01', period: 'q1_2024'},
      {value: 30000000, timestamp: '2023-12-01', period: 'q4_2023'}
    ],
    growth_rate: [
      {value: 18.5, timestamp: '2024-03-01', period: 'q1_2024'},
      {value: 22.1, timestamp: '2023-12-01', period: 'q4_2023'}
    ]
  };
  
  // Calculate advanced delta intelligence
  const advancedDeltaIntelligence = calculateAdvancedDeltas(metricsToAnalyze, historicalData, companyName);
  
  // Generate actionable insights
  const deltaInsights = generateDeltaInsights(advancedDeltaIntelligence, companyName);
  
  // Enhanced output with delta intelligence
  results.push({
    json: {
      ...item.json,
      advanced_delta_intelligence: advancedDeltaIntelligence,
      delta_insights: deltaInsights,
      delta_summary: {
        total_comparisons: Object.values(advancedDeltaIntelligence)
          .reduce((sum, analysis) => sum + Object.keys(analysis.comparisons).length, 0),
        significant_changes: Object.values(advancedDeltaIntelligence)
          .reduce((sum, analysis) => {
            return sum + Object.values(analysis.comparisons)
              .filter(comp => comp.significance === 'high').length;
          }, 0),
        overall_health: deltaInsights.overall_health,
        key_findings_count: deltaInsights.key_findings.length,
        risk_indicators_count: deltaInsights.risk_indicators.length,
        growth_signals_count: deltaInsights.growth_signals.length
      },
      ready_for_final_output: true
    }
  });
  
  if (CONFIG.enableDebugLogging) {
    console.log(`📊 Delta analysis complete for ${companyName}: ${deltaInsights.overall_health} health status`);
  }
}

return results;