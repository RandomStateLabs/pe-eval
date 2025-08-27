/**
 * Database Schema Definitions for Google Sheets Time-Series State Database
 * Defines standardized schemas for company-specific spreadsheets
 */

export const DATABASE_SCHEMAS = {
  // Revenue History Sheet Schema
  REVENUE_HISTORY: {
    sheetName: 'revenue_history',
    headers: [
      'timestamp',           // ISO 8601 timestamp
      'document_source',     // Source document path/filename
      'revenue_amount',      // Numerical revenue value
      'currency',           // Currency code (USD, EUR, GBP)
      'period_type',        // quarterly, annual, monthly
      'quarter',            // Q1, Q2, Q3, Q4 (if applicable)
      'year',               // Fiscal year
      'extracted_by',       // System/manual indicator
      'confidence',         // Confidence score 0-1
      'raw_match',          // Original text that matched
      'context',            // Surrounding text context
      'delta_from_previous', // Change from previous period
      'delta_percentage',   // Percentage change
      'significance_score', // 0-10 significance rating
      'alert_priority'      // low, medium, high, critical
    ],
    dataValidation: {
      timestamp: 'datetime',
      revenue_amount: 'number',
      confidence: 'number_range:0:1',
      delta_percentage: 'number',
      significance_score: 'number_range:0:10'
    }
  },

  // Valuation History Sheet Schema
  VALUATION_HISTORY: {
    sheetName: 'valuation_history',
    headers: [
      'timestamp',
      'document_source',
      'valuation_amount',
      'currency',
      'valuation_type',     // enterprise_value, equity_value, market_cap
      'multiple_type',      // revenue_multiple, ebitda_multiple, etc.
      'multiple_value',     // Actual multiple (e.g., 5.2x)
      'period',            // Valuation date/period
      'extracted_by',
      'confidence',
      'raw_match',
      'context',
      'delta_from_previous',
      'delta_percentage',
      'significance_score',
      'alert_priority'
    ],
    dataValidation: {
      timestamp: 'datetime',
      valuation_amount: 'number',
      multiple_value: 'number',
      confidence: 'number_range:0:1',
      significance_score: 'number_range:0:10'
    }
  },

  // KPI Snapshots Sheet Schema
  KPI_SNAPSHOTS: {
    sheetName: 'kpi_snapshots',
    headers: [
      'timestamp',
      'document_source',
      'kpi_name',           // arr, customer_count, churn_rate, etc.
      'kpi_value',
      'unit',               // count, percent, dollars, etc.
      'period',
      'period_start',
      'period_end',
      'extracted_by',
      'confidence',
      'raw_match',
      'context',
      'delta_from_previous',
      'delta_percentage',
      'significance_score',
      'alert_priority'
    ],
    dataValidation: {
      timestamp: 'datetime',
      kpi_value: 'number',
      confidence: 'number_range:0:1',
      significance_score: 'number_range:0:10'
    }
  },

  // Document Lineage Sheet Schema
  DOCUMENT_LINEAGE: {
    sheetName: 'document_lineage',
    headers: [
      'timestamp',
      'document_name',
      'document_id',        // Google Drive file ID
      'document_type',      // pdf, xlsx, docx, pptx
      'document_size',      // File size in bytes
      'metrics_extracted', // JSON array of extracted metrics
      'processing_status', // completed, failed, partial
      'processing_duration', // Time taken to process
      'error_log',         // Error messages if any
      'batch_id',          // Batch processing identifier
      'processed_by',      // System identifier
      'extraction_summary' // Summary of extraction results
    ],
    dataValidation: {
      timestamp: 'datetime',
      document_size: 'number',
      processing_duration: 'number'
    }
  },

  // Delta Intelligence Log Schema
  DELTA_INTELLIGENCE: {
    sheetName: 'delta_intelligence',
    headers: [
      'timestamp',
      'company_name',
      'metric_name',
      'alert_priority',     // critical, high, medium, low
      'alert_message',
      'current_value',
      'previous_value',
      'delta_absolute',
      'delta_percentage',
      'significance_score',
      'trend_direction',    // increasing, decreasing, stable
      'historical_context', // JSON with historical data
      'recipients_notified',
      'notification_status', // pending, sent, failed
      'action_required',    // immediate, review, monitor
      'follow_up_date',
      'resolution_status'   // open, investigating, resolved
    ],
    dataValidation: {
      timestamp: 'datetime',
      current_value: 'number',
      previous_value: 'number',
      delta_absolute: 'number',
      delta_percentage: 'number',
      significance_score: 'number_range:0:10'
    }
  },

  // Company Metadata Schema
  COMPANY_METADATA: {
    sheetName: 'company_metadata',
    headers: [
      'company_name',
      'ticker_symbol',
      'industry',
      'sector',
      'analysis_type',      // growth, buyout, distressed
      'priority_level',     // urgent, high, normal, low
      'first_analysis_date',
      'last_updated',
      'total_documents',
      'total_metrics',
      'primary_contact',
      'deal_stage',         // sourcing, diligence, closed
      'spreadsheet_id',     // This spreadsheet's ID
      'folder_id',          // Google Drive folder ID
      'template_version',   // Schema version
      'created_by',
      'status'             // active, archived, deleted
    ],
    dataValidation: {
      first_analysis_date: 'datetime',
      last_updated: 'datetime',
      total_documents: 'number',
      total_metrics: 'number'
    }
  }
};

/**
 * Get all sheet schemas for a company spreadsheet
 * @returns {Array} Array of all sheet schemas
 */
export function getAllSchemas() {
  return Object.values(DATABASE_SCHEMAS);
}

/**
 * Get schema by name
 * @param {string} schemaName - Name of the schema
 * @returns {Object} Schema definition
 */
export function getSchema(schemaName) {
  return DATABASE_SCHEMAS[schemaName.toUpperCase()];
}

/**
 * Generate Google Sheets column format from schema
 * @param {Object} schema - Schema definition
 * @returns {Object} Google Sheets format configuration
 */
export function generateSheetsFormat(schema) {
  const headerValues = [schema.headers];
  
  // Create data validation rules
  const dataValidationRules = [];
  
  schema.headers.forEach((header, index) => {
    const validation = schema.dataValidation[header];
    if (validation) {
      let rule = {
        range: {
          sheetId: 0, // Will be set when creating sheet
          startRowIndex: 1, // Skip header row
          endRowIndex: 1000, // Reasonable default
          startColumnIndex: index,
          endColumnIndex: index + 1
        }
      };

      switch (validation) {
        case 'datetime':
          rule.condition = {
            type: 'DATE_IS_VALID'
          };
          break;
        case 'number':
          rule.condition = {
            type: 'NUMBER_GREATER_THAN_EQ',
            values: [{ userEnteredValue: '0' }]
          };
          break;
        default:
          if (validation.startsWith('number_range:')) {
            const [min, max] = validation.split(':').slice(1);
            rule.condition = {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: min },
                { userEnteredValue: max }
              ]
            };
          }
      }

      if (rule.condition) {
        dataValidationRules.push(rule);
      }
    }
  });

  return {
    headerValues,
    dataValidationRules,
    formatting: {
      headerFormat: {
        backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
        textFormat: { bold: true },
        horizontalAlignment: 'CENTER'
      },
      dataFormat: {
        numberFormat: {
          type: 'NUMBER',
          pattern: '#,##0.00'
        }
      }
    }
  };
}

/**
 * Validate data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Schema to validate against
 * @returns {Object} Validation result with errors
 */
export function validateData(data, schema) {
  const errors = [];
  const warnings = [];

  // Check required headers
  schema.headers.forEach(header => {
    if (!(header in data)) {
      errors.push(`Missing required field: ${header}`);
    }
  });

  // Validate data types and constraints
  Object.keys(data).forEach(field => {
    const validation = schema.dataValidation[field];
    const value = data[field];

    if (validation && value !== null && value !== undefined && value !== '') {
      switch (validation) {
        case 'datetime':
          if (isNaN(Date.parse(value))) {
            errors.push(`Invalid datetime format for ${field}: ${value}`);
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Invalid number format for ${field}: ${value}`);
          }
          break;
        default:
          if (validation.startsWith('number_range:')) {
            const [min, max] = validation.split(':').slice(1).map(Number);
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < min || numValue > max) {
              errors.push(`Value ${value} for ${field} must be between ${min} and ${max}`);
            }
          }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export default DATABASE_SCHEMAS;