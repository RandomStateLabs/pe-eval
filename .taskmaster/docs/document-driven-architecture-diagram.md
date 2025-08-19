# Document-Driven PE Analysis System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          DOCUMENT-DRIVEN PE ANALYSIS SYSTEM                             │
│                           (Living Company Intelligence)                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                              GOOGLE DRIVE COMPANY FOLDERS                               │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  📁 /Private Companies/                                                                 │
│     ├── 📁 TechStartup-SeriesB/                    ← Each Company = Own Folder          │
│     │   ├── 📄 2024-Q2-Financials.xlsx             NEW FILE ADDED! 🔥                   │
│     │   ├── 📄 Crunchbase-Export.pdf                                                   │
│     │   ├── 📄 Market-Analysis.pdf                                                     │
│     │   └── 📄 Management-Interviews.docx                                              │
│     │                                                                                 │
│     ├── 📁 HealthTech-GrowthStage/                                                     │
│     │   ├── 📄 Financial-Projections.xlsx                                             │
│     │   └── 📄 Clinical-Trial-Results.pdf                                             │
│     │                                                                                 │
│     └── 📁 Manufacturing-Acquisition/                                                  │
│         ├── 📄 Asset-Valuation.xlsx                                                   │
│         └── 📄 Environmental-Audit.pdf                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ 🔔 Google Drive Push Notification
                                       │    (Real-time change detection)
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                            N8N WEBHOOK HANDLER                                          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  [Webhook Receiver] → [Parse Change Event] → [Identify Company] → [Trigger Analysis]    │
│                                                                                          │
│  Input: "New file added to TechStartup-SeriesB/2024-Q2-Financials.xlsx"                │
│  Output: "Trigger full analysis for TechStartup-SeriesB"                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ Company-Specific Trigger
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                         COMPANY DOCUMENT COLLECTION                                     │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  📊 Collect ALL Documents in TechStartup-SeriesB Folder:                               │
│                                                                                          │
│  💰 Financial Documents (3 files):                                                     │
│      • 2024-Q1-Financials.xlsx → Extract financial data, ratios, trends                │
│      • 2024-Q2-Financials.xlsx → NEW! Extract latest performance data                  │
│      • Revenue-Projections.xlsx → Extract growth forecasts                             │
│                                                                                          │
│  📈 Research Documents (2 files):                                                      │
│      • Crunchbase-Export.pdf → Extract company info, funding, competitors              │
│      • Market-Analysis.pdf → Extract market size, growth, positioning                  │
│                                                                                          │
│  🔍 Due Diligence Documents (3 files):                                                 │
│      • Management-Interviews.docx → Extract team assessment, strategy                  │
│      • Customer-References.pdf → Extract customer feedback, retention                  │
│      • Technical-Assessment.pdf → Extract product/tech evaluation                      │
│                                                                                          │
│  Total: 8 documents → Comprehensive company dataset                                     │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ All Documents Processed
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT DATA EXTRACTION PIPELINE                                │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  📄 PDF Parser          📊 Excel Parser         📝 Word Parser                          │
│  ├─ Extract text        ├─ Extract financial    ├─ Extract interview                     │
│  ├─ Identify sections   │  data & metrics       │  notes & insights                    │
│  └─ OCR if needed       ├─ Parse spreadsheet    └─ Structure findings                   │
│                         │  formulas                                                    │
│                         └─ Calculate ratios                                             │
│                                                                                          │
│  Output: Structured dataset with all company information                                │
│  • Financial metrics and trends across all periods                                      │
│  • Market research and competitive intelligence                                         │
│  • Due diligence findings and management assessment                                     │
│  • Document metadata and change tracking                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ Complete Company Dataset
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                           AI ANALYSIS PIPELINE (5 AGENTS)                               │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🧠 Agent 1: Executive Summary Generator                                                │
│      Input: All documents + trigger context                                             │
│      Output: Strategic overview highlighting new insights from Q2 financials            │
│                                                                                          │
│  💰 Agent 2: Financial Deep Dive Analyst                                               │
│      Input: All financial docs + extracted metrics                                      │
│      Output: Comprehensive financial analysis with Q1→Q2 trends                        │
│                                                                                          │
│  🏪 Agent 3: Market & Competitive Intelligence                                          │
│      Input: Research docs + market analysis + competitive data                          │
│      Output: Market positioning and competitive landscape assessment                     │
│                                                                                          │
│  🎯 Agent 4: Investment Thesis Developer                                                │
│      Input: All prior analyses + company dataset                                        │
│      Output: Updated investment thesis incorporating Q2 performance                     │
│                                                                                          │
│  ✅ Agent 5: Action Items & Next Steps Generator                                        │
│      Input: Complete analysis + investment thesis                                       │
│      Output: Specific next steps based on Q2 results                                    │
│                                                                                          │
│  🔄 All agents run in parallel using complete, up-to-date company information          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ AI Analysis Complete
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             REPORT GENERATION & DISTRIBUTION                            │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  📋 Updated Analysis Report Generation:                                                 │
│      ├─ Executive Summary (with Q2 highlights)                                          │
│      ├─ Financial Performance Analysis                                                  │
│      ├─ Market Position Assessment                                                      │
│      ├─ Investment Thesis Update                                                        │
│      ├─ Action Items & Next Steps                                                       │
│      └─ Document Change Summary                                                         │
│                                                                                          │
│  📧 Smart Distribution:                                                                 │
│      ├─ Email to deal team: "TechStartup Q2 Analysis Updated"                           │
│      ├─ Save to /TechStartup-SeriesB/99-Generated-Reports/                             │
│      ├─ Archive previous version with timestamp                                         │
│      └─ Notify partners if significant changes detected                                 │
│                                                                                          │
│  🔄 Version Control:                                                                    │
│      ├─ Track all analysis versions and triggers                                        │
│      ├─ Highlight changes from previous analysis                                        │
│      └─ Maintain audit trail of document additions                                     │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## Process Flow Diagram

```
📁 PE Team adds Q2-Financials.xlsx to /TechStartup-SeriesB/
    ↓ (< 2 minutes)
🔔 Google Drive sends push notification to n8n
    ↓
🤖 n8n identifies: "TechStartup-SeriesB folder changed"
    ↓
📄 Collect ALL documents in TechStartup-SeriesB folder (8 files)
    ↓
🔍 Extract data from PDFs, Excel files, Word docs
    ↓
🧠 Run 5 AI agents on complete company dataset
    ↓
📊 Generate updated analysis report with Q2 insights
    ↓
✉️ Email team: "TechStartup analysis updated with Q2 data"
    ↓
💾 Save report to company folder with version history
```

## Database Schema for Document Tracking

```sql
-- Track company analysis triggers and status
CREATE TABLE company_analysis_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  company_folder_id VARCHAR(255) NOT NULL,
  trigger_file_name VARCHAR(500) NOT NULL,
  trigger_file_id VARCHAR(255) NOT NULL,
  total_documents INTEGER,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  processing_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  report_path VARCHAR(1000), -- Path to generated report
  analysis_version INTEGER DEFAULT 1
);

-- Track individual document processing
CREATE TABLE document_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES company_analysis_queue(id),
  file_name VARCHAR(500) NOT NULL,
  file_id VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- pdf, xlsx, docx, etc.
  category VARCHAR(50), -- financial, research, dueDiligence, legal
  extraction_status VARCHAR(50), -- success, failed, skipped
  extracted_at TIMESTAMP,
  error_message TEXT
);

-- Track analysis report history 
CREATE TABLE analysis_report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  report_version INTEGER NOT NULL,
  trigger_document VARCHAR(500),
  report_path VARCHAR(1000),
  generated_at TIMESTAMP DEFAULT NOW(),
  document_count INTEGER,
  ai_agent_responses JSONB -- Store all 5 agent outputs
);
```

## Key Benefits of Document-Driven Architecture

### 🎯 **Always-Current Analysis**
- **Living Intelligence**: Analysis automatically updates when new information becomes available
- **No Manual Updates**: Eliminates need for analysts to manually refresh company analysis
- **Real-Time Insights**: New documents trigger immediate analysis updates within minutes

### 📚 **Comprehensive Information Usage**  
- **All Documents Utilized**: Every PDF, Excel file, Word doc automatically incorporated
- **Historical Context**: Maintains analysis evolution and change tracking over time
- **Multi-Source Intelligence**: Combines financial, market, and operational data sources

### ⚡ **Efficient PE Workflow Integration**
- **Natural Process**: PE teams continue normal document collection workflows
- **Automatic Processing**: No additional steps required from PE professionals
- **Smart Notifications**: Team gets alerted only when meaningful changes occur

### 🔄 **Version Control & Audit Trail**
- **Change Tracking**: Clear history of what triggered each analysis update
- **Document Provenance**: Full audit trail of all documents used in analysis
- **Report Evolution**: Track how investment thesis evolves with new information

### 🎯 **Scalable Intelligence**
- **Multi-Company Support**: Monitor dozens of companies simultaneously
- **Consistent Analysis**: Same high-quality analysis applied to all companies
- **Resource Efficient**: Automated processing reduces manual analysis workload

## Implementation Priority

### Phase 1: Core Document Monitoring (Week 1-2)
✅ Google Drive webhook setup for change detection
✅ Company folder identification and document collection
✅ Basic document parsing (PDF, Excel, Word)

### Phase 2: AI Analysis Pipeline (Week 2-3) 
✅ Fix and connect 5 GPT-4 analysis agents
✅ Document data extraction and structuring
✅ Enhanced AI prompts for document-based analysis

### Phase 3: Report Generation & Distribution (Week 3-4)
✅ Updated report generation with change tracking
✅ Smart notification system based on document types
✅ Version control and historical analysis tracking

### Phase 4: Production & Monitoring (Week 4)
✅ Error handling and retry logic
✅ Performance monitoring and optimization  
✅ User training and system documentation

This document-driven approach creates truly intelligent, always-current company analysis that stays in sync with your PE team's natural document collection workflows!