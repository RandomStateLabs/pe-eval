# Google Drive Polling Implementation Guide

## Quick Start Architecture

**Simple, Reliable Google Drive-Based PE Analysis System**

```
PE Professional → Excel Template → Google Drive Upload → Auto Processing → Email Reports
     ↓              ↓                    ↓                 ↓               ↓
1. Download        2. Fill Company      3. Drop in        4. n8n Detects   5. Receive PDFs
   Template           Data (1-50)          "Requests"       & Processes      via Email
                                          Folder           All Companies
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
└── Results/
    ├── 2025-08-19/
    │   ├── Apple-Inc-Analysis-Report.pdf
    │   └── Microsoft-Corp-Analysis-Report.pdf
    └── 2025-08-20/
        └── [Today's completed reports]
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

This implementation provides a simple, reliable Google Drive-based system that PE professionals can use immediately with familiar Excel workflows, while fixing the core AI pipeline connectivity issues.