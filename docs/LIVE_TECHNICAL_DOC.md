# PE-EVAL MVP: Complete n8n Workflow Technical Documentation

## Workflow Overview
**Name**: PE_EVAL_MVP
**ID**: U6BVPk7tD3p9c1xr
**Status**: Inactive (ready for activation)
**Version**: e203b2bf-d392-4a49-b9e0-2376dacb569d

### Purpose
Automated financial document processing pipeline that monitors Google Drive for new portfolio company documents, extracts financial metrics using AI, and stores structured data in Google Sheets for analysis and tracking.

**Architecture Reference**: See [[SYSTEM_ARCHITECTURE|System Architecture]] for complete planned system design.

**Implementation Status**: This document represents the **CURRENT WORKING IMPLEMENTATION** of the MVP workflow.

---

## Node Architecture & Data Flow

```mermaid
graph LR
    A[Google Drive Trigger<br/>Node 1] -->|File metadata| B[Download File<br/>Node 2]
    B -->|Binary data| C[Extract Text<br/>Node 3]
    C -->|Plain text| D[AI Validation<br/>Node 5]
    D -->|JSON metrics| E[Prepare Sheet Data<br/>Node 6]
    E -->|Formatted rows| F[Update Google Sheet<br/>Node 7]
    
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
**Position**: [256, 304]
**Purpose**: Monitors specified Google Drive folder for new document uploads

**Architecture Mapping**: Implements [[SYSTEM_ARCHITECTURE#trigger-google-drive-folder-monitor-🟢-implemented|TRIGGER: Google Drive Folder Monitor]]

#### Configuration:
```json
{
  "pollTimes": {
    "mode": "everyMinute"  // Polls every 60 seconds
  },
  "triggerOn": "specificFolder",
  "folderToWatch": "https://drive.google.com/drive/u/0/folders/1Dgbt5EUHEyeA27alUYku1M_jwTFBBcp5",
  "event": "fileCreated"  // Triggers only on new files
}
```

#### Credentials:
- **Type**: Google Drive OAuth2
- **ID**: QqvzERIcwvF9J8g8
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
  "size": "2456789",
  "webViewLink": "https://drive.google.com/file/...",
  "webContentLink": "https://drive.google.com/uc?id=..."
}
```

---

### Node 2: Download File from Drive
**Type**: `n8n-nodes-base.googleDrive` (v3)
**Position**: [464, 304]
**Purpose**: Downloads binary content of the triggered file

**Architecture Mapping**: Part of [[SYSTEM_ARCHITECTURE#step-1-document-processing-🟡-partial|STEP 1: Document Processing]]

#### Configuration:
```json
{
  "operation": "download",
  "fileId": "={{ $json.id }}",  // Dynamic from trigger
  "options": {
    "googleFileConversion": {
      "conversion": {
        "docsToFormat": "text/plain",      // Google Docs → Plain text
        "drawingsToFormat": "application/pdf",  // Drawings → PDF
        "slidesToFormat": "application/pdf"     // Slides → PDF
      }
    }
  }
}
```

#### Input Requirements:
- File ID from Google Drive Trigger

#### Output Data Structure:
```javascript
{
  "binary": {
    "data": {
      "mimeType": "application/pdf",
      "fileSize": 2456789,
      "fileName": "Q3_2024_Financials.pdf",
      "directory": "/tmp/n8n/",
      "data": "base64_encoded_binary_content..."
    }
  }
}
```

---

### Node 3: Extract Text from File
**Type**: `n8n-nodes-base.extractFromFile` (v1)
**Position**: [640, 304]
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
  "data": "Extracted text content from document...\nRevenue: €1,234,567\nEBITDA: €234,567...",
  "mimeType": "text/plain",
  "fileSize": 125000,
  "fileName": "Q3_2024_Financials.pdf"
}
```

---

### Node 5: AI Validation (OpenAI)
**Type**: `@n8n/n8n-nodes-langchain.openAi` (v1.8)
**Position**: [960, 304]
**Purpose**: AI-powered extraction of financial metrics using GPT-4

**Architecture Mapping**: Implements [[SYSTEM_ARCHITECTURE#step-2-ai-metrics-extraction-🟡-partial|STEP 2: AI Metrics Extraction]]

#### Configuration:
```json
{
  "modelId": "gpt-4o",  // Using GPT-4 Optimized
  "jsonOutput": true,   // Forces structured JSON response
  "options": {
    "maxTokens": 2000,
    "temperature": 0.2   // Low temperature for consistency
  }
}
```

#### Credentials:
- **Type**: OpenAI API
- **ID**: kfQ0Mv3LR5XeQylW
- **Name**: "OpenAi account"

#### System Prompt (Full):
```text
{{ $json.data }}

Analyze the following financial document and extract ALL financial metrics, ratios, and key performance indicators found in the document.

Create a CSV output where:
1. The FIRST ROW contains headers based on the metrics you actually find
2. Each subsequent row contains the extracted data for each metric

REQUIRED BASE COLUMNS (always include these):
- Company
- Document_Name  
- Metric_Name
- Value
- Period

DYNAMIC COLUMNS (add only if data is available):
- Category (if you can categorize the metric)
- Unit (if currency/percentage/multiple is specified)
- Confidence (if you can assess data reliability)
- Source_Page (if page/location is identifiable)
- Note (if context/calculation method is relevant)
- Growth_Rate (if period-over-period growth is calculable)
- Margin_Type (if it's a margin/ratio metric)
- Forecast_vs_Actual (if document distinguishes projections vs actuals)
- Segment (if metric is broken down by business segment)
- [Any other relevant attributes you discover]

INSTRUCTIONS:
- Analyze the document first to understand what metrics and attributes are available
- Create headers that capture ALL the relevant dimensions found in this specific document
- Include a header for any additional context that would be valuable for analysis
- Ensure each row contains data for one metric
- Use clear, underscore-separated header names (no spaces)
- Put "NULL" for any missing values rather than leaving cells empty

EXAMPLE OUTPUT STRUCTURE (adapt headers based on actual document content):
```

#### Expected AI Response Structure:
```javascript
{
  "company": "Portfolio Company XYZ",
  "periods": [
    {
      "month": "January 2024",
      "revenue": 1234567,
      "cogs": 456789,
      "grossProfit": 777778,
      "salaries": 234567,
      "marketing": 45678,
      "rnd": 34567,
      "admin": 23456,
      "operatingExpenses": 337268,
      "ebitda": 440510,
      "depreciation": 12345,
      "ebit": 428165,
      "interest": 5678,
      "taxes": 84497,
      "netIncome": 337990
    },
    // Additional periods...
  ]
}
```

---

### Node 6: Prepare Sheet Data (JavaScript Code)
**Type**: `n8n-nodes-base.code` (v2)
**Position**: [1232, 304]
**Purpose**: Transforms AI-extracted data into Google Sheets format

**Architecture Mapping**: Basic data transformation for [[SYSTEM_ARCHITECTURE#step-4-database-storage-🟡-partial|STEP 4: Database Storage]]

#### Complete Code Implementation:
```javascript
// Updated Prepare Sheet Data Node - matches new AI prompt structure
// Processes the new Income Statement periods format from OpenAI

const results = [];

for (const item of items) {
  try {
    // Parse AI response - handle different OpenAI node output structures
    let aiResponse;
    
    if (typeof item.json === 'string') {
      aiResponse = JSON.parse(item.json);
    } else if (item.json.message && item.json.message.content) {
      // Handle OpenAI node response structure
      const content = item.json.message.content;
      aiResponse = typeof content === 'string' ? JSON.parse(content) : content;
    } else if (item.json.response) {
      // Alternative OpenAI response format
      aiResponse = typeof item.json.response === 'string' 
        ? JSON.parse(item.json.response)
        : item.json.response;
    } else {
      aiResponse = item.json;
    }
    
    console.log('Parsed AI response:', JSON.stringify(aiResponse, null, 2));
    
    // Extract company info
    const company = aiResponse.company || 'Unknown Company';
    
    // Process each period from the AI response
    const periods = aiResponse.periods || [];
    
    if (periods.length === 0) {
      console.log('No periods found in AI response');
      // Create error row if no periods found
      results.push({
        json: {
          'Month': 'No Data',
          'Revenue (EUR)': 0,
          'COGS(EUR)': 0,
          'Gross Profit (EUR)': 0,
          'Salaries (EUR)': 0,
          'Marketing (EUR)': 0,
          'R&D (EUR)': 0,
          'Admin (EUR)': 0,
          'Operating Expenses (EUR)': 0,
          'EBITDA (EUR)': 0,
          'Deprication (EUR)': 0,
          'EBIT (EUR)': 0,
          'Interest (EUR)': 0,
          'Taxes (EUR)': 0,
          'Net Income (EUR)': 0
        }
      });
    }
    
    // Convert each period to a Google Sheets row
    for (const period of periods) {
      const sheetRow = {
        'Month': period.month || 'Unknown',
        'Revenue (EUR)': period.revenue || 0,
        'COGS(EUR)': period.cogs || 0,
        'Gross Profit (EUR)': period.grossProfit || 0,
        'Salaries (EUR)': period.salaries || 0,
        'Marketing (EUR)': period.marketing || 0,
        'R&D (EUR)': period.rnd || 0,
        'Admin (EUR)': period.admin || 0,
        'Operating Expenses (EUR)': period.operatingExpenses || 0,
        'EBITDA (EUR)': period.ebitda || 0,
        'Deprication (EUR)': period.depreciation || 0,
        'EBIT (EUR)': period.ebit || 0,
        'Interest (EUR)': period.interest || 0,
        'Taxes (EUR)': period.taxes || 0,
        'Net Income (EUR)': period.netIncome || 0
      };
      
      results.push({ json: sheetRow });
      console.log(`Added row for ${period.month}: Revenue=${period.revenue}, EBITDA=${period.ebitda}`);
    }
    
  } catch (error) {
    console.error('Error processing AI response:', error);
    console.error('Raw item:', JSON.stringify(item.json, null, 2));
    
    // Create error row with detailed error info
    results.push({
      json: {
        'Month': `ERROR: ${error.message}`,
        'Revenue (EUR)': 0,
        'COGS(EUR)': 0,
        'Gross Profit (EUR)': 0,
        'Salaries (EUR)': 0,
        'Marketing (EUR)': 0,
        'R&D (EUR)': 0,
        'Admin (EUR)': 0,
        'Operating Expenses (EUR)': 0,
        'EBITDA (EUR)': 0,
        'Deprication (EUR)': 0,
        'EBIT (EUR)': 0,
        'Interest (EUR)': 0,
        'Taxes (EUR)': 0,
        'Net Income (EUR)': 0
      }
    });
  }
}

console.log(`Successfully prepared ${results.length} Income Statement rows for Google Sheets`);
return results;
```

#### Output Format (Per Row):
```javascript
{
  "json": {
    "Month": "January 2024",
    "Revenue (EUR)": 1234567,
    "COGS(EUR)": 456789,
    "Gross Profit (EUR)": 777778,
    "Salaries (EUR)": 234567,
    "Marketing (EUR)": 45678,
    "R&D (EUR)": 34567,
    "Admin (EUR)": 23456,
    "Operating Expenses (EUR)": 337268,
    "EBITDA (EUR)": 440510,
    "Deprication (EUR)": 12345,  // Note: Typo in field name
    "EBIT (EUR)": 428165,
    "Interest (EUR)": 5678,
    "Taxes (EUR)": 84497,
    "Net Income (EUR)": 337990
  }
}
```

---

### Node 7: Update Google Sheet
**Type**: `n8n-nodes-base.googleSheets` (v4.6)
**Position**: [1376, 304]
**Purpose**: Appends extracted metrics to Google Sheets

**Architecture Mapping**: Implements current data storage for [[SYSTEM_ARCHITECTURE#step-4-database-storage-🟡-partial|STEP 4: Database Storage]]

#### Configuration:
```json
{
  "operation": "append",
  "documentId": "https://docs.google.com/spreadsheets/d/1B4tsCVY7jNfWsEoaTgrMBN1h_NG4MFzbY_k9xCtI5Es/edit",
  "sheetName": "Sheet1",
  "columns": {
    "mappingMode": "autoMapInputData",  // Auto-maps JSON keys to columns
    "attemptToConvertTypes": false,
    "convertFieldsToString": false
  }
}
```

#### Credentials:
- **Type**: Google Sheets OAuth2
- **ID**: bI9HRN0JJ3pR7tkk
- **Name**: "Google Sheets account"

#### Google Sheet Structure:
| Month | Revenue (EUR) | COGS(EUR) | Gross Profit (EUR) | Salaries (EUR) | Marketing (EUR) | R&D (EUR) | Admin (EUR) | Operating Expenses (EUR) | EBITDA (EUR) | Deprication (EUR) | EBIT (EUR) | Interest (EUR) | Taxes (EUR) | Net Income (EUR) |
|-------|--------------|-----------|-------------------|---------------|----------------|-----------|------------|------------------------|-------------|------------------|-----------|---------------|------------|-----------------|
| Jan 2024 | 1234567 | 456789 | 777778 | 234567 | 45678 | 34567 | 23456 | 337268 | 440510 | 12345 | 428165 | 5678 | 84497 | 337990 |

---

## Workflow Settings

### Execution Configuration:
```json
{
  "executionOrder": "v1",
  "timezone": "America/New_York",
  "saveDataErrorExecution": "all",     // Saves failed executions
  "saveDataSuccessExecution": "all",   // Saves successful executions
  "saveManualExecutions": true,        // Saves manual test runs
  "saveExecutionProgress": true        // Saves intermediate states
}
```

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

### Stage 4: AI Analysis
- **Input**: Extracted text
- **Process**: GPT-4 analyzes and structures financial data
- **Output**: JSON with company metrics and periods

### Stage 5: Data Formatting
- **Input**: AI JSON response
- **Process**: JavaScript transformation to sheet rows
- **Output**: Array of formatted metric rows

### Stage 6: Storage
- **Input**: Formatted rows
- **Process**: Append to Google Sheets
- **Output**: Updated spreadsheet with new metrics

---

## Current Limitations & Gaps

**Architecture Comparison**: These limitations represent the gap between current implementation and planned [[SYSTEM_ARCHITECTURE|System Architecture]]

### 1. Data Validation
- **No confidence scoring** on extracted metrics
- **No cross-validation** of calculations (e.g., Revenue - COGS = Gross Profit)
- **No historical comparison** for anomaly detection
- **No duplicate detection** for re-uploaded documents

### 2. Error Handling
- **Basic error rows** created but no retry logic
- **No notification system** for failed extractions
- **Limited error context** passed to Google Sheets

### 3. Scalability Issues
- **Hardcoded for Income Statements** only
- **Fixed EUR currency** assumption
- **No multi-company routing** (all data goes to same sheet)
- **No data type flexibility** for different financial statements

### 4. Processing Constraints
- **Sequential processing** only (no parallelization)
- **60-second polling interval** may miss rapid uploads
- **2000 token limit** on AI responses may truncate large documents
- **No queue management** for bulk uploads

### 5. Data Quality
- **Typo in field name**: "Deprication" instead of "Depreciation" (should be fixed in Node 6 code)
- **No data standardization** for different date formats
- **No handling of partial periods** or YTD data
- **Missing audit trail** for data lineage

---

## Security & Access

### OAuth2 Credentials:
1. **Google Drive**: Read access to specified folder
2. **Google Sheets**: Write access to target spreadsheet
3. **OpenAI**: API key for GPT-4 model access

### Data Privacy:
- Documents remain in Google ecosystem
- OpenAI processes text (consider data residency)
- No encryption of data in transit within n8n

---

## Performance Metrics

### Expected Processing Times:
- **Trigger Detection**: 0-60 seconds (polling interval)
- **File Download**: 1-5 seconds (depends on size)
- **Text Extraction**: 2-10 seconds (OCR if needed)
- **AI Processing**: 5-15 seconds (GPT-4 response time)
- **Sheet Update**: 1-2 seconds

### Total Pipeline: ~2-5 minutes per document

---

## Monitoring & Debugging

### Logging Points:
1. Console logs in JavaScript node for debugging
2. Execution history saved for all runs
3. Error messages captured in sheet rows

### Key Metrics to Monitor:
- Execution success rate
- Average processing time
- Token usage (OpenAI costs)
- Error frequency by document type

---

## Future Enhancement Opportunities

**Development Path**: These enhancements align with the complete [[SYSTEM_ARCHITECTURE|System Architecture]] vision

### Immediate Improvements:
1. Add validation node after AI extraction
2. Implement confidence scoring
3. Fix "Depreciation" typo
4. Add error notifications

### Medium-term Enhancements:
1. Support multiple financial statement types
2. Implement duplicate detection
3. Add currency conversion
4. Create company-specific sheet routing

### Long-term Vision:
1. Multi-agent architecture for specialized extraction
2. MCP server integration for tool exposure
3. LangGraph for complex decision flows
4. Real-time streaming with webhook responses