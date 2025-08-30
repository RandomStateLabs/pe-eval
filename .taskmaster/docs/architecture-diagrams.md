# PE-Eval Dual-Track Architecture Diagrams

## MVP n8n Workflow (Current Priority - 2 weeks)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MVP n8n Workflow Architecture                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Google Drive   │    │ Extract From File│    │   Code Node      │
│    Trigger       │───▶│  (n8n Native)   │───▶│ (MetricExtractor)│
│  (File Changes)  │    │ PDF, Excel, Word │    │  89.6% Accuracy  │
└──────────────────┘    └──────────────────┘    └──────────┬───────┘
                                                           │
                                                           v
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Google Sheets    │◀───│  OpenAI Node     │◀───│ LLM Validation   │
│   Operations     │    │ (GPT-4 Enhance) │    │ (Derek's Enhance)│
│(StateDatabase.js)│    │   10-15% Boost   │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

## Future Enhanced Architecture (Tasks 19-27)

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PE-Eval Enhanced JavaScript Architecture                │
│                            (Future Implementation)                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Web Interface  │    │  Google Drive    │    │   Email IMAP     │    │   CRM APIs       │
│  (Manual Requests)│    │ (Bulk Analysis)  │    │ (Urgent Requests)│    │ (Automated)      │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │                       │
         v                       v                       v                       v
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              INPUT NORMALIZATION LAYER                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Web Adapter   │  │  Drive Adapter  │  │  Email Adapter  │  │   CRM Adapter   │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────────────────┘
                                  │ Standardized Request Format
                                  v
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              UNIFIED QUEUE SYSTEM                                      │
│                              PostgreSQL + JSONB                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  Request Queue  │  │ Processing Status│  │  Results Archive│  │   Error Logs    │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────────────────┘
                                  │ n8n Schedule Trigger (30s polling)
                                  v
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              PROCESSING PIPELINE                                       │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                          DATA COLLECTION                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │   │
│  │  │ Google Drive    │  │ Brave Search    │  │ Financial APIs  │                 │   │
│  │  │ Research Files  │  │ Public Data     │  │ Market Data     │                 │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                               │
│                                        v                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                        AI ANALYSIS PIPELINE                                    │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │   │
│  │  │ Executive   │ │ Financial   │ │ Market      │ │ Investment  │ │Actionable│  │   │
│  │  │ Summary     │ │ Highlights  │ │ Analysis &  │ │ Thesis      │ │Recomm-   │  │   │
│  │  │ Generator   │ │ Extractor   │ │ Competitive │ │ Developer   │ │endations │  │   │
│  │  │ (GPT-4)     │ │ (GPT-4)     │ │ Positioning │ │ (GPT-4)     │ │(GPT-4)   │  │   │
│  │  │             │ │             │ │ (GPT-4)     │ │             │ │          │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                               │
│                                        v                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                      REPORT GENERATION                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │   │
│  │  │ Data Aggregation│  │ HTML/PDF        │  │ Email           │                 │   │
│  │  │ & Formatting    │  │ Report          │  │ Distribution    │                 │   │
│  │  │                 │  │ Generation      │  │ System          │                 │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  v
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            DISTRIBUTION & MONITORING                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Email         │  │   File Storage  │  │   Dashboard     │  │   Notifications │   │
│  │   Delivery      │  │   (Drive/S3)    │  │   Access        │  │   (Slack/SMS)   │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
REQUEST INITIATION:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PE Professional│    │ Excel File  │    │ Urgent Email│    │ CRM Deal    │
│ Web Request │────▶│ Upload to   │────▶│ to Analysis │────▶│ Stage       │
│             │    │ Drive Folder│    │ Inbox       │    │ Change      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       v                   v                   v                   v
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INPUT PROCESSING & VALIDATION                            │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│ │ Web Form    │  │ File Parser │  │ Email Parser│  │ CRM Webhook │         │
│ │ Validation  │  │ & Validator │  │ & Validator │  │ Handler     │         │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
       │                   │                   │                   │
       └───────────────────┼───────────────────┼───────────────────┘
                           v                   v
┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED QUEUE INSERTION                                │
│                                                                             │
│  INSERT INTO analysis_request_queue (                                      │
│    request_data,     -- Normalized JSONB format                           │
│    source_type,      -- 'web', 'drive', 'email', 'crm'                   │
│    source_reference, -- Original file/email/deal ID                       │
│    priority,         -- 1=urgent, 3=normal, 5=low                        │
│    status           -- 'pending'                                          │
│  )                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                      n8n POLLING & PROCESSING                               │
│                                                                             │
│  Every 30 seconds:                                                         │
│  SELECT * FROM analysis_request_queue                                      │
│  WHERE status = 'pending'                                                  │
│  ORDER BY priority ASC, created_at ASC                                     │
│  LIMIT 1 FOR UPDATE SKIP LOCKED;                                           │
│                                                                             │
│  UPDATE status = 'processing', processing_started_at = NOW()               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATA COLLECTION PHASE                                  │
│                                                                             │
│  Parallel Collection:                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │ Google Drive│  │ Brave Search│  │ Financial   │                         │
│  │ Research    │  │ Public Info │  │ APIs        │                         │
│  │ Files       │  │ (News, SEC) │  │ (Market Data│                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
│         │                │                │                                │
│         └────────────────┼────────────────┘                                │
│                          v                                                  │
│  ┌─────────────────────────────────────────┐                               │
│  │     Aggregated Company Dataset          │                               │
│  │  - Financial statements & metrics       │                               │
│  │  - Market news & competitive analysis   │                               │
│  │  - Industry research & benchmarks       │                               │
│  └─────────────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AI ANALYSIS EXECUTION                                  │
│                                                                             │
│  Parallel GPT-4 Agents (5 concurrent threads):                             │
│                                                                             │
│  Agent 1: Executive Summary (Enhanced with Historical Context)             │
│  ├─ Input: Complete dataset + analysis parameters + historical context    │
│  ├─ Processing: Strategic overview generation with delta intelligence      │
│  └─ Output: 2-page executive summary with key insights and metric changes │
│                                                                             │
│  Agent 2: Financial Highlights (Enhanced with Delta Analysis)             │
│  ├─ Input: Financial data + market comparisons + metric deltas            │
│  ├─ Processing: Financial ratio analysis & benchmarking + trend analysis  │
│  └─ Output: Financial performance summary with metrics and change tracking│
│                                                                             │
│  Agent 3: Market & Competitive Analysis (Historical Context)              │
│  ├─ Input: Market data + competitive intelligence + historical trends     │
│  ├─ Processing: Market position & competitive dynamics with time analysis │
│  └─ Output: Market analysis with competitive positioning and evolution    │
│                                                                             │
│  Agent 4: Investment Thesis (Enhanced with Metric Intelligence)           │
│  ├─ Input: All prior analyses + deal parameters + delta analysis          │
│  ├─ Processing: Investment rationale development with metric impact       │
│  └─ Output: Clear investment thesis with risk/return analysis & trends    │
│                                                                             │
│  Agent 5: Actionable Recommendations (Delta-Aware)                        │
│  ├─ Input: Complete analysis + investment thesis + significant changes    │
│  ├─ Processing: Strategic recommendation formulation with delta priorities│
│  └─ Output: Prioritized action items and next steps based on metric changes│
│                                                                             │
│  Agent 6: State Analysis & Delta Intelligence (NEW)                       │
│  ├─ Input: Extracted metrics + historical database + delta calculations   │
│  ├─ Processing: Time-series analysis, trend detection, significance scoring│
│  └─ Output: Delta intelligence insights and metric change recommendations │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REPORT COMPILATION & FORMATTING                        │
│                                                                             │
│  Report Assembly:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Cover page with company overview and analysis metadata          │   │
│  │ 2. Executive Summary (Agent 1 output)                              │   │
│  │ 3. Financial Highlights with charts and tables (Agent 2)           │   │
│  │ 4. Market & Competitive Analysis with positioning (Agent 3)        │   │
│  │ 5. Investment Thesis and valuation framework (Agent 4)             │   │
│  │ 6. Actionable Recommendations and next steps (Agent 5)             │   │
│  │ 7. Appendices with data sources and methodology                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Format Generation:                                                         │
│  ├─ HTML for web viewing and email embedding                               │
│  ├─ PDF for professional distribution and printing                         │
│  └─ JSON for API access and system integration                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DISTRIBUTION & NOTIFICATION                            │
│                                                                             │
│  Multi-Channel Distribution:                                                │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │ Email       │    │ File Storage│    │ Dashboard   │                     │
│  │ ├─ PDF      │    │ ├─ Google   │    │ ├─ Web      │                     │
│  │ │  Attachment│    │ │  Drive    │    │ │  Access   │                     │
│  │ ├─ HTML     │    │ ├─ AWS S3   │    │ ├─ Mobile   │                     │
│  │ │  Summary  │    │ └─ Archive  │    │ │  App      │                     │
│  │ └─ Tracking │    │    Storage  │    │ └─ API      │                     │
│  │    Links    │    │             │    │    Endpoints│                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
│  Status Updates:                                                            │
│  ├─ Database: UPDATE status = 'completed', completed_at = NOW()            │
│  ├─ Email: Send completion notification with report links                  │
│  ├─ Slack: Post notification to relevant channels                          │
│  └─ CRM: Update opportunity record with analysis attachment                │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MONITORING & ANALYTICS                                 │
│                                                                             │
│  Real-time Metrics:                                                         │
│  ├─ Queue depth and processing velocity                                     │
│  ├─ AI agent response times and success rates                              │
│  ├─ Report generation and distribution metrics                             │
│  ├─ Error rates and retry statistics by source type                        │
│  └─ User engagement and report utilization analytics                       │
│                                                                             │
│  Alerts & Notifications:                                                    │
│  ├─ Queue depth exceeding thresholds (>50 pending requests)                │
│  ├─ Processing time SLA violations (>5 minutes for standard)               │
│  ├─ AI agent failures or error rate spikes (>5% failure rate)             │
│  ├─ External API rate limiting or connectivity issues                      │
│  └─ System resource utilization approaching limits                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## MVP n8n Workflow Structure (Current Implementation)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MVP n8n WORKFLOW - 5 NODES                          │
└─────────────────────────────────────────────────────────────────────────────┘

[Google Drive Trigger]
    Watch Files: /Private Companies/{company}/
    Events: fileAdded, fileUpdated
          │
          v
[Extract From File Node]
    Formats: PDF, Excel, Word, PowerPoint
    Output: Raw text content + metadata
          │
          v
[Code Node - Metric Extraction]
    Source: MetricExtractor.js patterns (89.6% accuracy)
    Processing: Regex patterns + confidence scoring
    Output: Structured metrics (revenue, valuation, ARR, etc.)
          │
          v
[OpenAI Node - LLM Validation]
    Model: GPT-4 (cost-optimized)
    Purpose: Validate + enhance regex results
    Expected: 10-15% accuracy improvement
          │
          v
[Google Sheets Node - State Database]
    Source: StateDatabase.js operations
    Schema: DatabaseSchema.js structure
    Operations: Append metrics, calculate deltas, update metadata
          │
          v
[Success/Error Handling]
    Success: Trigger company analysis update
    Error: Retry logic + alert notifications
```

## Future Enhanced n8n Orchestration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  ENHANCED n8n WORKFLOW ARCHITECTURE                        │
│                        (Future Implementation)                             │
└─────────────────────────────────────────────────────────────────────────────┘

[Google Drive Push Notifications]
          │
          v
[Document Type Detection & Routing]
├─ Financial Documents → Financial Agent
├─ Market Research → Market Agent
├─ Management Decks → Executive Agent
└─ Due Diligence → Investment Thesis Agent
          │
          v
[Enhanced Document Processing]
├─ Multi-format extraction with confidence scoring
├─ Document lineage and version tracking
├─ Content classification and metadata enrichment
└─ Historical context integration
          │
          v
[6 AI Agents with Delta Intelligence] ──┐
├─ [Executive Summary Agent]            │
├─ [Financial Analysis Agent]           │ Parallel
├─ [Market Analysis Agent]              │ Execution
├─ [Investment Thesis Agent]            │ with Historical
├─ [Recommendation Agent]               │ Context
└─ [State Analysis Agent - NEW]         │
          │ ←──────────────────────────────┘
          v
[Living Report Generation with Delta Intelligence]
├─ Progressive analysis enhancement
├─ Document change impact tracking
├─ Version control with delta visualization
└─ Smart alert generation for significant changes
          │
          v
[Enhanced Distribution & Monitoring]
├─ Priority-based alert system
├─ Real-time dashboard updates
├─ Portfolio comparison and benchmarking
└─ Enterprise security and compliance
```

## State Database Schema (Google Sheets - MVP + Future)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   GOOGLE SHEETS STATE DATABASE SCHEMA                      │
│                        (From DatabaseSchema.js)                           │
└─────────────────────────────────────────────────────────────────────────────┘

**MVP Implementation:**
Company Spreadsheet Structure (per company):

REVENUE_HISTORY Sheet:
├─ timestamp (Date)
├─ company_name (Text)
├─ metric_value (Number)
├─ currency (Text) 
├─ period (Text)
├─ source_document (Text)
├─ confidence_score (Number)
└─ extraction_method (Text)

VALUATION_HISTORY Sheet:
├─ timestamp (Date)
├─ company_name (Text)
├─ valuation (Number)
├─ currency (Text)
├─ valuation_type (Text)
├─ source_document (Text)
└─ confidence_score (Number)

KPI_SNAPSHOTS Sheet:
├─ timestamp (Date)
├─ company_name (Text)
├─ kpi_type (Text) -- ARR, growth_rate, customer_count, burn_rate
├─ kpi_value (Number)
├─ unit (Text)
├─ source_document (Text)
└─ confidence_score (Number)

DOCUMENT_LINEAGE Sheet:
├─ timestamp (Date)
├─ document_id (Text)
├─ company_name (Text)
├─ document_type (Text)
├─ document_name (Text)
├─ processing_status (Text)
└─ metrics_extracted_count (Number)

**Future Enhancement:**
DELTA_INTELLIGENCE Sheet:
├─ timestamp (Date)
├─ company_name (Text)
├─ metric_type (Text)
├─ old_value (Number)
├─ new_value (Number)
├─ delta_absolute (Number)
├─ delta_percent (Number)
├─ significance_score (Number)
└─ alert_triggered (Boolean)

COMPANY_METADATA Sheet:
├─ company_name (Text)
├─ last_updated (Date)
├─ document_count (Number)
├─ analysis_version (Text)
├─ spreadsheet_id (Text)
└─ folder_path (Text)
```

## MVP Error Handling (n8n Native + Phase 1 Patterns)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MVP n8n ERROR HANDLING STRATEGY                         │
└─────────────────────────────────────────────────────────────────────────────┘

[Node Execution Error]
          │
          v
[n8n Built-in Error Handling]
├─ Continue on Fail: true
├─ Retry on Fail: true (3 attempts)
├─ Wait Between Retries: 1000ms (exponential)
└─ Error Output: Include details
          │
          v
[Error Type Classification]
├─ Google Drive API Error
├─ File Extraction Error
├─ Metric Extraction Error (Code Node)
├─ OpenAI API Error
└─ Google Sheets API Error
          │
          v
[Apply Circuit Breaker Pattern]
(Translated from CircuitBreaker.js)
├─ Track failure rate per API
├─ Open circuit after 5 failures
├─ Half-open after 60s recovery
└─ Close on successful call
          │
          v
[Recovery Actions]
├─ API Timeout → Exponential backoff
├─ Rate Limit → Respect limits + retry
├─ Auth Error → Alert for manual fix
├─ Data Error → Log + partial processing
└─ Unknown → Alert + manual review
```

## Future Error Handling & Recovery Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ENHANCED ERROR HANDLING ARCHITECTURE                     │
│                          (Future Implementation)                           │
└─────────────────────────────────────────────────────────────────────────────┘

[Processing Error Detected]
          │
          v
[Categorize Error Type]
├─ Network/API Timeout
├─ Authentication Failure  
├─ Data Validation Error
├─ AI Agent Failure
├─ Report Generation Error
└─ Distribution Failure
          │
          v
[Log Error Details]
├─ Update last_error field
├─ Insert processing_status record
├─ Send alert notification
└─ Update system metrics
          │
          v
[Determine Retry Strategy]
├─ Transient Error? ──Yes──► [Exponential Backoff]
│                               ├─ Delay = min(30 * 2^retry_count, 900)s
│                               ├─ INCREMENT retry_count  
│                               ├─ UPDATE status = 'retry'
│                               └─ Schedule next attempt
│
├─ Permanent Error? ──Yes──► [Mark as Failed]
│                               ├─ UPDATE status = 'failed'
│                               ├─ Send failure notification
│                               ├─ Log for manual review
│                               └─ Archive request
│
└─ Max Retries? ──Yes──► [Escalate to Manual Review]
                          ├─ UPDATE status = 'manual_review'
                          ├─ Create support ticket
                          ├─ Notify operations team
                          └─ Preserve all error context

[Recovery Mechanisms by Error Type]

API Timeout/Rate Limiting:
├─ Exponential backoff with jitter
├─ Switch to backup API endpoints
├─ Queue throttling to respect limits
└─ Circuit breaker pattern

Authentication Failures:  
├─ Token refresh attempts
├─ Credential rotation
├─ Service account validation
└─ Manual intervention alert

Data Quality Issues:
├─ Data validation and cleaning
├─ Fallback to alternative sources
├─ Partial processing with warnings
└─ User notification for clarification  

AI Agent Failures:
├─ Retry with different model/parameters
├─ Fallback to simplified analysis
├─ Partial report generation
└─ Manual review for complex cases

System Resource Issues:
├─ Load balancing across instances
├─ Queue prioritization adjustments
├─ Temporary processing slowdown
└─ Horizontal scaling triggers
```