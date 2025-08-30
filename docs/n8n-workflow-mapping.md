# n8n Workflow Implementation Guide
## JavaScript Services to n8n Nodes Mapping

This document shows how existing JavaScript services from Phase 1 map to the MVP n8n workflow, preserving the proven logic while simplifying deployment.

## 🏗️ Architecture Overview

### Phase 1 JavaScript Foundation → MVP n8n Workflow

```
Existing JavaScript Services (src/services/)     →     5-Node n8n Workflow
┌─────────────────────────────────────────┐     →     ┌─────────────────────────┐
│ • MetricExtractor.js (89.6% accuracy)   │     →     │ Node 3: Code Node       │
│ • StateDatabase.js (Google Sheets ops)  │     →     │ Node 5: Google Sheets   │
│ • CircuitBreaker.js (error handling)    │     →     │ n8n error handling      │
│ • DatabaseSchema.js (schemas)           │     →     │ Google Sheets setup     │
│ • CompanySpreadsheetProvisioner.js      │     →     │ Google Sheets setup     │
│ • GoogleSheetsAuth.js (OAuth)           │     →     │ n8n Google auth         │
└─────────────────────────────────────────┘     →     └─────────────────────────┘
```

## 📋 Detailed Node Mapping

### Node 1: Google Drive Trigger
**Replaces**: Manual document upload detection
**Configuration**:
```yaml
Node Type: Google Drive Trigger (Watch Files)
Watch For: Files added, Files modified
Folder: /Private Companies/{company}/
Output: Document metadata, file content, company ID
```

**Key Features**:
- Real-time push notifications (no polling delays)
- Company-specific folder monitoring
- Automatic file type detection
- Metadata preservation for document lineage

### Node 2: Extract From File (n8n Native)
**Replaces**: Custom document parsing services
**Configuration**:
```yaml
Node Type: Extract From File
Supported: PDF, Excel (.xlsx), Word (.docx), PowerPoint (.pptx)
Output Mode: Text extraction with metadata
Binary Processing: Automatic format detection
```

**Advantages over Custom Implementation**:
- Native n8n optimization for large files
- Built-in format support (no external libraries)
- Automatic error handling for corrupted files
- Memory-efficient processing

### Node 3: Metric Extraction (Code Node)
**Maps from**: `src/services/MetricExtractor.js`
**Preserves**: Existing regex patterns with 89.6% accuracy

**Code Translation**:
```javascript
// Original MetricExtractor.js patterns → n8n Code Node
const patterns = {
  revenue: [
    /revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    /total\s+revenue.*?[\$€£¥]?([\d,]+(?:\.\d{1,2})?)\s*(?:million|m|billion|b|thousand|k)?/gi,
    // ... all existing patterns
  ],
  valuation: [...],
  arr: [...],
  growth_rate: [...],
  customer_count: [...],
  burn_rate: [...]
};

// Existing multipliers and confidence scoring logic
const multipliers = { 'k': 1000, 'm': 1000000, 'b': 1000000000 };
// ... complete extraction logic from MetricExtractor.js
```

**Implementation Notes**:
- Copy entire `extractMetrics()` method
- Preserve confidence scoring algorithm  
- Keep deduplication and context extraction
- Maintain currency detection logic

### Node 4: LLM Validation (OpenAI Node)
**New Addition**: Derek's suggestion for enhanced accuracy
**Purpose**: Validate and enhance regex extraction results

**Configuration**:
```yaml
Node Type: OpenAI (GPT-4)
Model: gpt-4o-mini (cost optimization)
Temperature: 0.1 (consistent results)
Max Tokens: 1000 per request
```

**Prompt Template**:
```
You are a financial data extraction validator. Review these extracted metrics:

EXTRACTED METRICS:
{regex_results}

DOCUMENT TEXT:
{document_excerpt}

TASKS:
1. Verify each extracted metric is accurate
2. Identify any missed financial metrics
3. Provide confidence scores (0-100%)
4. Flag any extraction errors

Return JSON format:
{
  "validated_metrics": {...},
  "additional_metrics": {...},
  "confidence_scores": {...},
  "extraction_notes": "..."
}
```

**Expected Accuracy Improvement**: 10-15% over regex-only extraction

### Node 5: State Database Operations (Google Sheets)
**Maps from**: `src/services/StateDatabase.js` and `src/models/DatabaseSchema.js`

**Operations Mapping**:
```javascript
// StateDatabase.js operations → Google Sheets node actions
insertMetrics()      → Append rows to REVENUE_HISTORY sheet
insertKPISnapshot()  → Append rows to KPI_SNAPSHOTS sheet  
updateMetadata()     → Update COMPANY_METADATA sheet
getHistoricalData()  → Read range from time-series sheets
calculateDeltas()    → Formula-based calculations in sheets
```

**Schema Implementation**:
```yaml
Spreadsheet Structure: (from DatabaseSchema.js)
- REVENUE_HISTORY: timestamp, company_name, metric_value, currency, period
- VALUATION_HISTORY: timestamp, company_name, valuation, currency, source
- KPI_SNAPSHOTS: timestamp, company_name, kpi_type, kpi_value, unit
- DOCUMENT_LINEAGE: timestamp, document_id, company_name, document_type
- DELTA_INTELLIGENCE: timestamp, company_name, metric_type, old_value, new_value, delta_percent
- COMPANY_METADATA: company_name, last_updated, document_count, analysis_version
```

**Delta Calculation Logic**:
```javascript
// Simplified delta calculation in Google Sheets node
function calculateDelta(newValue, oldValue) {
  const absoluteChange = newValue - oldValue;
  const percentChange = ((newValue - oldValue) / oldValue) * 100;
  const significance = Math.abs(percentChange) > 10 || Math.abs(absoluteChange) > 1000000;
  
  return {
    absolute_change: absoluteChange,
    percent_change: percentChange,
    is_significant: significance,
    alert_priority: significance ? 'high' : 'medium'
  };
}
```

## 🔧 Implementation Translation Guide

### 1. MetricExtractor.js → Node 3 Code Translation

**Key Functions to Copy**:
- `extractMetrics(text, documentSource)` - Main extraction logic
- `extractMetricType(text, metricType, documentSource)` - Pattern matching
- `processMetricMatch(matchData)` - Result processing
- `parseNumericValue(rawValue, fullMatch)` - Number parsing with multipliers
- `calculateConfidence(params)` - Confidence scoring
- `deduplicateMetrics(metrics)` - Remove duplicates

**Configuration Variables**:
```javascript
// Copy from MetricExtractor.js constructor
this.patterns = { ... };        // All regex patterns
this.multipliers = { ... };     // k, m, b multipliers  
this.currencies = [...];        // Supported currencies
```

### 2. StateDatabase.js → Node 5 Google Sheets Configuration

**Authentication Setup**:
- Use n8n's built-in Google Sheets OAuth
- No need for custom GoogleSheetsAuth.js implementation
- Automatic token refresh handling

**Operations Translation**:
```javascript
// StateDatabase methods → Google Sheets node operations
async insertMetrics(metrics) {
  // → Google Sheets: Append rows to REVENUE_HISTORY
  return await sheets.spreadsheets.values.append({
    spreadsheetId: companySpreadsheetId,
    range: 'REVENUE_HISTORY!A:Z',
    valueInputOption: 'USER_ENTERED',
    values: [formatMetricRow(metrics)]
  });
}
```

### 3. Error Handling Translation

**CircuitBreaker.js → n8n Error Handling**:
```yaml
# n8n Error Handling Configuration
Continue on Fail: true
Retry on Fail: true  
Retry Times: 3
Wait Between Retries: 1000ms (exponential backoff)
Error Output: Include error details for debugging
```

**Monitoring Integration**:
- n8n execution logs replace MonitoringService.js
- Workflow status webhooks for external monitoring
- Built-in performance metrics and error tracking

## 📊 Performance Comparison

### Metrics Extraction Accuracy
- **Phase 1 JavaScript**: 89.6% accuracy achieved
- **MVP n8n Target**: >85% accuracy (regex patterns preserved)
- **MVP + LLM Target**: >95% accuracy (with OpenAI validation)

### Processing Speed
- **Phase 1 JavaScript**: Custom optimizations, variable performance
- **MVP n8n**: Platform-optimized, consistent ~2-5 minutes per document
- **MVP + n8n Cloud**: Scalable processing, parallel document handling

### Development/Maintenance
- **Phase 1 JavaScript**: Full control, complex deployment
- **MVP n8n**: Visual workflow, rapid deployment, managed infrastructure
- **Future JavaScript**: Enhanced with MVP learnings, production-scale features

## 🚀 Deployment Strategy

### Step 1: n8n Setup (Task 28)
1. Create n8n Cloud account
2. Configure Google Drive API credentials
3. Set up Google Sheets API access
4. Configure OpenAI API key
5. Create base workflow template

### Step 2: Node Implementation (Tasks 29-32)
1. **Task 29**: Configure Nodes 1-2 (Trigger + Extract)
2. **Task 30**: Implement Node 3 (Metric Extraction Code)
3. **Task 31**: Configure Node 4 (OpenAI Validation)
4. **Task 32**: Set up Node 5 (Google Sheets Operations)

### Step 3: Testing & Optimization (Task 33)
1. End-to-end testing with sample PE documents
2. Accuracy validation against Phase 1 benchmarks
3. Performance optimization and error handling
4. User acceptance testing with PE team

## 💡 Key Benefits of This Approach

### 1. **Preserves Phase 1 Investment**
- All proven regex patterns (89.6% accuracy) are reused
- Database schemas and operational logic maintained
- Circuit breaker and monitoring concepts adapted

### 2. **Rapid MVP Deployment**
- 2-week timeline vs. months for full JavaScript
- Visual workflow development and debugging
- Managed infrastructure (no DevOps complexity)

### 3. **Enhanced Accuracy**
- LLM validation adds 10-15% accuracy improvement
- Derek's suggestion integrated seamlessly
- Best of both worlds: regex speed + LLM intelligence

### 4. **Clear Migration Path**
- n8n workflow validates business logic
- User feedback guides full JavaScript development  
- Existing `src/services/` code becomes production foundation
- No rework - translation preserves all essential logic

This mapping ensures that your valuable Phase 1 work is leveraged immediately while creating a clear path to the full JavaScript architecture when you're ready to scale.