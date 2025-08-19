# Document-Driven Analysis Implementation Guide

## Architecture Overview

**Smart Document Monitoring System for PE Company Analysis**

```
📁 /CompanyA/ Folder (New Doc Added)
    ↓
🔔 Google Drive Push Notification 
    ↓
🤖 n8n Webhook Receives Change Event
    ↓
📄 Collect ALL CompanyA Documents  
    ↓
🔍 Extract Data from All File Types
    ↓
🧠 Run 5 AI Agents on Complete Dataset
    ↓
📊 Generate Updated Analysis Report
    ↓  
✉️  Notify Team + Archive Report
```

## Google Drive Setup

### Company Folder Structure
```
/PE Analysis System/
├── Private Companies/
│   ├── TechStartup-SeriesB/           ← Each company gets own folder
│   │   ├── 📁 01-Financials/
│   │   │   ├── 2024-Q1-Financial-Statements.xlsx
│   │   │   ├── 2024-Q2-Financial-Statements.xlsx
│   │   │   ├── Revenue-Projections.xlsx
│   │   │   └── Cap-Table.xlsx
│   │   ├── 📁 02-Research/
│   │   │   ├── Crunchbase-Export-2024.pdf
│   │   │   ├── Industry-Market-Analysis.pdf
│   │   │   ├── Competitive-Landscape-Study.docx
│   │   │   └── Technology-Assessment.pdf
│   │   ├── 📁 03-Due-Diligence/
│   │   │   ├── Management-Team-Interviews.pdf
│   │   │   ├── Customer-Reference-Calls.docx
│   │   │   ├── Product-Demo-Notes.pdf
│   │   │   └── Technical-Architecture-Review.pdf
│   │   ├── 📁 04-Legal-Docs/
│   │   │   ├── Articles-of-Incorporation.pdf
│   │   │   ├── Shareholder-Agreements.pdf
│   │   │   └── IP-Portfolio-Summary.pdf
│   │   └── 📁 99-Generated-Reports/
│   │       ├── 2024-08-01-Analysis-Report.pdf
│   │       ├── 2024-08-15-Analysis-Report.pdf
│   │       └── 2024-08-19-Analysis-Report.pdf ← Latest
│   │
│   ├── HealthTech-GrowthStage/         ← Another company
│   │   ├── 📁 01-Financials/
│   │   ├── 📁 02-Research/
│   │   ├── 📁 03-Due-Diligence/
│   │   └── 📁 99-Generated-Reports/
│   │
│   └── ManufacturingCorp-Acquisition/  ← Another company
│       └── [same folder structure]
```

### Google Drive API Webhook Setup

**Step 1: Create Webhook Endpoint in n8n**
```javascript
// Webhook Node Configuration
{
  "httpMethod": "POST",
  "path": "drive-changes",
  "responseMode": "responseNode",
  "options": {}
}
```

**Step 2: Register Drive API Push Notifications**
```javascript
// Function Node - Setup Drive Change Notifications
const { google } = require('googleapis');
const drive = google.drive({version: 'v3', auth: oauth2Client});

// Watch the entire "Private Companies" folder
const watchRequest = {
  id: 'pe-analysis-webhook-' + Date.now(),
  type: 'web_hook',
  address: 'https://your-n8n-instance.com/webhook/drive-changes',
  token: 'pe-analysis-secret-token', // Verify authentic requests
  expiration: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
};

const privateFolderId = 'your-private-companies-folder-id';
const response = await drive.files.watch({
  fileId: privateFolderId,
  requestBody: watchRequest
});

return [{json: {watchId: response.data.id, resourceId: response.data.resourceId}}];
```

## Document Change Processing

### Webhook Handler - Process Drive Changes
```javascript
// Function Node - Parse Drive Change Notification
const headers = $node.Webhook.json.headers;
const body = $node.Webhook.json.body;

// Verify authentic Google notification
const channelId = headers['x-goog-channel-id'];
const resourceState = headers['x-goog-resource-state']; // 'add', 'update', 'remove'
const token = headers['x-goog-channel-token'];

if (token !== 'pe-analysis-secret-token') {
  return [{json: {error: 'Invalid webhook token'}}];
}

// Only process 'add' and 'update' events
if (!['add', 'update'].includes(resourceState)) {
  return [{json: {skipped: true, reason: 'Not a file add/update event'}}];
}

// Get the changed file details
const resourceId = headers['x-goog-resource-id'];
const changeType = headers['x-goog-change-type'] || 'file';

return [{
  json: {
    changeDetected: true,
    resourceState: resourceState,
    resourceId: resourceId,
    changeType: changeType,
    timestamp: new Date().toISOString()
  }
}];
```

### Identify Company from File Path
```javascript
// Function Node - Determine Which Company Was Updated
const changedResourceId = $json.resourceId;

// Get file details to determine company folder
const fileDetails = await googleDrive.files.get({
  fileId: changedResourceId,
  fields: 'id,name,parents,mimeType,modifiedTime'
});

// Walk up parent hierarchy to find company folder
let currentParent = fileDetails.data.parents[0];
let companyFolder = null;
let folderPath = [];

while (currentParent && !companyFolder) {
  const parentDetails = await googleDrive.files.get({
    fileId: currentParent,
    fields: 'id,name,parents'
  });
  
  folderPath.unshift(parentDetails.data.name);
  
  // Check if this is a company folder (direct child of "Private Companies")
  if (parentDetails.data.parents) {
    const grandparentDetails = await googleDrive.files.get({
      fileId: parentDetails.data.parents[0],
      fields: 'name'
    });
    
    if (grandparentDetails.data.name === 'Private Companies') {
      companyFolder = {
        id: currentParent,
        name: parentDetails.data.name,
        path: folderPath.join('/')
      };
    }
  }
  
  currentParent = parentDetails.data.parents?.[0];
}

if (!companyFolder) {
  return [{json: {error: 'Could not identify company folder'}}];
}

return [{
  json: {
    companyName: companyFolder.name,
    companyFolderId: companyFolder.id,
    companyPath: companyFolder.path,
    triggeredBy: {
      fileName: fileDetails.data.name,
      fileId: fileDetails.data.id,
      mimeType: fileDetails.data.mimeType,
      modifiedTime: fileDetails.data.modifiedTime
    }
  }
}];
```

### Comprehensive Document Collection
```javascript
// Function Node - Collect All Company Documents
const companyFolderId = $json.companyFolderId;
const companyName = $json.companyName;

// Recursively get all files in company folder
async function getAllFilesRecursive(folderId, path = '') {
  const files = [];
  let nextPageToken = null;
  
  do {
    const response = await googleDrive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize: 100,
      pageToken: nextPageToken,
      fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents)'
    });
    
    for (const file of response.data.files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        // Recursively process subfolders
        const subFiles = await getAllFilesRecursive(file.id, `${path}/${file.name}`);
        files.push(...subFiles);
      } else {
        files.push({
          ...file,
          path: `${path}/${file.name}`,
          category: categorizeDocument(file.name, path)
        });
      }
    }
    
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);
  
  return files;
}

// Categorize documents by type and importance
function categorizeDocument(fileName, path) {
  const name = fileName.toLowerCase();
  const folder = path.toLowerCase();
  
  if (folder.includes('financial') || name.includes('financial') || name.includes('.xlsx')) {
    return 'financial';
  } else if (folder.includes('research') || name.includes('market') || name.includes('competitive')) {
    return 'research';
  } else if (folder.includes('due-diligence') || folder.includes('dd') || name.includes('interview')) {
    return 'dueDiligence';
  } else if (folder.includes('legal') || name.includes('contract') || name.includes('agreement')) {
    return 'legal';
  } else if (name.includes('.pdf') || name.includes('.docx')) {
    return 'document';
  }
  return 'other';
}

const allFiles = await getAllFilesRecursive(companyFolderId);

// Group by category for analysis
const documentsByCategory = {
  financial: allFiles.filter(f => f.category === 'financial'),
  research: allFiles.filter(f => f.category === 'research'),
  dueDiligence: allFiles.filter(f => f.category === 'dueDiligence'),
  legal: allFiles.filter(f => f.category === 'legal'),
  documents: allFiles.filter(f => f.category === 'document'),
  other: allFiles.filter(f => f.category === 'other')
};

return [{
  json: {
    companyName: companyName,
    companyFolderId: companyFolderId,
    totalDocuments: allFiles.length,
    documentsByCategory: documentsByCategory,
    lastUpdated: new Date().toISOString(),
    triggerFile: $json.triggeredBy
  }
}];
```

## Document Data Extraction

### Multi-Format Document Parser
```javascript
// Function Node - Extract Data from All Document Types
const PDFParser = require('pdf-parse');
const XLSX = require('xlsx');
const mammoth = require('mammoth'); // For .docx files

const documentCategories = $json.documentsByCategory;
const extractedData = {};

// PDF Extraction Function
async function extractFromPDF(fileId, fileName) {
  try {
    const fileData = await googleDrive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    const pdfData = await PDFParser(fileData.data);
    return {
      fileName: fileName,
      extractedText: pdfData.text,
      pageCount: pdfData.numpages,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    return { fileName, error: error.message };
  }
}

// Excel Extraction Function  
async function extractFromExcel(fileId, fileName) {
  try {
    const fileData = await googleDrive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    const workbook = XLSX.read(fileData.data, { type: 'buffer' });
    const sheets = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    });
    
    return {
      fileName: fileName,
      sheets: sheets,
      sheetNames: workbook.SheetNames,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    return { fileName, error: error.message };
  }
}

// Word Document Extraction
async function extractFromWord(fileId, fileName) {
  try {
    const fileData = await googleDrive.files.get({
      fileId: fileId, 
      alt: 'media'
    });
    
    const result = await mammoth.extractRawText({ buffer: fileData.data });
    return {
      fileName: fileName,
      extractedText: result.value,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    return { fileName, error: error.message };
  }
}

// Process each category of documents
for (const [category, files] of Object.entries(documentCategories)) {
  extractedData[category] = [];
  
  for (const file of files) {
    let extractedContent;
    
    if (file.mimeType === 'application/pdf') {
      extractedContent = await extractFromPDF(file.id, file.name);
    } else if (file.mimeType.includes('spreadsheet') || file.name.endsWith('.xlsx')) {
      extractedContent = await extractFromExcel(file.id, file.name);
    } else if (file.mimeType.includes('document') || file.name.endsWith('.docx')) {
      extractedContent = await extractFromWord(file.id, file.name);
    } else {
      extractedContent = { fileName: file.name, skipped: 'Unsupported file type' };
    }
    
    extractedData[category].push(extractedContent);
  }
}

// Create comprehensive data summary for AI analysis
const documentSummary = {
  companyName: $json.companyName,
  totalDocuments: $json.totalDocuments,
  extractedData: extractedData,
  categoryCounts: Object.entries(extractedData).map(([category, docs]) => ({
    category,
    count: docs.length,
    successfulExtractions: docs.filter(d => !d.error && !d.skipped).length
  })),
  triggerDocument: $json.triggerFile,
  analysisTimestamp: new Date().toISOString()
};

return [{json: documentSummary}];
```

## Enhanced AI Analysis Pipeline

### Agent 1: Document Synthesis & Executive Summary
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a senior private equity analyst with expertise in synthesizing information from multiple document sources to create comprehensive executive summaries. Focus on investment-relevant insights and changes from new information."
    },
    {
      "role": "user",
      "content": "COMPANY: {{$json.companyName}}\n\nDOCUMENT ANALYSIS TRIGGER:\nNew document added: {{$json.triggerDocument.fileName}}\nModified: {{$json.triggerDocument.modifiedTime}}\n\nCOMPLETE DOCUMENT PORTFOLIO:\n- Financial Documents: {{$json.categoryCounts.find(c => c.category === 'financial').count}} files\n- Research Documents: {{$json.categoryCounts.find(c => c.category === 'research').count}} files  \n- Due Diligence Materials: {{$json.categoryCounts.find(c => c.category === 'dueDiligence').count}} files\n- Legal Documents: {{$json.categoryCounts.find(c => c.category === 'legal').count}} files\n\nFINANCIAL DATA EXTRACTED:\n{{$json.extractedData.financial}}\n\nRESEARCH INSIGHTS:\n{{$json.extractedData.research}}\n\nDUE DILIGENCE FINDINGS:\n{{$json.extractedData.dueDiligence}}\n\nGenerate a comprehensive executive summary that:\n1. Synthesizes all available information about {{$json.companyName}}\n2. Highlights what the new document {{$json.triggerDocument.fileName}} reveals or changes\n3. Identifies key investment highlights and concerns\n4. Provides overall investment recommendation with confidence level\n5. Notes any information gaps that require additional documents or analysis\n\nFormat as professional PE executive summary suitable for partner review."
    }
  ],
  "max_tokens": 3000,
  "temperature": 0.3
}
```

### Agent 2: Financial Deep Dive
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a financial analyst specializing in private company financial analysis. Extract, analyze, and interpret financial data from multiple document sources with focus on PE investment criteria."
    },
    {
      "role": "user",
      "content": "FINANCIAL ANALYSIS FOR: {{$json.companyName}}\n\nFINANCIAL DOCUMENTS ANALYZED:\n{{$json.extractedData.financial}}\n\nEXTRACTED SPREADSHEET DATA:\n[Include any Excel financial data that was parsed]\n\nTRIGGERING DOCUMENT: {{$json.triggerDocument.fileName}}\n\nPerform comprehensive financial analysis covering:\n\n1. **Revenue Analysis**:\n   - Historical revenue trends (if multiple periods available)\n   - Revenue growth rates and seasonality\n   - Revenue quality and recurring vs. one-time components\n   - Customer concentration and revenue diversification\n\n2. **Profitability Assessment**:\n   - Gross margin trends and drivers\n   - EBITDA margins and cash conversion\n   - Operating leverage and scalability indicators\n   - Profit quality and sustainability\n\n3. **Cash Flow Analysis**:\n   - Operating cash flow generation and predictability  \n   - Working capital requirements and management\n   - Capital expenditure needs and efficiency\n   - Free cash flow yield and growth potential\n\n4. **Balance Sheet Strength**:\n   - Debt levels and capital structure\n   - Liquidity position and covenant compliance\n   - Asset quality and utilization\n   - Off-balance sheet obligations\n\n5. **Key Metrics & Ratios**:\n   - ROE, ROA, ROIC calculations\n   - Debt/EBITDA, Interest coverage ratios\n   - Industry benchmark comparisons\n   - Valuation multiples context\n\n6. **Financial Risk Assessment**:\n   - Key financial risks and mitigants\n   - Sensitivity analysis on key assumptions\n   - Liquidity and refinancing risks\n   - Financial forecast reasonableness\n\nHighlight any new insights from the triggering document and changes to previous financial assessment."
    }
  ],
  "max_tokens": 2500,
  "temperature": 0.2
}
```

### Agent 3: Market & Competitive Intelligence  
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a market research analyst with expertise in competitive intelligence, industry analysis, and market positioning assessment for private equity investments."
    },
    {
      "role": "user",
      "content": "MARKET ANALYSIS FOR: {{$json.companyName}}\n\nRESEARCH DOCUMENTS:\n{{$json.extractedData.research}}\n\nDUE DILIGENCE MATERIALS:\n{{$json.extractedData.dueDiligence}}\n\nTRIGGERING DOCUMENT: {{$json.triggerDocument.fileName}}\n\nConduct comprehensive market and competitive analysis:\n\n1. **Market Opportunity**:\n   - Total Addressable Market (TAM) size and growth\n   - Serviceable Addressable Market (SAM) assessment\n   - Market growth drivers and headwinds\n   - Regulatory environment and changes\n\n2. **Competitive Landscape**:\n   - Key competitors and market share dynamics\n   - Competitive positioning and differentiation\n   - Barriers to entry and competitive moats\n   - Competitive threats and new entrants\n\n3. **Customer Analysis**:\n   - Customer segments and needs assessment\n   - Customer acquisition and retention dynamics\n   - Customer concentration and dependency risks\n   - Pricing power and customer switching costs\n\n4. **Industry Dynamics**:\n   - Industry structure and value chain analysis\n   - Technology trends and disruption risks\n   - Consolidation trends and M&A activity\n   - Supplier dynamics and dependencies\n\n5. **Strategic Position**:\n   - Sustainable competitive advantages\n   - Market leadership position assessment\n   - Brand strength and recognition\n   - Distribution channel effectiveness\n\n6. **Growth Opportunities**:\n   - Organic growth vectors and potential\n   - Geographic expansion opportunities\n   - Product/service extension possibilities\n   - Partnership and acquisition targets\n\n7. **Market Risks**:\n   - Competitive threats and market disruption\n   - Regulatory and policy risks\n   - Technology obsolescence risks\n   - Customer behavior changes\n\nEmphasize new insights from the triggering document and any changes to market assessment."
    }
  ],
  "max_tokens": 2500,
  "temperature": 0.3
}
```

### Agent 4: Investment Thesis Development
```json
{
  "model": "gpt-4o", 
  "messages": [
    {
      "role": "system",
      "content": "You are a private equity principal with expertise in developing compelling, data-driven investment theses. Synthesize financial, market, and operational analysis into clear investment rationales."
    },
    {
      "role": "user",
      "content": "INVESTMENT THESIS DEVELOPMENT FOR: {{$json.companyName}}\n\nBASED ON COMPREHENSIVE ANALYSIS:\nExecutive Summary: {{$node['Agent 1'].json.choices[0].message.content}}\nFinancial Analysis: {{$node['Agent 2'].json.choices[0].message.content}}\nMarket Analysis: {{$node['Agent 3'].json.choices[0].message.content}}\n\nTRIGGERED BY: {{$json.triggerDocument.fileName}}\nANALYSIS DATE: {{$json.analysisTimestamp}}\n\nDevelop comprehensive investment thesis covering:\n\n1. **Investment Highlights**:\n   - Top 3-5 compelling reasons to invest\n   - Unique value proposition and competitive advantages\n   - Market opportunity and timing rationale\n   - Management team assessment and capability\n\n2. **Value Creation Plan**:\n   - Revenue growth initiatives and potential\n   - Operational improvement opportunities\n   - Strategic initiatives and expansion plans\n   - Financial optimization opportunities\n\n3. **Risk Assessment**:\n   - Key investment risks and probability assessment\n   - Risk mitigation strategies and contingency plans\n   - Downside scenarios and protection mechanisms\n   - Deal structure considerations for risk management\n\n4. **Financial Returns Expectation**:\n   - Target investment returns (IRR and money multiple)\n   - Value creation sources and timeline\n   - Exit strategy options and timing\n   - Sensitivity analysis on key value drivers\n\n5. **Investment Structure Considerations**:\n   - Optimal investment amount and ownership target\n   - Governance and board representation requirements\n   - Management incentive alignment needs\n   - Financing structure recommendations\n\n6. **Due Diligence Priorities**:\n   - Critical due diligence areas requiring deep dive\n   - External expert requirements (technical, market, etc.)\n   - Management team evaluation priorities\n   - Financial and legal diligence focus areas\n\n7. **Investment Recommendation**:\n   - Clear go/no-go recommendation with rationale\n   - Investment priority ranking and allocation sizing\n   - Timeline recommendations for decision and execution\n   - Key success factors and monitoring metrics\n\nHighlight how the new document {{$json.triggerDocument.fileName}} impacts or changes the investment thesis, valuation, or risk assessment."
    }
  ],
  "max_tokens": 3000,
  "temperature": 0.4
}
```

### Agent 5: Action Items & Next Steps
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a senior private equity partner responsible for driving investment processes forward. Translate analysis into specific, actionable next steps with clear ownership and timelines."
    },
    {
      "role": "user",
      "content": "ACTION PLANNING FOR: {{$json.companyName}}\n\nBASED ON UPDATED ANALYSIS:\nInvestment Thesis: {{$node['Agent 4'].json.choices[0].message.content}}\n\nTRIGGERED BY: {{$json.triggerDocument.fileName}} on {{$json.analysisTimestamp}}\n\nGenerate specific action plan with:\n\n1. **Immediate Next Steps** (Next 1-2 weeks):\n   - Specific actions required based on new information\n   - Document review and validation needs\n   - Management team engagement requirements\n   - Internal team coordination needs\n\n2. **Due Diligence Action Items** (Next 2-6 weeks):\n   - Priority due diligence workstreams to initiate\n   - External expert engagement requirements\n   - Financial, operational, and market validation needs\n   - Legal and regulatory review priorities\n\n3. **Information Gaps & Document Requests**:\n   - Critical missing documents or information\n   - Specific management team questions to address\n   - Third-party data sources to obtain\n   - Additional analysis or modeling requirements\n\n4. **Internal Process Steps**:\n   - Investment committee presentation requirements\n   - Partner discussion and alignment needs\n   - Portfolio construction considerations\n   - Risk committee review requirements\n\n5. **External Engagement Plan**:\n   - Management team meeting agenda items\n   - Board observer or governance discussions\n   - Industry expert interview priorities\n   - Customer/supplier reference requirements\n\n6. **Decision Timeline & Milestones**:\n   - Key decision points and timing\n   - Go/no-go decision checkpoint dates\n   - Term sheet and negotiation timeline\n   - Closing process and timeline requirements\n\n7. **Risk Monitoring & Contingencies**:\n   - Key risks requiring ongoing monitoring\n   - Contingency plans for identified scenarios\n   - Exit strategy consideration timeline\n   - Portfolio risk management integration\n\n8. **Document-Specific Actions**:\n   - Actions specifically triggered by {{$json.triggerDocument.fileName}}\n   - Follow-up document requests or validations needed\n   - Updated analysis requirements based on new information\n   - Communication updates required for stakeholders\n\nProvide specific owners, timelines, and success criteria for each action item. Prioritize based on criticality and impact on investment decision."
    }
  ],
  "max_tokens": 2500,
  "temperature": 0.4
}
```

This document-driven approach creates a sophisticated, always-current analysis system that automatically updates whenever new information becomes available about any portfolio or target company!