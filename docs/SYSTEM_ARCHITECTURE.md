# Private Equity Financial Metrics Extraction System Architecture

## System Overview

This is an AI-powered N8N automation system that extracts financial metrics from private equity documents and monitors changes over time.

## Visual System Flow

```mermaid
graph LR
    A[📁 Google Drive Folder<br/>New File Detected] --> B[📥 Download File<br/>Node]
    B --> C[📄 Extract Text<br/>OCR/PDF Reader]
    C --> D[🤖 AI Extract Metrics<br/>GPT-4 OpenAI Node]
    D --> F{Data Validation}

    F -->|High >0.85| G[💾 Store Approved<br/>PostgreSQL]
    F -->|Medium 0.6-0.85| H[👤 Manual Review<br/>Queue]
    F -->|Low <0.6| I[❌ Reject<br/>Error Log]

    G --> J[🔍 Compare Historical<br/>PostgreSQL Query]
    J --> K[📊 Detect Changes<br/>Code Node]

    style A fill:#e3f2fd
    style D fill:#fff3e0
    style G fill:#e8f5e8
    style J fill:#f3e5f5
```

## N8N Workflow: PE Financial Metrics System (Pseudocode)

### TRIGGER: Google Drive Folder Monitor
```
WHEN new file appears in "Portfolio Financial Reports" folder
DO download file and start processing
```

### STEP 1: Document Processing
```
DOWNLOAD file from Google Drive
EXTRACT text from PDF/Excel/Word using OCR if needed
CLASSIFY document type (quarterly report, annual statement, etc.)
```

### STEP 2: AI Metrics Extraction
```
SEND extracted text to OpenAI GPT-4 with prompt:
  "Extract financial metrics: Revenue, EBITDA, Cash Flow, Debt, etc.
   Return structured JSON with confidence scores"
RECEIVE structured financial data
```

### STEP 3: Data Validation - Quality-Based Routing
```
CALCULATE overall quality score:
  - Confidence score average (40%)
  - Completeness (30%)
  - Core metrics present (30%)

IF quality score > 0.85 AND confidence > 0.9:
  ROUTE to auto-approval
ELSE IF quality score > 0.6 AND confidence > 0.7:
  ROUTE to manual review queue
ELSE:
  ROUTE to rejection/error handling
```

### STEP 4: Database Storage
```
STORE approved metrics in PostgreSQL:
  - Company name, period, document type
  - All extracted metrics as JSON
  - Quality scores, source document hash
  - Processing timestamp
```

### STEP 5: Historical Comparison
```
QUERY database for previous periods of same company
CALCULATE percentage changes for each metric
IDENTIFY trending patterns (growth, decline, volatility)
```

### STEP 6: Change Detection
```
FOR each metric change:
  CALCULATE percentage changes
  IDENTIFY significant trends
  Special rules for core metrics (Revenue, EBITDA, Net Income)
```


### STEP 7: Audit Trail
```
LOG all changes in PostgreSQL with:
  - Company, metric, change details
  - Percentage change, current/prior values
  - Change reason, timestamp
```

## Database Schema for Metrics Tracking

```sql
-- Core Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    investment_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Documents Storage
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    filename VARCHAR(255),
    file_hash VARCHAR(64) UNIQUE,
    document_type VARCHAR(100),
    period_start DATE,
    period_end DATE,
    upload_source VARCHAR(100),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Metric Definitions
CREATE TABLE metric_definitions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    category VARCHAR(100),
    data_type VARCHAR(50),
    unit VARCHAR(50),
    description TEXT
);

-- Final Validated Metrics
CREATE TABLE metric_values (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    metric_definition_id UUID REFERENCES metric_definitions(id),
    period_date DATE,
    current_value DECIMAL(20,4),
    prior_value DECIMAL(20,4),
    currency VARCHAR(3),
    confidence_score DECIMAL(3,2),
    quality_score DECIMAL(3,2),
    source_document_id UUID REFERENCES documents(id),
    extraction_metadata JSONB,
    is_current_version BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(company_id, metric_definition_id, period_date)
);

-- Change Tracking
CREATE TABLE metric_changes (
    id UUID PRIMARY KEY,
    metric_value_id UUID REFERENCES metric_values(id),
    change_type VARCHAR(50),
    percentage_change DECIMAL(8,4),
    absolute_change DECIMAL(20,4),
    comparison_period DATE,
    significance_level VARCHAR(20),
    trend_direction VARCHAR(20),
    detected_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_metrics_company_period ON metric_values(company_id, period_date);
CREATE INDEX idx_changes_significance ON metric_changes(significance_level, detected_at);
```

## Key System Features

### 🔍 **Intelligent Document Processing**
- Multi-format support (PDF, Excel, PowerPoint)
- Advanced OCR with fallback services
- Smart document classification
- Multi-language support

### 🤖 **AI-Powered Extraction**
- GPT-4 powered metric identification
- Confidence scoring for every extraction
- Comprehensive financial metric coverage
- Source text attribution for audit trails

### 📊 **Advanced Change Monitoring**
- Historical trend analysis
- Pattern recognition (growth, decline, volatility)
- Multi-period comparisons

This system provides a complete solution for private equity firms to automate financial metrics extraction and monitoring with enterprise-grade reliability and security.