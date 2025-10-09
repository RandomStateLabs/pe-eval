# PE-EVAL MVP: Complete n8n Workflow Technical Documentation

## Workflow Overview
**Name**: My workflow
**ID**: wBp6wqY0uAacMcjI
**Status**: ACTIVE (currently running)
**Version**: 7f5edcf9-efdf-4280-acab-e8b36ef7fb84

### Purpose
Automated financial document processing pipeline that monitors Google Drive for new portfolio company documents, extracts ALL financial metrics dynamically using AI, and stores structured data in Google Sheets using Entity-Attribute-Value (EAV) format for flexible analysis and tracking.

**Architecture Reference**: See [[SYSTEM_ARCHITECTURE|System Architecture]] for complete planned system design.

**Implementation Status**: This document represents the **CURRENT WORKING IMPLEMENTATION** of the MVP workflow.

---

## Node Architecture & Data Flow

```mermaid
graph LR
    A[Google Drive Trigger<br/>Node 1] -->|File metadata| B[Download File<br/>Node 2]
    B -->|Binary data| C[Extract Text<br/>Node 3]
    C -->|Plain text| D[AI Validation<br/>Node 4]
    D -->|JSON metrics| E[Prepare Sheet Data<br/>Node 5]
    E -->|EAV formatted rows| F[Update Google Sheet<br/>Node 6]

    style A fill:#e1f5fe
    style B fill:#e8f5e9
    style C fill:#fff3e0
    style D fill:#fce4ec
    style E fill:#f3e5f5
    style F fill:#e8f5e9
```

---

## Detailed Node Specifications

### Node 1: Google Drive Trigger
**Type**: `n8n-nodes-base.googleDriveTrigger` (v1)
**Node ID**: 6e80d170-410b-4fed-a2b9-e02475d57c4a
**Position**: [64, 0]
**Purpose**: Monitors specified Google Drive folder for new document uploads

**Architecture Mapping**: Implements [[SYSTEM_ARCHITECTURE#trigger-google-drive-folder-monitor-🟢-implemented|TRIGGER: Google Drive Folder Monitor]]

#### Configuration:
```json
{
  "pollTimes": {
    "item": [
      {
        "mode": "everyMinute"  // Polls every 60 seconds
      }
    ]
  },
  "triggerOn": "specificFolder",
  "folderToWatch": {
    "__rl": true,
    "value": "https://drive.google.com/drive/u/3/folders/1hLHsNf61aREVHin_8zek3AdonpWHwKN5",
    "mode": "url"
  },
  "event": "fileCreated"  // Triggers only on new files
}
```

#### Credentials:
- **Type**: Google Drive OAuth2
- **ID**: EJIwyqqrzOtJ0lL9
- **Name**: "Google Drive account"

#### Output Data Structure:
```javascript
{
  "id": "file_id_string",
  "name": "document_name.pdf",
  "mimeType": "application/pdf",
  "createdTime": "2024-01-15T10:30:00Z",
  "modifiedTime": "2024-01-15T10:30:00Z",
  "parents": ["folder_id"],
  "size": "2456789"
}
```

---

### Node 2: Download File from Drive
**Type**: `n8n-nodes-base.googleDrive` (v3)
**Node ID**: 47eb0ac9-17f1-41d3-815e-5a86dd1de70e
**Position**: [272, 0]
**Purpose**: Downloads binary content of the triggered file

**Architecture Mapping**: Part of [[SYSTEM_ARCHITECTURE#step-1-document-processing-🟡-partial|STEP 1: Document Processing]]

#### Configuration:
```json
{
  "operation": "download",
  "fileId": {
    "__rl": true,
    "value": "={{ $json.id }}",  // Dynamic from trigger
    "mode": "id"
  },
  "options": {
    "googleFileConversion": {
      "conversion": {
        "docsToFormat": "text/plain",           // Google Docs → Plain text
        "drawingsToFormat": "application/pdf",  // Drawings → PDF
        "slidesToFormat": "application/pdf"     // Slides → PDF
      }
    }
  }
}
```

#### Input Requirements:
- File ID from Google Drive Trigger node

#### Output Data Structure:
```javascript
{
  "binary": {
    "data": {
      "mimeType": "application/pdf",
      "fileSize": 2456789,
      "fileName": "Q3_2024_Financials.pdf",
      "data": "base64_encoded_binary_content..."
    }
  }
}
```

---

### Node 3: Extract Text from File
**Type**: `n8n-nodes-base.extractFromFile` (v1)
**Node ID**: c95a2d15-05a8-42d8-9680-4932f1314814
**Position**: [448, 0]
**Purpose**: Extracts text content from various document formats

**Architecture Mapping**: Part of [[SYSTEM_ARCHITECTURE#step-1-document-processing-🟡-partial|STEP 1: Document Processing]]

#### Configuration:
```json
{
  "operation": "text",
  "options": {}  // Default extraction settings
}
```

#### Supported File Types:
- PDF (with OCR capability for scanned documents)
- Microsoft Excel (.xlsx, .xls)
- Microsoft Word (.docx, .doc)
- Microsoft PowerPoint (.pptx, .ppt)
- Plain text files

#### Output Data Structure:
```javascript
{
  "data": "Extracted text content from document...\nRevenue: $1,234,567\nEBITDA: $234,567...",
  "mimeType": "text/plain",
  "fileSize": 125000,
  "fileName": "Q3_2024_Financials.pdf"
}
```

---

### Node 4: AI Validation (OpenAI)
**Type**: `@n8n/n8n-nodes-langchain.openAi` (v1.8)
**Node ID**: 5fe23e74-8d3c-43b3-ba5d-bbbe64a488e9
**Position**: [624, 0]
**Purpose**: AI-powered DYNAMIC extraction of ALL financial metrics using GPT-4

**Architecture Mapping**: Implements [[SYSTEM_ARCHITECTURE#step-2-ai-metrics-extraction-🟡-partial|STEP 2: AI Metrics Extraction]]

#### Configuration:
```json
{
  "modelId": {
    "__rl": true,
    "value": "gpt-4o",  // Using GPT-4 Optimized
    "mode": "list"
  },
  "jsonOutput": true,   // Forces structured JSON response
  "options": {
    "maxTokens": 4000,
    "temperature": 0.2   // Low temperature for consistency
  }
}
```

#### Credentials:
- **Type**: OpenAI API
- **ID**: 7deU81XNhPjacQHS
- **Name**: "OpenAi account"

#### System Prompt (Full):
```text
={{ $json.data }}
You are a financial document analysis expert. Analyze the following document and extract ALL financial metrics, KPIs, and data points you can find.

IMPORTANT: Do not limit yourself to predefined metrics. Extract any financial data that appears, even if you've never seen that metric type before.

PHASE 1 - DOCUMENT UNDERSTANDING:
First, identify:
- Document type (income statement, balance sheet, investor deck, etc.)
- Company name
- Time period(s) covered
- Currency used

PHASE 2 - COMPREHENSIVE METRIC DISCOVERY:
Scan the entire document and identify ALL potential financial metrics including but not limited to:
- Revenue metrics (total revenue, recurring revenue, revenue per customer, etc.)
- Profitability metrics (EBITDA, gross margin, net income, etc.)
- Growth metrics (YoY growth, quarter growth, CAGR, etc.)
- Customer metrics (customer count, CAC, LTV, churn rate, etc.)
- Operational metrics (burn rate, runway, headcount, etc.)
- Valuation metrics (valuation, price per share, market cap, etc.)
- Ratios and percentages (margins, conversion rates, retention rates, etc.)
- Any other financial data points you discover

PHASE 3 - EXTRACTION WITH CONFIDENCE:
For each metric found, extract:
- Exact name as it appears in the document
- Standardized/normalized name (use common financial terminology)
- Numeric value only (convert text like "10M" to 10000000)
- Unit (USD, EUR, %, ratio, count, etc.)
- Time period this metric represents
- Your confidence level (0.0 to 1.0) based on clarity and context
- Source location (page number, section, table name if applicable)
- Brief context (surrounding text that helped you identify this metric)

PHASE 4 - OUTPUT FORMAT:
Return a JSON object with this exact structure:

{
  "document_info": {
    "document_name": "exact filename or title",
    "company_name": "company name found in document",
    "document_type": "income_statement|balance_sheet|investor_deck|financial_report|other",
    "primary_currency": "USD|EUR|GBP|etc",
    "periods_covered": ["2024-Q1", "2024-Q2"] // or whatever periods you find
  },
  "metrics_discovered": [
    {
      "raw_name": "Total Revenue", // exactly as found in document
      "standardized_name": "revenue", // normalized name using standard terminology
      "category": "revenue|expense|ratio|count|growth_rate|margin|other",
      "value": 10000000, // numeric only, no text
      "unit": "USD", // currency, %, ratio, count, etc.
      "period": "2024-Q1", // specific period this metric represents
      "confidence": 0.95, // your confidence level 0.0-1.0
      "source_location": "page 3, Income Statement table",
      "extraction_context": "Q1 2024 Total Revenue: $10.0M (up 15% YoY)"
    },
    {
      "raw_name": "Customer Acquisition Cost",
      "standardized_name": "customer_acquisition_cost",
      "category": "ratio",
      "value": 125.50,
      "unit": "USD",
      "period": "2024-Q1",
      "confidence": 0.87,
      "source_location": "page 7, Key Metrics section",
      "extraction_context": "Blended CAC decreased to $125.50 in Q1"
    }
  ]
}

CRITICAL INSTRUCTIONS:
1. Extract EVERY financial metric you find, even unusual or company-specific ones
2. Use consistent standardized names (revenue, not "total_revenue" or "sales")
3. Convert all values to pure numbers (no commas, dollar signs, or text)
4. Be conservative with confidence scores - only use 0.9+ for very clear extractions
5. If you find the same metric for multiple periods, create separate entries
6. If a value seems unreasonable, still extract it but lower the confidence score

Return only the JSON object, no additional text.
```

#### Expected AI Response Structure:
```javascript
{
  "document_info": {
    "document_name": "Q1_2024_Financials.pdf",
    "company_name": "Acme Corporation",
    "document_type": "financial_report",
    "primary_currency": "USD",
    "periods_covered": ["2024-Q1", "2023-Q1"]
  },
  "metrics_discovered": [
    {
      "raw_name": "Total Revenue",
      "standardized_name": "revenue",
      "category": "revenue",
      "value": 10000000,
      "unit": "USD",
      "period": "2024-Q1",
      "confidence": 0.95,
      "source_location": "page 3, Income Statement",
      "extraction_context": "Q1 2024 Total Revenue: $10.0M (up 15% YoY)"
    },
    {
      "raw_name": "EBITDA",
      "standardized_name": "ebitda",
      "category": "margin",
      "value": 2500000,
      "unit": "USD",
      "period": "2024-Q1",
      "confidence": 0.92,
      "source_location": "page 3, Income Statement",
      "extraction_context": "Adjusted EBITDA: $2.5M"
    },
    {
      "raw_name": "Customer Count",
      "standardized_name": "customer_count",
      "category": "count",
      "value": 1250,
      "unit": "count",
      "period": "2024-Q1",
      "confidence": 0.88,
      "source_location": "page 5, KPIs",
      "extraction_context": "Active Customers: 1,250 (+12% QoQ)"
    }
    // ... more metrics as discovered
  ]
}
```

---

### Node 5: Prepare Sheet Data (JavaScript Code)
**Type**: `n8n-nodes-base.code` (v2)
**Node ID**: dc1e0406-bc91-48d3-a170-f855f41d1574
**Position**: [912, 0]
**Purpose**: Transforms AI-extracted dynamic metrics into Entity-Attribute-Value (EAV) format for Google Sheets

**Architecture Mapping**: Data transformation for [[SYSTEM_ARCHITECTURE#step-4-database-storage-🟡-partial|STEP 4: Database Storage]]

#### Complete Code Implementation:
```javascript
// NEW: Process dynamic metrics from improved AI prompt
const results = [];

for (const item of items) {
  try {
    // Parse AI response - handle different OpenAI node output structures
    let aiResponse;

    if (typeof item.json === 'string') {
      aiResponse = JSON.parse(item.json);
    } else if (item.json.message && item.json.message.content) {
      const content = item.json.message.content;
      aiResponse = typeof content === 'string' ? JSON.parse(content) : content;
    } else if (item.json.response) {
      aiResponse = typeof item.json.response === 'string'
        ? JSON.parse(item.json.response)
        : item.json.response;
    } else {
      aiResponse = item.json;
    }

    console.log('Parsed AI response:', JSON.stringify(aiResponse, null, 2));

    // Extract document info
    const docInfo = aiResponse.document_info || {};
    const metrics = aiResponse.metrics_discovered || [];

    if (metrics.length === 0) {
      console.log('No metrics found in AI response');
      results.push({
        json: {
          entity_id: 'NO_METRICS',
          document_name: docInfo.document_name || 'Unknown',
          metric_name: 'no_data',
          value: 0,
          error: 'No metrics discovered',
          date_added: new Date().toISOString()
        }
      });
    }

    // Convert each metric to an EAV row for Google Sheets
    for (const metric of metrics) {
      const entityId = `${docInfo.company_name || 'Unknown'}_${metric.period || 'Unknown'}_${Date.now()}`;

      const sheetRow = {
        entity_id: entityId,
        document_name: docInfo.document_name || 'Unknown',
        company_name: docInfo.company_name || 'Unknown',
        metric_name: metric.standardized_name || metric.raw_name,
        raw_metric_name: metric.raw_name,
        value: metric.value || 0,
        unit: metric.unit || '',
        period: metric.period || '',
        confidence: metric.confidence || 0,
        category: metric.category || '',
        source_location: metric.source_location || '',
        extraction_context: metric.extraction_context || '',
        document_type: docInfo.document_type || '',
        date_added: new Date().toISOString()
      };

      results.push({ json: sheetRow });
      console.log(`Added row: ${metric.standardized_name} = ${metric.value} (${metric.period})`);
    }

  } catch (error) {
    console.error('Error processing AI response:', error);
    console.error('Raw item:', JSON.stringify(item.json, null, 2));

    results.push({
      json: {
        entity_id: 'ERROR',
        document_name: 'Processing Error',
        metric_name: 'error',
        value: 0,
        error: error.message,
        date_added: new Date().toISOString()
      }
    });
  }
}

console.log(`Successfully prepared ${results.length} metric rows for Google Sheets`);
return results;
```

#### Output Format (Per Metric Row):
```javascript
{
  "json": {
    "entity_id": "Acme Corporation_2024-Q1_1705328400000",
    "document_name": "Q1_2024_Financials.pdf",
    "company_name": "Acme Corporation",
    "metric_name": "revenue",
    "raw_metric_name": "Total Revenue",
    "value": 10000000,
    "unit": "USD",
    "period": "2024-Q1",
    "confidence": 0.95,
    "category": "revenue",
    "source_location": "page 3, Income Statement",
    "extraction_context": "Q1 2024 Total Revenue: $10.0M (up 15% YoY)",
    "document_type": "financial_report",
    "date_added": "2024-01-15T10:30:00.000Z"
  }
}
```

**Key Feature**: Each discovered metric becomes ONE ROW in Google Sheets (Entity-Attribute-Value format)

---

### Node 6: Update Google Sheet
**Type**: `n8n-nodes-base.googleSheets` (v4.6)
**Node ID**: c13f7f01-4efc-4f5f-84d4-f2833c606016
**Position**: [1104, 0]
**Purpose**: Appends extracted metrics to Google Sheets in EAV format

**Architecture Mapping**: Implements current data storage for [[SYSTEM_ARCHITECTURE#step-4-database-storage-🟡-partial|STEP 4: Database Storage]]

#### Configuration:
```json
{
  "operation": "append",
  "documentId": {
    "__rl": true,
    "value": "1W5qmI08XGm1ZaZ4ZDX0cfkkrdbh-sPiUN86Y-h-SpVY",
    "mode": "list",
    "cachedResultName": "Company Financials",
    "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1W5qmI08XGm1ZaZ4ZDX0cfkkrdbh-sPiUN86Y-h-SpVY/edit?usp=drivesdk"
  },
  "sheetName": {
    "__rl": true,
    "value": "gid=0",
    "mode": "list",
    "cachedResultName": "Sheet1"
  },
  "columns": {
    "mappingMode": "autoMapInputData",  // Auto-maps JSON keys to columns
    "attemptToConvertTypes": false,
    "convertFieldsToString": false
  }
}
```

#### Credentials:
- **Type**: Google Sheets OAuth2
- **ID**: 8BL3ysETXImbyOPE
- **Name**: "Google Sheets account"

#### Google Sheet Structure (EAV Format):
| entity_id | document_name | company_name | metric_name | raw_metric_name | value | unit | period | confidence | category | source_location | extraction_context | document_type | date_added |
|-----------|---------------|--------------|-------------|-----------------|-------|------|--------|------------|----------|-----------------|-------------------|---------------|------------|
| Acme_Q1_1705328400000 | Q1_2024_Financials.pdf | Acme Corporation | revenue | Total Revenue | 10000000 | USD | 2024-Q1 | 0.95 | revenue | page 3 | Q1 2024 Total Revenue: $10.0M | financial_report | 2024-01-15T10:30:00.000Z |
| Acme_Q1_1705328400001 | Q1_2024_Financials.pdf | Acme Corporation | ebitda | EBITDA | 2500000 | USD | 2024-Q1 | 0.92 | margin | page 3 | Adjusted EBITDA: $2.5M | financial_report | 2024-01-15T10:30:00.000Z |
| Acme_Q1_1705328400002 | Q1_2024_Financials.pdf | Acme Corporation | customer_count | Customer Count | 1250 | count | 2024-Q1 | 0.88 | count | page 5 | Active Customers: 1,250 | financial_report | 2024-01-15T10:30:00.000Z |

**Key Feature**: Flexible schema that can store ANY financial metric discovered, not limited to predefined fields.

---

## Workflow Settings

### Execution Configuration:
```json
{
  "executionOrder": "v1"
}
```

### Workflow Status:
- **Active**: true (workflow is currently running and processing files)

### Connection Flow:
1. **Linear Pipeline**: Each node connects to exactly one downstream node
2. **Synchronous Processing**: No parallel branches or conditional logic
3. **Error Propagation**: Failures stop the entire workflow

---

## Data Transformation Journey

### Stage 1: File Detection
- **Input**: Google Drive folder monitoring
- **Output**: File metadata (ID, name, MIME type)
- **Frequency**: Every 60 seconds

### Stage 2: Binary Download
- **Input**: File ID from trigger
- **Process**: Downloads complete file content
- **Output**: Binary data with format conversion

### Stage 3: Text Extraction
- **Input**: Binary document data
- **Process**: OCR and format parsing
- **Output**: Plain text representation

### Stage 4: AI Analysis (Dynamic Extraction)
- **Input**: Extracted text
- **Process**: GPT-4 discovers and extracts ALL financial metrics dynamically
- **Output**: JSON with document_info and metrics_discovered array
- **Key Feature**: Extracts ANY metric type, not limited to predefined fields

### Stage 5: Data Formatting (EAV Conversion)
- **Input**: AI JSON response with metrics_discovered array
- **Process**: JavaScript converts each metric into a separate EAV row
- **Output**: Array of metric rows with 14 columns each
- **Key Feature**: One input document → Multiple output rows (one per metric)

### Stage 6: Storage (Google Sheets)
- **Input**: Array of EAV-formatted metric rows
- **Process**: Append all rows to Google Sheets
- **Output**: Updated spreadsheet with new metric rows
- **Key Feature**: Flexible schema supports any metric type

---

## Current System Capabilities

### ✅ What Works Now

1. **Dynamic Metric Extraction**
   - Extracts ANY financial metric found in documents
   - Not limited to predefined fields
   - Discovers company-specific or unusual metrics

2. **Multi-Format Document Support**
   - PDF (with OCR for scanned documents)
   - Excel, Word, PowerPoint
   - Google Docs, Slides, Drawings

3. **Confidence Scoring**
   - AI provides confidence level (0.0-1.0) for each metric
   - Helps identify reliable vs. uncertain extractions

4. **Rich Context Capture**
   - Raw metric name (as found in document)
   - Standardized metric name (normalized)
   - Source location (page, section)
   - Extraction context (surrounding text)
   - Document metadata (type, company, period)

5. **Flexible Data Model (EAV)**
   - Can store any metric type
   - No schema changes needed for new metrics
   - Easy to query by company, metric, period

6. **Automated Processing**
   - Monitors Google Drive continuously
   - Processes new files automatically
   - No manual intervention required

---

## Current Limitations & Gaps

**Architecture Comparison**: These limitations represent the gap between current implementation and planned [[SYSTEM_ARCHITECTURE|System Architecture]]

### 1. Data Validation
- **No cross-validation** of calculations (e.g., verify Revenue - COGS = Gross Profit)
- **No historical comparison** for anomaly detection
- **No duplicate detection** for re-uploaded documents
- **No quality score calculation** based on completeness and confidence

### 2. Error Handling
- **Basic error rows** created but no retry logic
- **No notification system** for failed extractions
- **Limited error context** passed to Google Sheets
- **No fallback mechanisms** for AI failures

### 3. Processing Constraints
- **Sequential processing** only (no parallelization)
- **60-second polling interval** may miss rapid uploads
- **4000 token limit** on AI responses may truncate very large documents
- **No queue management** for bulk uploads

### 4. Data Quality
- **No data standardization** for different date formats
- **No handling of partial periods** or YTD data
- **Missing audit trail** for data lineage
- **No version control** for updated metrics

### 5. Missing Advanced Features
- **No change detection** comparing metrics across periods
- **No trend analysis** or pattern recognition
- **No automated alerts** for significant changes
- **No data aggregation** or roll-ups

---

## Security & Access

### OAuth2 Credentials:
1. **Google Drive**: Read access to specified folder
   - ID: EJIwyqqrzOtJ0lL9
2. **Google Sheets**: Write access to target spreadsheet
   - ID: 8BL3ysETXImbyOPE
3. **OpenAI**: API key for GPT-4 model access
   - ID: 7deU81XNhPjacQHS

### Data Privacy:
- Documents remain in Google ecosystem
- OpenAI processes text (consider data residency requirements)
- No encryption of data in transit within n8n
- All credentials use OAuth2 or API key authentication

---

## Performance Metrics

### Expected Processing Times:
- **Trigger Detection**: 0-60 seconds (polling interval)
- **File Download**: 1-5 seconds (depends on file size)
- **Text Extraction**: 2-10 seconds (OCR if needed)
- **AI Processing**: 5-20 seconds (GPT-4 response time, depends on document length)
- **Data Transformation**: <1 second
- **Sheet Update**: 1-2 seconds (depends on number of metrics)

### Total Pipeline: ~2-5 minutes per document

### Cost Considerations:
- **OpenAI API**: ~$0.01-0.10 per document (depends on length and complexity)
- **Google Drive/Sheets**: Free tier usually sufficient
- **n8n**: Self-hosted or cloud subscription

---

## Monitoring & Debugging

### Logging Points:
1. Console logs in JavaScript node for debugging
2. Execution history saved for all runs
3. Error messages captured in sheet rows

### Key Metrics to Monitor:
- **Execution success rate**: % of documents processed successfully
- **Average processing time**: Time from upload to sheet update
- **Token usage**: OpenAI API costs and usage patterns
- **Error frequency**: Number of failures by error type
- **Metrics extracted per document**: Average number of metrics discovered

### Debug Commands:
```bash
# Check workflow execution history
# (Use n8n UI: Executions tab)

# View specific execution details
# (Use n8n UI: Click on execution ID)

# Check Google Sheets for error rows
# Look for entity_id = "ERROR" or "NO_METRICS"
```

---

## Future Enhancement Opportunities

**Development Path**: These enhancements align with the complete [[SYSTEM_ARCHITECTURE|System Architecture]] vision

### Immediate Improvements (1-2 weeks):
1. **Add validation node** after AI extraction
   - Cross-validate calculated metrics (Revenue - COGS = Gross Profit)
   - Flag metrics with low confidence scores
   - Detect outliers and anomalies

2. **Implement duplicate detection**
   - Hash document content
   - Check if document already processed
   - Skip or update existing metrics

3. **Add error notifications**
   - Email/Slack alerts for failed extractions
   - Daily summary of processing statistics
   - Low confidence metric alerts

4. **Improve data quality**
   - Standardize date formats across documents
   - Handle YTD, partial periods, forecasts
   - Currency conversion support

### Medium-term Enhancements (1-2 months):
1. **Historical comparison**
   - Query previous periods for same company
   - Calculate YoY, QoQ growth rates
   - Identify trending patterns

2. **Change detection and alerts**
   - Detect significant metric changes (>20% change)
   - Alert on negative trends or anomalies
   - Track metrics hitting thresholds

3. **Multi-company routing**
   - Create separate sheets per company
   - Organize by portfolio/sector
   - Custom extraction rules per company

4. **Enhanced AI prompts**
   - Specialized prompts for different document types
   - Multi-pass extraction for complex documents
   - Validation prompts for low-confidence metrics

### Long-term Vision (3-6 months):
1. **Multi-agent architecture**
   - Specialized agents for extraction, validation, analysis
   - Parallel processing of different document sections
   - Agent coordination and result merging

2. **MCP server integration**
   - Expose workflow as MCP tools
   - Enable external systems to query metrics
   - Real-time metric lookup API

3. **LangGraph for complex workflows**
   - Conditional routing based on document type
   - Human-in-the-loop for low-confidence extractions
   - Iterative refinement workflows

4. **Advanced analytics**
   - Trend analysis and forecasting
   - Peer comparison across portfolio companies
   - Automated investment insights generation
   - Integration with the SAMPLE_EMAIL_OUTPUT.md vision

---

## Testing & Validation

### Test Scenarios:
1. **Single-metric document**: Simple financial statement with 5-10 metrics
2. **Multi-metric document**: Comprehensive report with 30+ metrics
3. **Multi-period document**: Quarterly comparisons with metrics for multiple periods
4. **Non-standard metrics**: Company-specific KPIs and unusual metrics
5. **Poor quality scans**: Low-quality PDFs requiring OCR
6. **Non-financial documents**: Test rejection of irrelevant uploads

### Validation Checklist:
- [ ] All metrics extracted correctly
- [ ] Confidence scores reasonable (0.7-1.0 for clear data)
- [ ] Entity IDs unique per company-period combination
- [ ] Standardized metric names consistent across documents
- [ ] Source location and context captured accurately
- [ ] Error rows created for failed extractions
- [ ] Google Sheet updated with all metric rows

---

## Troubleshooting Common Issues

### Issue: No metrics extracted
**Symptoms**: Sheet row with entity_id = "NO_METRICS"
**Causes**:
- Document contains no financial data
- Text extraction failed (scanned image with poor OCR)
- AI prompt confusion (non-standard document format)
**Solutions**:
- Verify document contains financial metrics
- Check text extraction output in execution logs
- Review AI response for errors or empty metrics array

### Issue: Low confidence scores
**Symptoms**: Confidence values <0.5 for most metrics
**Causes**:
- Poor document quality or formatting
- Ambiguous metric labels
- Missing context in document
**Solutions**:
- Improve document quality before upload
- Add company-specific extraction rules
- Implement multi-pass extraction

### Issue: Incorrect metric values
**Symptoms**: Values don't match document
**Causes**:
- AI misread numbers (OCR errors)
- Unit confusion (thousands vs millions)
- Wrong section extracted
**Solutions**:
- Add validation rules for expected ranges
- Cross-validate calculated metrics
- Flag low-confidence extractions for manual review

### Issue: Processing timeout
**Symptoms**: Workflow execution fails after 2-5 minutes
**Causes**:
- Very large document (>100 pages)
- AI response taking too long
- Network connectivity issues
**Solutions**:
- Increase maxTokens limit for AI node
- Split large documents into sections
- Implement retry logic with backoff

---

## Appendix: Key Concepts

### Entity-Attribute-Value (EAV) Model
A flexible data model where each row represents one metric value:
- **Entity**: Company + Period combination
- **Attribute**: Metric name (revenue, ebitda, customer_count, etc.)
- **Value**: Numeric value + unit + metadata

**Advantages**:
- No schema changes needed for new metrics
- Easy to add company-specific KPIs
- Simple to query by company, metric, or period

**Disadvantages**:
- More rows than wide format
- Requires pivoting for analysis
- Slightly more complex queries

### Dynamic Metric Extraction
AI-powered approach that discovers metrics automatically rather than using predefined templates:
- Analyzes document to find ALL financial data
- Not limited to specific metric types
- Adapts to different document formats
- Captures company-specific KPIs

### Confidence Scoring
AI's assessment of extraction reliability (0.0-1.0):
- **0.9-1.0**: Very clear, unambiguous data
- **0.7-0.9**: Confident but some minor uncertainty
- **0.5-0.7**: Moderate confidence, may need review
- **0.0-0.5**: Low confidence, likely needs correction

---

**Document Version**: 1.0 (Accurate as of workflow version 7f5edcf9-efdf-4280-acab-e8b36ef7fb84)
**Last Updated**: January 2025
**Maintained By**: Development Team
