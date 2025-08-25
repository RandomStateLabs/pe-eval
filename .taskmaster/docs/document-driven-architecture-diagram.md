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
│                   DOCUMENT DATA EXTRACTION + METRIC EXTRACTION PIPELINE                 │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  📄 PDF Parser          📊 Excel Parser         📝 Word Parser                          │
│  ├─ Extract text        ├─ Extract financial    ├─ Extract interview                     │
│  ├─ Identify sections   │  data & metrics       │  notes & insights                    │
│  └─ OCR if needed       ├─ Parse spreadsheet    └─ Structure findings                   │
│                         │  formulas                                                    │
│                         └─ Calculate ratios                                             │
│                                                                                          │
│  🔢 Metric Extraction Engine (NEW)                                                      │
│  ├─ Revenue pattern recognition ($10M, 40% growth, etc.)                               │
│  ├─ Valuation extraction (EBITDA multiples, enterprise value)                          │
│  ├─ KPI identification (customer count, ARR, churn rate)                               │
│  └─ Date context parsing (Q1 2025, monthly data, etc.)                                 │
│                                                                                          │
│  Output: Structured dataset + Extracted Metrics                                        │
│  • Financial metrics and trends across all periods                                      │
│  • Market research and competitive intelligence                                         │
│  • Due diligence findings and management assessment                                     │
│  • Document metadata and change tracking                                                │
│  • NEW: Structured metrics with timestamps for state database                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ Structured Metrics + Documents
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT & DELTA CALCULATION                           │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  📊 Google Sheets Time-Series Database                                                  │
│  ├─ CompanyA-Revenue: [Q1: $40M, Q2: $50M, Q3: $60M]                                  │
│  ├─ CompanyA-Valuation: [March: $200M, June: $250M, Sept: $300M]                      │
│  ├─ CompanyA-KPIs: [ARR, Customer_Count, Churn_Rate by month]                          │
│  └─ CompanyA-Metadata: [Document_triggers, Update_timestamps]                          │
│                                                                                          │
│  ⚡ Delta Calculation Engine                                                            │
│  ├─ Revenue Change: $50M → $60M = +$10M (+20% QoQ)                                     │
│  ├─ Significance Score: 20% growth = High significance (>10% threshold)                │
│  ├─ Historical Context: Accelerating from 15% avg trend                                │
│  └─ Alert Generation: "CompanyA revenue +$10M - investigate immediately"              │
│                                                                                          │
│  🔔 Smart Alert System                                                                  │
│  ├─ Significance thresholds: >10% change or >$1M delta                                 │
│  ├─ Priority scoring: Critical/High/Medium/Low based on impact                         │
│  ├─ Context enrichment: Historical trends and comparative analysis                     │
│  └─ Stakeholder routing: Partners for critical, analysts for medium                   │
│                                                                                          │
│  Output: Historical Context + Delta Intelligence + Smart Alerts                        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ Metrics + Historical Context + Delta Intelligence
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                      AI ANALYSIS PIPELINE (6 AGENTS + STATE MANAGEMENT)                 │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🧠 Agent 1: Executive Summary Generator with Historical Context                         │
│      Input: All documents + trigger context + historical metrics + delta analysis      │
│      Output: Strategic overview highlighting metric changes with historical context      │
│                                                                                          │
│  💰 Agent 2: Financial Deep Dive Analyst with Delta Intelligence                        │
│      Input: All financial docs + extracted metrics + historical trend data             │
│      Output: Financial analysis with Q1→Q2 trends + delta significance assessment      │
│                                                                                          │
│  🏪 Agent 3: Market & Competitive Intelligence with Context                             │
│      Input: Research docs + market analysis + historical market data                    │
│      Output: Market positioning with historical context and trend analysis             │
│                                                                                          │
│  🎯 Agent 4: Investment Thesis Developer with Metric Intelligence                       │
│      Input: All prior analyses + company dataset + historical performance data         │
│      Output: Updated investment thesis with metric-driven confidence scoring           │
│                                                                                          │
│  ✅ Agent 5: Action Items & Next Steps Generator with Delta Awareness                   │
│      Input: Complete analysis + investment thesis + delta intelligence alerts          │
│      Output: Specific next steps based on metric changes and trend significance        │
│                                                                                          │
│  📊 Agent 6: State Analysis & Delta Intelligence Engine (NEW)                           │
│      Input: Current metrics + historical state database + delta calculations           │
│      Output: Trend analysis, significance scoring, and proactive alerts               │
│                                                                                          │
│  🔄 All agents run with access to historical context and real-time delta intelligence   │
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
🔢 Extract structured metrics with LLM pattern recognition
    ↓
📊 Update Google Sheets state database (CompanyA-Revenue: Q3: $60M)
    ↓
⚡ Calculate deltas ($50M → $60M = +$10M/+20%) + significance scoring
    ↓
🔔 Generate smart alerts ("CompanyA revenue +$10M - investigate")
    ↓
🧠 Run 6 AI agents with historical context and delta intelligence
    ↓
📊 Generate updated analysis report with delta insights + trend context
    ↓
✉️ Email team with priority-based alerts: "TechStartup +$10M revenue (20% growth)"
    ↓
💾 Save report + state data with complete audit trail
```

## Database Schema for Document Tracking + State Management

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
  analysis_version INTEGER DEFAULT 1,
  -- NEW: State management fields
  metrics_extracted JSONB, -- Structured metrics from this analysis
  delta_alerts JSONB, -- Generated delta alerts
  significance_score DECIMAL(5,2) -- Overall significance of changes
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
  ai_agent_responses JSONB, -- Store all 6 agent outputs
  -- NEW: State management fields
  historical_context JSONB, -- Historical metrics context used
  delta_intelligence JSONB, -- Delta analysis and alerts
  trend_analysis JSONB -- Long-term trend insights
);

-- NEW: Time-series metric storage (Google Sheets integration)
CREATE TABLE company_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  metric_name VARCHAR(255) NOT NULL, -- revenue, valuation, customer_count, etc.
  metric_value DECIMAL(15,2),
  metric_value_text VARCHAR(500), -- For non-numeric values
  metric_unit VARCHAR(50), -- dollars, percent, count, etc.
  time_period VARCHAR(100), -- Q1 2025, March 2025, etc.
  period_start_date DATE,
  period_end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  source_document VARCHAR(500), -- Document that provided this metric
  google_sheets_row_id INTEGER, -- Reference to Google Sheets row
  INDEX idx_company_metric_time (company_name, metric_name, period_start_date)
);

-- NEW: Delta calculation and alert tracking
CREATE TABLE metric_deltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  previous_value DECIMAL(15,2),
  current_value DECIMAL(15,2),
  delta_absolute DECIMAL(15,2),
  delta_percentage DECIMAL(8,4),
  significance_score DECIMAL(5,2), -- 0-10 scale
  alert_priority VARCHAR(20), -- critical, high, medium, low
  alert_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  previous_period_id UUID REFERENCES company_metrics_history(id),
  current_period_id UUID REFERENCES company_metrics_history(id)
);

-- NEW: Google Sheets state database tracking
CREATE TABLE google_sheets_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  sheet_type VARCHAR(50), -- revenue, valuation, kpis, metadata
  google_sheet_id VARCHAR(255),
  google_sheet_url VARCHAR(1000),
  last_updated TIMESTAMP DEFAULT NOW(),
  row_count INTEGER,
  status VARCHAR(50) DEFAULT 'active' -- active, archived, error
);
```

## Key Benefits of Document-Driven Architecture + State Management

### 🎯 **Always-Current Analysis with Delta Intelligence**
- **Living Intelligence**: Analysis automatically updates when new information becomes available
- **No Manual Updates**: Eliminates need for analysts to manually refresh company analysis
- **Real-Time Insights**: New documents trigger immediate analysis updates within minutes
- **NEW - Instant Metric Awareness**: Know immediately when key metrics change significantly

### 📚 **Comprehensive Information Usage with Historical Intelligence**  
- **All Documents Utilized**: Every PDF, Excel file, Word doc automatically incorporated
- **Historical Context**: Maintains analysis evolution and change tracking over time
- **Multi-Source Intelligence**: Combines financial, market, and operational data sources
- **NEW - Time-Series Analysis**: Track metric trends across 6+ months of history
- **NEW - Delta Context**: Every analysis includes "what changed" with significance scoring

### ⚡ **Efficient PE Workflow Integration with Smart Alerting**
- **Natural Process**: PE teams continue normal document collection workflows
- **Automatic Processing**: No additional steps required from PE professionals
- **Smart Notifications**: Team gets alerted only when meaningful changes occur
- **NEW - Priority-Based Alerts**: Critical changes (>10%/$1M) get immediate attention
- **NEW - Context-Rich Notifications**: "CompanyA revenue +$10M (+25%) - above 15% trend"

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