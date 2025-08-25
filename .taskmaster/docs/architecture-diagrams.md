# PE-Eval Multi-Modal Architecture Diagrams

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PE-Eval Multi-Modal Architecture                  │
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

## n8n Workflow Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        n8n WORKFLOW ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

[Schedule Trigger: 30s]
          │
          v
[Multi-Source Polling Function]
├─ Check Database Queue (PRIMARY)
├─ Check Google Drive API (SECONDARY)  
├─ Check Email IMAP (TERTIARY)
└─ Check CRM APIs (ADVANCED)
          │
          v
[Request Found?] ──No──► [Wait for Next Cycle]
          │ Yes
          v
[Validate & Normalize Request]
├─ Schema validation
├─ Data enrichment  
├─ Priority assignment
└─ Deduplication check
          │
          v
[Update Status: Processing]
          │
          v
[Data Collection Pipeline] ──┐
├─ [Google Drive Search]     │
├─ [Brave Search API]        │ Parallel
├─ [Financial Data APIs]     │ Execution
└─ [Data Aggregation]        │
          │ ←──────────────────┘
          v
[AI Analysis Pipeline] ──┐
├─ [GPT-4: Executive Summary]     │
├─ [GPT-4: Financial Highlights]  │ Parallel
├─ [GPT-4: Market Analysis]       │ Execution
├─ [GPT-4: Investment Thesis]     │
└─ [GPT-4: Recommendations]       │
          │ ←────────────────────────┘
          v
[Report Generation]
├─ [Aggregate AI Outputs]
├─ [HTML Template Processing]
├─ [PDF Generation]
└─ [Report Validation]
          │
          v
[Distribution Pipeline] ──┐
├─ [Email Distribution]   │
├─ [File Storage]         │ Parallel
├─ [Database Archive]     │ Execution
└─ [Notification Send]    │
          │ ←─────────────────┘
          v
[Update Status: Completed]
          │
          v
[Error Handling] ────► [Exponential Backoff]
├─ Log errors           ├─ Increment retry_count
├─ Update status        ├─ Calculate delay
├─ Send alerts          └─ Schedule retry
└─ Prepare retry
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA OVERVIEW                             │
└─────────────────────────────────────────────────────────────────────────────┘

analysis_request_queue
├─ id (UUID, PK)
├─ request_data (JSONB) ── Contains: company_name, ticker, analysis_type, 
├─ source_type (VARCHAR)              priority, requester, deadline, 
├─ source_reference (TEXT)            custom_parameters
├─ status (ENUM)
├─ priority (INTEGER)
├─ created_at (TIMESTAMP)
├─ processing_started_at (TIMESTAMP)
├─ completed_at (TIMESTAMP)  
├─ retry_count (INTEGER)
├─ last_error (TEXT)
└─ assigned_processor (VARCHAR)
          │
          ├─ FK Relationship
          v
processing_status
├─ id (UUID, PK)
├─ request_id (UUID, FK) ───────────┐
├─ step_name (VARCHAR)              │
├─ status (ENUM)                    │
├─ step_data (JSONB)                │
├─ started_at (TIMESTAMP)           │
├─ completed_at (TIMESTAMP)         │
└─ error_message (TEXT)             │
          │                         │
          ├─ FK Relationship        │
          v                         │
results_archive                     │
├─ id (UUID, PK)                    │
├─ original_request_id (UUID, FK) ──┘
├─ final_report (JSONB) ── Contains: executive_summary, financial_highlights,
├─ report_formats (JSONB)            market_analysis, investment_thesis,
├─ email_sent (BOOLEAN)              actionable_recommendations, metadata
├─ file_locations (JSONB)
├─ archived_at (TIMESTAMP)
└─ report_version (VARCHAR)

INDEXES:
├─ idx_queue_polling (status, priority, created_at) WHERE status IN ('pending', 'retry')
├─ idx_queue_source_type (source_type, created_at)  
├─ idx_queue_company_lookup GIN ((request_data->>'company_name') gin_trgm_ops)
├─ idx_processing_status_request (request_id, step_name)
├─ idx_results_archive_request (original_request_id)
└─ idx_results_archive_date (archived_at)
```

## Error Handling & Recovery Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING ARCHITECTURE                          │
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