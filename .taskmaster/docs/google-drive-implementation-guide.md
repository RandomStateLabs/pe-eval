# Google Drive Polling Implementation Guide + State Management

## Quick Start Architecture

**Simple, Reliable Google Drive-Based PE Analysis System with Delta Intelligence**

```
PE Professional → Excel Template → Google Drive Upload → Auto Processing → Delta Intelligence → Priority Alerts
     ↓              ↓                    ↓                 ↓                      ↓                 ↓
1. Download        2. Fill Company      3. Drop in        4. n8n Detects        5. Extract Metrics   6. Smart Alerts
   Template           Data (1-50)          "Requests"       & Processes           & Calculate Deltas   Based on Changes
                                          Folder           All Companies         Store in State DB    Email with Context
```

## Google Drive Setup

### Folder Structure
```
/PE-Eval Analysis System/
├── Templates/
│   ├── Company-Analysis-Template.xlsx
│   ├── Instructions.pdf
│   └── Sample-Completed-File.xlsx
├── Requests/ 
│   └── [Users upload files here]
├── Processing/
│   └── [Files move here while being processed]
├── Results/
│   ├── 2025-08-19/
│   │   ├── Apple-Inc-Analysis-Report.pdf
│   │   └── Microsoft-Corp-Analysis-Report.pdf
│   └── 2025-08-20/
│       └── [Today's completed reports]
└── State-Database/
    ├── Company-Metrics-TimeSeries.gsheet (Google Sheets)
    ├── Delta-Intelligence-Log.gsheet (Google Sheets)
    └── Alert-History.gsheet (Google Sheets)
```

### Google Drive API Authentication

**Service Account Setup:**
1. Go to Google Cloud Console → APIs & Services → Credentials  
2. Create Service Account with domain-wide delegation
3. Generate JSON key file for authentication
4. Share PE-Eval folder with service account email address
5. Grant "Editor" permissions for file management

**n8n Google Drive Node Configuration:**
```json
{
  "authentication": "serviceAccount",
  "serviceAccountEmail": "pe-eval-system@your-project.iam.gserviceaccount.com",
  "privateKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "folderId": "1ABC123xyz789_your_folder_id"
}
```

## Excel Template Design

### Company Analysis Template Structure

**Sheet 1: Company Data**
| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| Company Name | Ticker | Analysis Type | Priority | Requester Email | Notes |
| Apple Inc | AAPL | growth | high | john@pe-firm.com | Focus on services revenue |
| Microsoft Corp | MSFT | buyout | normal | jane@pe-firm.com | Cloud growth analysis |

**Template Validation Rules:**
- Company Name: Required, text, max 100 characters
- Ticker: Optional, text, max 10 characters
- Analysis Type: Dropdown (growth, buyout, distressed, sector)
- Priority: Dropdown (urgent, high, normal, low)  
- Requester Email: Required, email format validation
- Notes: Optional, text, max 500 characters

**Excel Template Formula (Data Validation):**
```excel
=IF(A2="","Company Name Required",IF(E2="","Email Required",IF(ISERROR(FIND("@",E2)),"Invalid Email","Valid")))
```

## n8n Workflow Implementation

### Main Polling Workflow

**Node 1: Schedule Trigger**
```json
{
  "rule": {
    "interval": [{"field": "seconds", "value": 30}]
  },
  "timezone": "America/New_York"
}
```

**Node 2: Google Drive - List Files**  
```json
{
  "operation": "list",
  "folderId": "={{$node.Webhook.json.requestsFolderId}}",
  "q": "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='text/csv'"
}
```

**Node 3: Filter New Files**
```javascript
// Function Node - Check for new files
const lastPolled = $node["Get Last Poll Time"].json.lastPolled || '2025-01-01T00:00:00Z';
const newFiles = items.filter(item => {
  return new Date(item.json.modifiedTime) > new Date(lastPolled);
});

return newFiles;
```

**Node 4: Move File to Processing**
```json
{
  "operation": "move", 
  "fileId": "={{$json.id}}",
  "folderId": "={{$node.Webhook.json.processingFolderId}}"
}
```

**Node 5: Download and Parse File**
```javascript
// Function Node - Parse Excel/CSV Data
const XLSX = require('xlsx');
const fileContent = $node["Download File"].binary.data;
const workbook = XLSX.read(fileContent, {type: 'buffer'});
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const companies = XLSX.utils.sheet_to_json(worksheet);

// Validate and structure company data
const validCompanies = companies.filter(company => {
  return company['Company Name'] && company['Requester Email'];
}).map(company => ({
  companyName: company['Company Name'],
  ticker: company['Ticker'] || '',
  analysisType: company['Analysis Type'] || 'growth',
  priority: company['Priority'] || 'normal',
  requesterEmail: company['Requester Email'],
  notes: company['Notes'] || ''
}));

return [{json: {companies: validCompanies, fileName: $json.name}}];
```

**Node 6: Insert into Database**
```sql
-- PostgreSQL Node - Insert File Record
INSERT INTO drive_file_queue (
  file_id, filename, company_count, status, uploaded_by
) VALUES (
  '{{$json.fileId}}',
  '{{$json.fileName}}', 
  {{$json.companies.length}},
  'processing',
  '{{$json.companies[0].requesterEmail}}'
) RETURNING id;
```

**Node 7: Process Each Company (Split in Batches)**
```javascript
// Function Node - Split Companies for Processing
const companies = $json.companies;
const batchSize = 5; // Process 5 companies at a time
const batches = [];

for (let i = 0; i < companies.length; i += batchSize) {
  batches.push({
    json: {
      batch: companies.slice(i, i + batchSize),
      batchNumber: Math.floor(i / batchSize) + 1,
      totalBatches: Math.ceil(companies.length / batchSize),
      fileQueueId: $node["Insert File Record"].json.id
    }
  });
}

return batches;
```

## State Management & Delta Intelligence Pipeline

### Google Sheets State Database Setup
```javascript
// Function Node - Initialize State Management Database
const { GoogleSpreadsheet } = require('google-spreadsheet');

// Create main state database spreadsheet
async function initializeStateDatabase() {
  const doc = new GoogleSpreadsheet();
  await doc.createNewSpreadsheetDocument({
    title: 'PE-Eval State Database - Company Metrics Time Series',
    locale: 'en_US'
  });

  // Add main tracking sheets
  const metricsSheet = await doc.addSheet({
    title: 'Company-Metrics-Master',
    headerValues: [
      'timestamp', 'company_name', 'metric_name', 'metric_value', 
      'metric_unit', 'period', 'period_start', 'period_end', 
      'source_document', 'batch_id', 'delta_from_previous', 
      'delta_percentage', 'significance_score', 'alert_priority'
    ]
  });

  const alertsSheet = await doc.addSheet({
    title: 'Delta-Intelligence-Alerts',
    headerValues: [
      'timestamp', 'company_name', 'metric_name', 'alert_priority',
      'alert_message', 'current_value', 'previous_value', 
      'delta_absolute', 'delta_percentage', 'significance_score',
      'trend_direction', 'recipients_notified', 'status'
    ]
  });

  const trendsSheet = await doc.addSheet({
    title: 'Long-Term-Trends',
    headerValues: [
      'company_name', 'metric_name', 'trend_direction', 'trend_strength',
      'average_growth_rate', 'volatility_score', 'data_points',
      'first_recorded', 'last_updated', 'forecast_confidence'
    ]
  });

  return {
    spreadsheetId: doc.spreadsheetId,
    spreadsheetUrl: doc.spreadsheetUrl,
    metricsSheetId: metricsSheet.sheetId,
    alertsSheetId: alertsSheet.sheetId,
    trendsSheetId: trendsSheet.sheetId
  };
}

return [{json: await initializeStateDatabase()}];
```

### Metric Extraction with LLM Pattern Recognition
```javascript
// Function Node - Extract Structured Metrics for State Database
const companies = $json.companies;
const extractedMetricsData = [];

for (const company of companies) {
  // Enhanced LLM prompt for metric extraction
  const metricExtractionPrompt = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a financial data extraction specialist. Extract structured metrics with precise values, units, and time periods from company data for time-series analysis."
      },
      {
        role: "user",
        content: `Extract financial metrics from ${company.companyName} analysis for state database storage.

Company: ${company.companyName}
Ticker: ${company.ticker}
Analysis Type: ${company.analysisType}
Research Summary: [Include research data from searches]

Extract metrics in this exact JSON format:
{
  "revenue": {
    "current_value": 50000000,
    "unit": "dollars", 
    "period": "Q2 2025",
    "period_start": "2025-04-01",
    "period_end": "2025-06-30",
    "confidence": "high",
    "source": "financial_statements"
  },
  "valuation": {
    "current_value": 250000000,
    "unit": "dollars",
    "period": "June 2025", 
    "period_start": "2025-06-01",
    "period_end": "2025-06-30",
    "confidence": "medium",
    "source": "market_analysis"
  },
  "customer_count": {
    "current_value": 12500,
    "unit": "count",
    "period": "Q2 2025",
    "period_start": "2025-04-01", 
    "period_end": "2025-06-30",
    "confidence": "high",
    "source": "operational_metrics"
  },
  "growth_rate": {
    "current_value": 25.5,
    "unit": "percent",
    "period": "Q2 2025 YoY",
    "period_start": "2025-04-01",
    "period_end": "2025-06-30", 
    "confidence": "high",
    "source": "calculated_from_financials"
  }
}

Only include metrics with clear numerical values and time periods. If no clear metrics available, return empty object {}.`
      }
    ],
    max_tokens: 1500,
    temperature: 0.1
  };

  try {
    const extractionResponse = await openai.chat.completions.create(metricExtractionPrompt);
    const extractedMetrics = JSON.parse(extractionResponse.choices[0].message.content);
    
    extractedMetricsData.push({
      companyName: company.companyName,
      ticker: company.ticker,
      extractedMetrics: extractedMetrics,
      extractionTimestamp: new Date().toISOString(),
      batchId: $json.fileQueueId
    });
  } catch (error) {
    extractedMetricsData.push({
      companyName: company.companyName,
      ticker: company.ticker, 
      extractedMetrics: {},
      extractionError: error.message,
      extractionTimestamp: new Date().toISOString(),
      batchId: $json.fileQueueId
    });
  }
}

return [{json: {companies: extractedMetricsData}}];
```

### Delta Calculation and State Database Update
```javascript  
// Function Node - Calculate Deltas and Update State Database
const { GoogleSpreadsheet } = require('google-spreadsheet');
const companies = $json.companies;
const stateSpreadsheetId = 'your-state-database-spreadsheet-id';

const doc = new GoogleSpreadsheet(stateSpreadsheetId);
await doc.useServiceAccountAuth({
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY
});
await doc.loadInfo();

const metricsSheet = doc.sheetsByTitle['Company-Metrics-Master'];
const alertsSheet = doc.sheetsByTitle['Delta-Intelligence-Alerts'];

const deltaResults = [];
const alertsToGenerate = [];

for (const company of companies) {
  const companyName = company.companyName;
  const currentMetrics = company.extractedMetrics;
  
  if (!currentMetrics || Object.keys(currentMetrics).length === 0) continue;

  // Get historical data for this company
  const existingRows = await metricsSheet.getRows();
  const companyHistory = existingRows.filter(row => row.company_name === companyName);

  for (const [metricName, metricData] of Object.entries(currentMetrics)) {
    const currentValue = metricData.current_value;
    const currentPeriod = metricData.period;
    const currentPeriodStart = new Date(metricData.period_start);

    // Find previous data point for this metric
    const metricHistory = companyHistory
      .filter(row => row.metric_name === metricName)
      .sort((a, b) => new Date(b.period_start) - new Date(a.period_start));

    let deltaAbsolute = 0;
    let deltaPercentage = 0; 
    let significanceScore = 0;
    let alertPriority = 'low';
    let alertMessage = '';

    if (metricHistory.length > 0) {
      // Calculate delta from most recent previous value
      const previousValue = parseFloat(metricHistory[0].metric_value);
      deltaAbsolute = currentValue - previousValue;
      deltaPercentage = (deltaAbsolute / previousValue) * 100;

      // Calculate significance score (Derek's thresholds)
      const absoluteThresholds = {
        revenue: 1000000, // $1M
        valuation: 10000000, // $10M  
        customer_count: 100,
        growth_rate: 5 // 5 percentage points
      };

      const threshold = absoluteThresholds[metricName] || 100000;
      
      // Significance scoring
      if (Math.abs(deltaPercentage) >= 25 || Math.abs(deltaAbsolute) >= threshold * 5) {
        significanceScore = 9;
        alertPriority = 'critical';
        alertMessage = `🚨 CRITICAL: ${companyName} ${metricName} changed ${deltaPercentage.toFixed(1)}% - INVESTIGATE IMMEDIATELY`;
      } else if (Math.abs(deltaPercentage) >= 15 || Math.abs(deltaAbsolute) >= threshold * 2) {
        significanceScore = 7;
        alertPriority = 'high'; 
        alertMessage = `⚠️ HIGH: ${companyName} ${metricName} ${deltaPercentage > 0 ? 'increased' : 'decreased'} ${Math.abs(deltaPercentage).toFixed(1)}%`;
      } else if (Math.abs(deltaPercentage) >= 10 || Math.abs(deltaAbsolute) >= threshold) {
        significanceScore = 5;
        alertPriority = 'medium';
        alertMessage = `📊 MEDIUM: ${companyName} ${metricName} changed ${deltaPercentage.toFixed(1)}%`;
      } else {
        significanceScore = 2;
        alertPriority = 'low';
        alertMessage = `📈 LOW: ${companyName} ${metricName} normal change: ${deltaPercentage.toFixed(1)}%`;
      }
    } else {
      // First data point
      alertMessage = `🆕 NEW: ${companyName} ${metricName} baseline established: ${currentValue} ${metricData.unit}`;
    }

    // Add to metrics sheet
    await metricsSheet.addRow({
      timestamp: new Date().toISOString(),
      company_name: companyName,
      metric_name: metricName,
      metric_value: currentValue,
      metric_unit: metricData.unit,
      period: metricData.period,
      period_start: metricData.period_start,
      period_end: metricData.period_end,
      source_document: metricData.source || 'excel_upload',
      batch_id: company.batchId,
      delta_from_previous: deltaAbsolute,
      delta_percentage: deltaPercentage,
      significance_score: significanceScore,
      alert_priority: alertPriority
    });

    // Add alert if significant
    if (['critical', 'high'].includes(alertPriority)) {
      await alertsSheet.addRow({
        timestamp: new Date().toISOString(),
        company_name: companyName,
        metric_name: metricName,
        alert_priority: alertPriority,
        alert_message: alertMessage,
        current_value: currentValue,
        previous_value: metricHistory.length > 0 ? parseFloat(metricHistory[0].metric_value) : null,
        delta_absolute: deltaAbsolute,
        delta_percentage: deltaPercentage,
        significance_score: significanceScore,
        trend_direction: deltaAbsolute > 0 ? 'increasing' : 'decreasing',
        recipients_notified: alertPriority === 'critical' ? 'partners,senior-partners' : 'partners,analysts',
        status: 'pending_notification'
      });

      alertsToGenerate.push({
        companyName: companyName,
        metricName: metricName,
        alertPriority: alertPriority,
        alertMessage: alertMessage,
        currentValue: currentValue,
        deltaPercentage: deltaPercentage,
        significanceScore: significanceScore
      });
    }

    deltaResults.push({
      companyName: companyName,
      metricName: metricName,
      currentValue: currentValue,
      deltaAbsolute: deltaAbsolute,
      deltaPercentage: deltaPercentage,
      significanceScore: significanceScore,
      alertPriority: alertPriority,
      alertMessage: alertMessage
    });
  }
}

return [{
  json: {
    deltaResults: deltaResults,
    alertsToGenerate: alertsToGenerate,
    totalAlerts: alertsToGenerate.length,
    criticalAlerts: alertsToGenerate.filter(a => a.alertPriority === 'critical').length,
    stateUpdateTimestamp: new Date().toISOString()
  }
}];
```

## Data Collection Pipeline

### Google Drive Research File Search
```javascript
// Function Node - Search for Company Research Files  
const companyName = $json.companyName;
const searchQuery = `name contains '${companyName}' and (name contains '.pdf' or name contains '.xlsx' or name contains '.docx')`;

// Search in research folders
const researchFiles = await googleDrive.files.list({
  q: searchQuery,
  spaces: 'drive',
  fields: 'files(id,name,mimeType,webViewLink)'
});

return [{
  json: {
    companyName: companyName,
    researchFiles: researchFiles.data.files,
    researchSummary: `Found ${researchFiles.data.files.length} research files for ${companyName}`
  }
}];
```

### Brave Search Integration
```json
{
  "url": "https://api.search.brave.com/res/v1/web/search",
  "method": "GET", 
  "headers": {
    "X-Subscription-Token": "{{$credentials.braveSearch.apiKey}}"
  },
  "qs": {
    "q": "{{$json.companyName}} {{$json.ticker}} financial analysis private equity",
    "count": 10,
    "market": "US",
    "freshness": "py" 
  }
}
```

## AI Analysis Pipeline Fix

### Reconnect Disconnected GPT-4 Agents

**Agent 1: Executive Summary Generator**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system", 
      "content": "You are a senior private equity analyst. Generate a comprehensive executive summary for potential investment opportunities."
    },
    {
      "role": "user",
      "content": "Company: {{$json.companyName}}\nTicker: {{$json.ticker}}\nResearch Data: {{$json.researchSummary}}\nPublic Data: {{$json.searchResults}}\n\nGenerate a 2-page executive summary focusing on: investment thesis, key risks, financial highlights, market position, and recommendation."
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.3
}
```

**Agent 2: Financial Highlights Extractor**  
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a financial analyst specializing in PE due diligence. Extract and analyze key financial metrics and performance indicators."
    },
    {
      "role": "user", 
      "content": "Analyze financial performance for {{$json.companyName}} ({{$json.ticker}}). Research: {{$json.researchSummary}}\n\nFocus on: revenue growth, profitability trends, cash flow generation, debt levels, working capital, and key financial ratios. Provide benchmarking against industry peers."
    }
  ],
  "max_tokens": 1500,
  "temperature": 0.2
}
```

**Agent 3: Market Analysis & Competitive Positioning**
```json
{
  "model": "gpt-4o", 
  "messages": [
    {
      "role": "system",
      "content": "You are a market research analyst with expertise in competitive intelligence and industry analysis for private equity."
    },
    {
      "role": "user",
      "content": "Analyze market position and competitive landscape for {{$json.companyName}}. Public data: {{$json.searchResults}}\n\nCover: market size and growth, competitive position, key competitors, differentiation factors, market trends, and threats/opportunities."
    }
  ],
  "max_tokens": 1500,
  "temperature": 0.3
}
```

**Agent 4: Investment Thesis Developer**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a private equity principal developing investment theses. Create compelling, data-driven investment rationales."
    },
    {
      "role": "user",
      "content": "Develop investment thesis for {{$json.companyName}}.\nExecutive Summary: {{$node['Agent 1'].json.choices[0].message.content}}\nFinancial Analysis: {{$node['Agent 2'].json.choices[0].message.content}}\nMarket Analysis: {{$node['Agent 3'].json.choices[0].message.content}}\n\nCreate clear investment thesis covering: value creation opportunities, risk factors, exit strategy, target returns, and key investment highlights."
    }
  ],
  "max_tokens": 1500,
  "temperature": 0.4
}
```

**Agent 5: Actionable Recommendations Generator**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a senior PE partner providing actionable next steps and recommendations based on comprehensive analysis."
    },
    {
      "role": "user",
      "content": "Based on complete analysis for {{$json.companyName}}, provide actionable recommendations.\nInvestment Thesis: {{$node['Agent 4'].json.choices[0].message.content}}\n\nProvide: immediate next steps, due diligence priorities, key questions for management, deal structure considerations, timeline recommendations, and go/no-go recommendation with rationale."
    }
  ],
  "max_tokens": 1500,
  "temperature": 0.4
}
```

## Report Generation & Distribution

### PDF Report Template
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .report-header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .section { margin: 20px 0; page-break-inside: avoid; }
        .section-title { font-size: 18px; font-weight: bold; color: #2c3e50; }
        .financial-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .financial-table th, .financial-table td { padding: 8px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="report-header">
        Private Equity Analysis Report: {{companyName}} ({{ticker}})
    </div>
    
    <div class="section">
        <div class="section-title">Executive Summary</div>
        {{executiveSummary}}
    </div>
    
    <div class="section">
        <div class="section-title">Financial Highlights</div>
        {{financialHighlights}}
    </div>
    
    <div class="section">
        <div class="section-title">Market & Competitive Analysis</div>
        {{marketAnalysis}}
    </div>
    
    <div class="section">
        <div class="section-title">Investment Thesis</div>
        {{investmentThesis}}
    </div>
    
    <div class="section">
        <div class="section-title">Actionable Recommendations</div>
        {{recommendations}}
    </div>
</body>
</html>
```

### Email Distribution
```javascript
// Function Node - Send Reports via Email
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'analysis@pe-firm.com',
    pass: $credentials.gmail.password
  }
});

const companies = $json.companies;
const attachments = companies.map(company => ({
  filename: `${company.companyName}-Analysis-Report.pdf`,
  path: company.reportPath
}));

const mailOptions = {
  from: 'PE Analysis System <analysis@pe-firm.com>',
  to: $json.requesterEmail,
  subject: `Analysis Complete: ${companies.length} Company Reports Ready`,
  html: `
    <h2>Your PE Analysis Reports Are Ready</h2>
    <p>Analysis completed for ${companies.length} companies:</p>
    <ul>
      ${companies.map(c => `<li>${c.companyName} (${c.ticker})</li>`).join('')}
    </ul>
    <p>Reports are attached as PDFs and also available in Google Drive.</p>
    <p>Processing completed in ${$json.processingTimeMinutes} minutes.</p>
  `,
  attachments: attachments
};

await transporter.sendMail(mailOptions);
return [{json: {emailSent: true, recipientCount: 1}}];
```

## Testing & Validation

### Sample Test File
```excel
Company Name | Ticker | Analysis Type | Priority | Requester Email | Notes
Apple Inc | AAPL | growth | high | test@pe-firm.com | Focus on services growth
Microsoft Corp | MSFT | buyout | normal | test@pe-firm.com | Cloud infrastructure analysis  
Tesla Inc | TSLA | distressed | low | test@pe-firm.com | Manufacturing efficiency review
```

### Test Checklist
- [ ] Google Drive folder permissions and access
- [ ] File upload and automatic detection (within 30 seconds)
- [ ] Excel/CSV parsing with validation
- [ ] Database insertion and tracking
- [ ] Research file search in Google Drive
- [ ] Brave Search API integration
- [ ] All 5 GPT-4 agents responding and connected
- [ ] PDF report generation from AI outputs
- [ ] Email delivery with attachments
- [ ] File organization in results folders

## Monitoring & Alerts

### Key Metrics to Track
- Files processed per day/hour
- Average processing time per company
- AI agent response times and error rates
- Email delivery success rates  
- Google Drive API usage and limits
- Database performance and queue depth

### Alert Conditions
- File processing failures
- AI agent timeouts or errors
- Email delivery failures
- Google Drive API errors or rate limiting
- Processing time exceeding SLA (>10 minutes per company)

### Enhanced AI Agents with Delta Intelligence

**Agent 6: State Analysis & Delta Intelligence Engine (NEW)**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a quantitative analyst specializing in time-series analysis and delta intelligence for private equity investments. Focus on extracting actionable insights from metric changes and historical patterns."
    },
    {
      "role": "user",
      "content": "DELTA INTELLIGENCE ANALYSIS for companies in this batch:\n\nDELTA RESULTS:\n{{$node['Calculate Deltas'].json.deltaResults}}\n\nHIGH PRIORITY ALERTS:\n{{$node['Calculate Deltas'].json.alertsToGenerate}}\n\nSTATE MANAGEMENT UPDATE:\n- Total Alerts Generated: {{$node['Calculate Deltas'].json.totalAlerts}}\n- Critical Alerts: {{$node['Calculate Deltas'].json.criticalAlerts}}\n- State Database Updated: {{$node['Calculate Deltas'].json.stateUpdateTimestamp}}\n\nAnalyze the delta intelligence results and provide:\n\n1. **Metric Change Summary**: Highlight the most significant changes with context\n2. **Alert Prioritization**: Explain why certain changes warrant immediate attention\n3. **Trend Analysis**: Identify patterns and directional changes across companies\n4. **Action Recommendations**: Specific next steps based on delta intelligence\n5. **Historical Context**: Explain how current changes fit into longer-term patterns\n\nFocus on actionable insights that enable immediate decision-making. Format as executive briefing for investment committee."
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.2
}
```

### Priority-Based Email Distribution with Delta Context
```javascript
// Function Node - Send Delta-Aware Alert Emails
const nodemailer = require('nodemailer');
const alertsToGenerate = $json.alertsToGenerate || [];
const deltaResults = $json.deltaResults || [];

if (alertsToGenerate.length === 0) {
  return [{json: {message: 'No high-priority alerts to send'}}];
}

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'analysis@pe-firm.com',
    pass: process.env.GMAIL_PASSWORD
  }
});

// Group alerts by priority
const criticalAlerts = alertsToGenerate.filter(a => a.alertPriority === 'critical');
const highAlerts = alertsToGenerate.filter(a => a.alertPriority === 'high');

// Send critical alerts immediately to partners
if (criticalAlerts.length > 0) {
  const criticalMailOptions = {
    from: 'PE Delta Intelligence <analysis@pe-firm.com>',
    to: 'partners@pe-firm.com, senior-partners@pe-firm.com',
    subject: `🚨 CRITICAL METRIC ALERTS - ${criticalAlerts.length} Companies Require Immediate Review`,
    html: `
      <h2 style="color: #d73502;">🚨 CRITICAL METRIC ALERTS</h2>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Priority:</strong> IMMEDIATE ACTION REQUIRED</p>
      
      <h3>Critical Changes Detected:</h3>
      <ul>
        ${criticalAlerts.map(alert => `
          <li style="margin-bottom: 15px; padding: 10px; background: #ffe6e6; border-left: 4px solid #d73502;">
            <strong>${alert.companyName} - ${alert.metricName}</strong><br>
            ${alert.alertMessage}<br>
            <small>Current Value: ${alert.currentValue.toLocaleString()} | Change: ${alert.deltaPercentage.toFixed(1)}% | Significance: ${alert.significanceScore}/10</small>
          </li>
        `).join('')}
      </ul>
      
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Schedule immediate management calls for affected companies</li>
        <li>Review detailed analysis reports for context</li>
        <li>Consider portfolio risk implications</li>
        <li>Prepare investment committee briefing if needed</li>
      </ul>
      
      <p><em>This is an automated alert from the PE Delta Intelligence system. View full analysis in the detailed reports.</em></p>
    `,
    priority: 'high'
  };
  
  await transporter.sendMail(criticalMailOptions);
}

// Send high priority alerts to partners and analysts
if (highAlerts.length > 0) {
  const highPriorityMailOptions = {
    from: 'PE Delta Intelligence <analysis@pe-firm.com>',
    to: 'partners@pe-firm.com, analysts@pe-firm.com',
    subject: `⚠️ HIGH PRIORITY: ${highAlerts.length} Significant Metric Changes Detected`,
    html: `
      <h2 style="color: #f57c00;">⚠️ HIGH PRIORITY METRIC CHANGES</h2>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Priority:</strong> Review within 24 hours</p>
      
      <h3>Significant Changes:</h3>
      <ul>
        ${highAlerts.map(alert => `
          <li style="margin-bottom: 15px; padding: 10px; background: #fff3e0; border-left: 4px solid #f57c00;">
            <strong>${alert.companyName} - ${alert.metricName}</strong><br>
            ${alert.alertMessage}<br>
            <small>Current Value: ${alert.currentValue.toLocaleString()} | Change: ${alert.deltaPercentage.toFixed(1)}% | Significance: ${alert.significanceScore}/10</small>
          </li>
        `).join('')}
      </ul>
      
      <p><strong>Context:</strong> These changes exceed normal variance thresholds and may indicate important business developments.</p>
      <p><em>Detailed analysis reports with full context are attached and available in Google Drive.</em></p>
    `
  };
  
  await transporter.sendMail(highPriorityMailOptions);
}

return [{
  json: {
    criticalAlertsSent: criticalAlerts.length,
    highPriorityAlertsSent: highAlerts.length,
    totalEmailsSent: (criticalAlerts.length > 0 ? 1 : 0) + (highAlerts.length > 0 ? 1 : 0),
    alertDeliveryTimestamp: new Date().toISOString()
  }
}];
```

This enhanced implementation provides a sophisticated Google Drive-based system with **delta intelligence** that PE professionals can use immediately with familiar Excel workflows. The system now includes:

- **Real-time metric extraction** and pattern recognition
- **Google Sheets state database** for time-series storage
- **Delta calculation engine** with significance scoring
- **Smart alerting system** with priority-based routing
- **6 AI agents** including dedicated state analysis
- **Historical context integration** for all analysis

The system transforms simple Excel uploads into **instant metric intelligence** that alerts teams to significant changes like Derek's example: "Company revenue increased $10M since last quarter" - with automatic significance scoring, historical context, and priority-based stakeholder notification!