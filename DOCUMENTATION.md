# PE-Eval Platform Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Workflow Documentation](#workflow-documentation)
- [AI Integration](#ai-integration)
- [Configuration Guide](#configuration-guide)
- [Development Guide](#development-guide)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Appendices](#appendices)

---

## Project Overview

**PE-Eval** is an advanced document-driven AI automation platform for private equity firms, featuring real-time document monitoring and intelligent company analysis using a dual-track implementation strategy.

### 🚀 **Current Implementation: MVP n8n Workflow (2-week deployment)**
**Status**: Phase 1 state management foundation completed (89.6% accuracy achieved)
**Next**: Tasks 28-33 - MVP n8n workflow implementation

### Core Value Proposition
- **Document-driven analysis** - Each company has dedicated Google Drive folder
- **Real-time triggers** - New documents automatically trigger updated analysis
- **Living analysis reports** - Always-current analysis that evolves with new information
- **Dual-track approach** - MVP n8n validation → Full JavaScript production architecture
- **Proven accuracy** - 89.6% metric extraction accuracy from Phase 1 foundation

### Key Features
#### **MVP Features (Current Priority)**
- 📁 Google Drive push notification monitoring
- 🔧 **5-node n8n workflow** - Streamlined processing pipeline
- 📊 **Native document processing** - n8n Extract From File for PDF/Excel/Word/PowerPoint
- 🧮 **Proven metric extraction** - Existing regex patterns with 89.6% accuracy
- 🤖 **LLM validation** - OpenAI integration for enhanced accuracy
- 💾 **Google Sheets state database** - Time-series metric tracking

#### **Future Features (Full JavaScript Architecture)**
- 🤖 6 specialized AI agents with delta intelligence
- 📊 Advanced document processing with confidence scoring
- 🚨 Smart notification system with priority-based alerting
- 📈 Living reports with visual delta intelligence dashboards
- 🔒 Enterprise security and audit framework

---

## Quick Start

### Prerequisites
#### **MVP n8n Workflow Requirements**
- n8n Cloud account (recommended) or local n8n instance
- API keys for: OpenAI (GPT-4), Google (Drive API, Sheets API)
- Google Drive with company-specific folders
- Git for version control and documentation

#### **Development Environment (Optional)**
- Node.js 18+ (for future JavaScript implementation)
- Claude Code (AI development assistant)
- Task Master AI (project management)

### Quick Setup for MVP

#### **Option 1: n8n Cloud Setup (Recommended)**
```bash
# Clone repository for documentation and reference
git clone https://github.com/yandifarinango/pe-eval.git
cd pe-eval

# Review MVP implementation guide
open docs/n8n-workflow-mapping.md

# Set up n8n Cloud account at n8n.cloud
# Import 5-node workflow from .taskmaster/docs/mvp-n8n-workflow.md
# Configure API credentials in n8n interface
```

#### **Option 2: Development Environment Setup**
```bash
# Setup configurations for development
cp .env.example .env
cp .mcp.template.json .mcp.json
cp .claude/settings.template.json .claude/settings.json
cp .taskmaster/config.template.json .taskmaster/config.json

# Add your API keys to .env
# Configure Task Master for project management
task-master init
task-master models --setup

# Start development session
claude  # Start Claude Code session
```

### Setup Company Folders
**Document-Driven Architecture Setup:**
1. Create Google Drive structure:
```
Private Equity Analysis/
├── Company A/
│   ├── 10K_2024.pdf
│   ├── Q3_earnings.pdf
│   └── investor_deck.pptx
├── Company B/
│   ├── financials_2024.xlsx
│   └── market_research.pdf
```

2. Configure Google Drive push notifications for each company folder
3. Each new document automatically triggers company-specific analysis

### Document Monitoring Setup
**Real-time Document Processing:**
```javascript
// Google Drive webhook setup for each company folder
const watchRequest = {
  id: 'pe-analysis-' + companyName + '-' + Date.now(),
  type: 'web_hook', 
  address: 'https://your-n8n-instance.com/webhook/drive-changes'
};
```

**Expected Result**: New documents trigger immediate analysis updates for specific companies.

---

## Architecture

### Dual-Track Implementation Architecture

#### **MVP n8n Workflow (Current Implementation)**
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Google Drive   │────▶│  n8n Trigger │────▶│  Extract From   │
│  Document       │     │  (Node 1)    │     │  File (Node 2)  │
│  Changes        │     │               │     │                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                     │
                                                     ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Google Sheets  │◀────│  LLM Validation │
                        │  Update (Node 5)│     │  (Node 4)       │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
                                                     ▲
                                                     │
                                              ┌─────────────────┐
                                              │  Metric         │
                                              │  Extraction     │
                                              │  (Node 3)       │
                                              └─────────────────┘
```

#### **Future JavaScript Architecture (Phase 2+)**
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Google Drive   │────▶│  Push        │────▶│  Document       │
│  Document       │     │  Notification│     │  Processing     │
│  Changes        │     │  Webhook     │     │  Pipeline       │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                     │
                                                     ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Living         │◀────│  6 AI Agents    │
                        │  Analysis       │     │  (Enhanced)     │
                        │  Reports        │     │                 │
                        └─────────────────┘     └─────────────────┘
                                                     ▲
                                                     │
                                              ┌─────────────────┐
                                              │  Delta          │
                                              │  Intelligence   │
                                              │  Engine         │
                                              └─────────────────┘
```

### Document-Driven Data Flow
1. **Trigger**: New document added to company-specific Google Drive folder
2. **Detection**: Google Drive push notification to n8n webhook
3. **Extraction**: Multi-format document processing (PDF, Excel, Word)
4. **AI Analysis**: 5 specialized agents process company-specific documents
5. **Report Update**: Living analysis report enhanced with new insights
6. **Distribution**: Updated analysis delivered to investment team

### Technology Stack

#### **MVP Technology Stack (Current)**
| Layer | Technology | Purpose |
|-------|------------|---------|
| Document Monitoring | Google Drive API | Real-time document change detection |
| Workflow Platform | n8n Cloud | 5-node workflow orchestration |
| Document Processing | n8n Extract From File | Native PDF, Excel, Word, PowerPoint extraction |
| AI Models | OpenAI GPT-4 | LLM validation and enhancement |
| State Database | Google Sheets | Time-series metric storage |
| Metric Extraction | JavaScript Code Node | Proven regex patterns (89.6% accuracy) |

#### **Future Technology Stack (Phase 2+)**  
| Layer | Technology | Purpose |
|-------|------------|---------|
| Document Monitoring | Google Drive API | Real-time document change detection |
| Orchestration | Node.js Services | Custom workflow automation |
| Document Processing | Custom pipeline | Advanced multi-format extraction |
| AI Models | OpenAI GPT-4 & Claude | 6 specialized agents with delta intelligence |
| Search | Brave API | Supplementary market research |
| Storage | Google Sheets + Caching | Enhanced state management with Redis |
| Development | Claude Code | AI-assisted coding |
| Task Management | Task Master AI | Project tracking |

---

## Core Components

### **Current Implementation Status**
- ✅ **Phase 1 Complete**: State management foundation with 89.6% metric extraction accuracy
- 🔧 **Current Priority**: MVP n8n workflow implementation (Tasks 28-33)
- 📋 **Future Phase**: Full JavaScript architecture (Tasks 19-27)

### **MVP n8n Workflow Components (5 Nodes)**

#### **Node 1: Google Drive Trigger**
- **Function**: Monitor company-specific folders for document changes
- **Technology**: n8n native Google Drive trigger
- **Output**: Document metadata, file content, company identification
- **Configuration**: Company folder monitoring with push notifications

#### **Node 2: Extract From File**  
- **Function**: Extract text content from multiple document formats
- **Technology**: n8n native Extract From File node
- **Supported Formats**: PDF, Excel (.xlsx), Word (.docx), PowerPoint (.pptx)
- **Output**: Raw text content with metadata preservation

#### **Node 3: Metric Extraction (Code Node)**
- **Function**: Extract financial metrics using proven regex patterns
- **Technology**: JavaScript Code Node with Phase 1 MetricExtractor.js logic
- **Accuracy**: 89.6% (validated in Phase 1)
- **Output**: Structured financial metrics with confidence scores
- **Patterns**: Revenue, valuation, ARR, growth rates, customer counts, burn rate

#### **Node 4: LLM Validation (OpenAI Node)**
- **Function**: Validate and enhance regex extraction results
- **Technology**: OpenAI GPT-4 integration
- **Purpose**: Derek's suggested enhancement for improved accuracy
- **Expected Improvement**: 10-15% accuracy boost over regex-only
- **Output**: Validated metrics with additional context and corrections

#### **Node 5: Google Sheets Update**
- **Function**: Store metrics in time-series state database
- **Technology**: n8n Google Sheets node with Phase 1 StateDatabase.js logic
- **Operations**: Append metrics, calculate deltas, update metadata
- **Schema**: Based on Phase 1 DatabaseSchema.js specifications
- **Output**: Database confirmation and delta calculations

#### **MVP Configuration Example**
```javascript
// n8n Workflow Configuration
{
  "nodes": [
    {
      "name": "Google Drive Trigger",
      "type": "Google Drive Trigger",
      "parameters": {
        "watchFor": "fileAdded,fileUpdated",
        "folderPath": "/Private Companies/{company}/"
      }
    },
    {
      "name": "Extract From File",
      "type": "Extract From File",
      "parameters": {
        "formats": ["pdf", "xlsx", "docx", "pptx"],
        "extractText": true
      }
    },
    {
      "name": "Metric Extraction",
      "type": "Code",
      "parameters": {
        "jsCode": "// MetricExtractor.js patterns from Phase 1\n// 89.6% accuracy regex patterns\nconst patterns = { revenue: [...], valuation: [...] };"
      }
    }
  ]
}
```

### **Future JavaScript Architecture Components (Phase 2+)**

#### **Enhanced AI Analysis Pipeline (Tasks 19-27)**
When the full JavaScript architecture is implemented, the system will include:

**6 Specialized AI Agents with Delta Intelligence:**
1. **Executive Summary Agent** - Enhanced with historical context
2. **Financial Analysis Agent** - Real-time delta calculation
3. **Market Analysis Agent** - Trend analysis and benchmarking  
4. **Investment Thesis Agent** - Progressive thesis evolution
5. **Recommendation Agent** - Evidence-based decision evolution
6. **NEW - State Analysis Agent** - Specialized delta intelligence expert

**Advanced Features (Future):**
- **Delta Calculation Engine** - Real-time metric change detection
- **Smart Notification System** - Priority-based alerting (>10% or >$1M changes)
- **Living Reports** - Visual delta intelligence dashboards
- **Portfolio Comparison** - Cross-company benchmarking
- **Enterprise Security** - Audit, encryption, compliance

#### **Phase 1 Foundation (Completed)**
The MVP leverages this proven foundation:
- ✅ **MetricExtractor.js** - 89.6% accuracy regex patterns
- ✅ **StateDatabase.js** - Google Sheets time-series operations
- ✅ **DatabaseSchema.js** - Comprehensive data schemas
- ✅ **CircuitBreaker.js** - Resilience patterns
- ✅ **CompanySpreadsheetProvisioner.js** - Automated setup
- ✅ **MonitoringService.js** - System health tracking

### **Document Processing Capabilities**

#### **MVP Document Support (n8n Extract From File)**
**Supported Formats:**
- **PDF Documents** - SEC filings, earnings reports, audit reports
- **Excel Spreadsheets (.xlsx)** - Financial models, data sheets  
- **Word Documents (.docx)** - Analysis reports, memos
- **PowerPoint Presentations (.pptx)** - Investor decks, presentations

**Processing Features:**
- Native n8n optimization for large files
- Automatic format detection and error handling
- Memory-efficient processing
- Metadata preservation for document lineage

#### **Future Document Processing (Phase 2+)**
**Enhanced Capabilities:**
- Custom extraction algorithms
- Advanced OCR for scanned documents
- Table and chart extraction
- Multi-language document support
- Confidence scoring for extraction quality

#### Document Processing Pipeline
```javascript
// Document processing workflow for company-specific analysis
async function processCompanyDocument(fileId, companyName, fileName) {
    // Step 1: Extract content based on document type
    const content = await extractDocumentContent(fileId, fileName);
    
    // Step 2: Associate with company context
    const companyContext = await getExistingAnalysis(companyName);
    
    // Step 3: Route to appropriate AI agents
    const analysisUpdates = await routeToAIAgents(content, companyContext);
    
    // Step 4: Update living analysis report
    const updatedAnalysis = await updateCompanyAnalysis(
        companyName, 
        analysisUpdates, 
        fileName
    );
    
    return {
        company: companyName,
        newDocument: fileName,
        analysisUpdates: updatedAnalysis,
        documentType: getDocumentType(fileName)
    };
}
```

### 4. Report Generation

#### Report Structure
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Professional styling */
        .recommendation-deep-dive { color: green; }
        .recommendation-pursue { color: orange; }
        .recommendation-pass { color: red; }
    </style>
</head>
<body>
    <h1>Investment Analysis: [Company Name]</h1>
    
    <section id="executive-summary">
        <!-- AI-generated summary -->
    </section>
    
    <section id="financial-highlights">
        <!-- Key metrics and charts -->
    </section>
    
    <section id="market-analysis">
        <!-- Competitive positioning -->
    </section>
    
    <section id="investment-thesis">
        <!-- Bull/bear cases -->
    </section>
    
    <section id="recommendation">
        <!-- Clear next steps -->
    </section>
</body>
</html>
```

---

## Workflow Documentation

### Main PE Analysis Workflow

#### Trigger Configuration
```json
{
  "method": "POST",
  "path": "/pe-analysis",
  "authentication": "none",
  "responseMode": "lastNode"
}
```

#### Input Schema
```json
{
  "company": "string (required)",
  "ticker": "string (required)",
  "analysisType": "comprehensive | quick | deep-dive",
  "focusAreas": ["financials", "market", "competition"],
  "timeframe": "1Y | 3Y | 5Y"
}
```

#### Output Schema
```json
{
  "status": "success | error",
  "analysisId": "uuid",
  "timestamp": "ISO 8601",
  "company": {
    "name": "string",
    "ticker": "string"
  },
  "recommendation": "DEEP_DIVE | PURSUE | PASS",
  "executiveSummary": "string",
  "financialHighlights": {},
  "marketAnalysis": {},
  "investmentThesis": {},
  "nextSteps": []
}
```

### Error Handling

#### Common Errors and Solutions
| Error | Cause | Solution |
|-------|-------|----------|
| Document Not Found | No files in Drive | Check folder permissions |
| API Rate Limit | Too many requests | Implement exponential backoff |
| GPT-4 Timeout | Large document | Split into chunks |
| Email Failed | SMTP issues | Check Gmail API settings |

#### Retry Logic
```javascript
// n8n expression for retry configuration
{
  "maxTries": 3,
  "waitBetweenTries": 5000,
  "continueOnFail": false
}
```

---

## AI Integration

### MCP Server Ecosystem

#### Configured Servers
1. **TaskMaster AI** - Project management
2. **n8n MCP** - Workflow control
3. **Context7** - Documentation lookup
4. **Brave Search** - Web research
5. **GitHub** - Code management
6. **Microsoft Docs** - Technical reference

#### MCP Configuration
```json
{
  "mcpServers": {
    "taskmaster-ai": {
      "command": "npx",
      "args": ["-y", "--package=task-master-ai", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
      }
    },
    "n8n-mcp": {
      "command": "npx",
      "args": ["@n8n/n8n-mcp"],
      "env": {
        "N8N_API_URL": "${N8N_API_URL}",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    }
  }
}
```

### Claude Code Integration

#### Custom Commands
`.claude/commands/analyze-company.md`:
```markdown
Trigger PE analysis for company: $ARGUMENTS

Steps:
1. Validate company name and ticker
2. Send webhook request to n8n
3. Monitor workflow execution
4. Display analysis results
```

#### Tool Allowlist
```json
{
  "allowedTools": [
    "mcp__taskmaster-ai__*",
    "mcp__n8n-mcp__*",
    "Bash(curl:*)",
    "Read",
    "Write"
  ]
}
```

### Task Master AI Workflow

#### Task Structure
```
1. Setup n8n Instance
   1.1 Install n8n locally
   1.2 Configure environment
   1.3 Import PE workflow
2. Configure Integrations
   2.1 Setup Google API
   2.2 Configure OpenAI
   2.3 Setup Brave Search
3. Implement Core Features
   3.1 Document processing
   3.2 AI analysis pipeline
   3.3 Report generation
```

#### Commands
```bash
# Initialize project
task-master init

# Parse requirements
task-master parse-prd .taskmaster/docs/prd.txt

# Track progress
task-master next
task-master show 3.2
task-master set-status --id=3.2 --status=done

# Generate complexity report
task-master analyze-complexity --research
```

---

## Configuration Guide

### Environment Variables
```bash
# .env file
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Google APIs
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_DRIVE_FOLDER_ID=...

# Brave Search
BRAVE_API_KEY=...

# n8n Configuration
N8N_WEBHOOK_URL=https://...
N8N_API_KEY=...

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Task Master AI
ANTHROPIC_API_KEY=...
PERPLEXITY_API_KEY=...
```

### n8n Configuration

#### Credentials Setup
1. **OpenAI**: API key with GPT-4 access
2. **Google OAuth2**: Drive and Gmail scopes
3. **Brave Search**: API subscription
4. **SMTP**: Gmail app password

#### Workflow Variables
```javascript
// Global workflow settings
{
  "maxAnalysisTime": 300000,  // 5 minutes
  "parallelAgents": 5,
  "retryAttempts": 3,
  "emailRecipients": ["team@company.com"],
  "reportFormat": "html"
}
```

### Security Configuration

#### API Key Management
- Store keys in environment variables
- Never commit `.env` to repository
- Rotate keys regularly
- Use separate keys for dev/prod

#### Access Control
```yaml
# n8n user permissions
admin:
  - workflow:create
  - workflow:execute
  - credential:manage

analyst:
  - workflow:execute
  - workflow:read

viewer:
  - workflow:read
```

---

## Development Guide

### Project Structure
```
pe-eval/
├── .taskmaster/          # Task Master AI configuration
│   ├── config.json       # Model settings
│   ├── tasks/           # Task definitions
│   └── docs/            # PRDs and specs
├── .claude/             # Claude Code settings
│   ├── settings.json    # Tool permissions
│   └── commands/        # Custom commands
├── .mcp.json           # MCP server config
├── src/                # Source code (future)
│   ├── workflows/      # n8n workflow definitions
│   ├── agents/         # AI agent configurations
│   └── utils/          # Helper functions
├── docs/               # Documentation
├── tests/              # Test suites
└── .env               # Environment variables
```

### Development Workflow

#### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/enhanced-analysis

# Get next task
task-master next

# Start Claude Code
claude

# Implement feature
# Test locally
# Commit changes
git commit -m "feat: add enhanced financial analysis"
```

#### 2. Testing Strategy
```javascript
// Unit test example
describe('Financial Analyzer', () => {
  test('extracts revenue correctly', () => {
    const data = parseFinancials(mockDocument);
    expect(data.revenue).toBe(1000000);
  });
});

// Integration test
describe('PE Analysis Workflow', () => {
  test('completes full analysis', async () => {
    const result = await triggerWorkflow({
      company: 'Test Corp',
      ticker: 'TEST'
    });
    expect(result.recommendation).toBeDefined();
  });
});
```

#### 3. Deployment Process
1. Test in development n8n instance
2. Export workflow JSON
3. Import to production instance
4. Update environment variables
5. Run smoke tests
6. Monitor execution

### Coding Standards

#### JavaScript/TypeScript
```javascript
// Use async/await for promises
async function analyzeCompany(ticker) {
  try {
    const data = await fetchFinancials(ticker);
    const analysis = await runAIAnalysis(data);
    return analysis;
  } catch (error) {
    logger.error('Analysis failed', { ticker, error });
    throw error;
  }
}

// Proper error handling
class AnalysisError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
```

#### n8n Best Practices
- Use proper node naming conventions
- Add descriptions to all nodes
- Implement error handling
- Use environment variables
- Document complex expressions

---

## API Reference

### Webhook API

#### POST /webhook/pe-analysis
Triggers comprehensive PE analysis workflow.

**Request:**
```http
POST /webhook/pe-analysis
Content-Type: application/json

{
  "company": "Apple Inc",
  "ticker": "AAPL",
  "analysisType": "comprehensive",
  "focusAreas": ["financials", "competition"],
  "timeframe": "3Y"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "workflowId": "abc123",
  "message": "Analysis initiated",
  "estimatedTime": 180
}
```

### Internal APIs

#### Document Processor
```javascript
class DocumentProcessor {
  /**
   * Extract text from various document formats
   * @param {Buffer} file - File buffer
   * @param {string} mimeType - File MIME type
   * @returns {Promise<string>} Extracted text
   */
  async extractText(file, mimeType) { }
  
  /**
   * Parse financial metrics from text
   * @param {string} text - Document text
   * @returns {Promise<FinancialMetrics>} Parsed metrics
   */
  async parseFinancials(text) { }
}
```

#### AI Agent Interface
```javascript
interface AIAgent {
  name: string;
  model: string;
  temperature: number;
  maxTokens: number;
  
  analyze(input: AnalysisInput): Promise<AnalysisOutput>;
  validate(output: AnalysisOutput): boolean;
}
```

---

## Best Practices

### Workflow Design
1. **Modular Design**: Break complex workflows into sub-workflows
2. **Error Handling**: Implement try-catch blocks in all nodes
3. **Logging**: Add logging nodes for debugging
4. **Testing**: Test each node individually before full workflow
5. **Documentation**: Comment complex expressions

### AI Prompt Engineering
```
Best Practices:
- Be specific and detailed in instructions
- Provide examples of desired output format
- Use temperature 0.7 for creative tasks, 0.3 for analytical
- Set appropriate max_tokens limits
- Include validation criteria in prompts
```

### Performance Optimization
| Area | Optimization | Impact |
|------|-------------|---------|
| Document Processing | Parallel processing | 3x faster |
| AI Calls | Batch requests | 50% cost reduction |
| Database | Caching results | 10x query speed |
| Email | Queue management | Reliable delivery |

### Security Guidelines
1. **API Keys**: Rotate every 90 days
2. **Data**: Encrypt sensitive information
3. **Access**: Implement role-based access
4. **Audit**: Log all analysis requests
5. **Compliance**: Follow data retention policies

---

## Troubleshooting

### Common Issues

#### Issue: Workflow Timeout
**Symptoms**: Analysis doesn't complete within 5 minutes
**Causes**: 
- Large documents
- API rate limits
- Network issues

**Solutions**:
```javascript
// Increase timeout in workflow settings
{
  "executionTimeout": 600  // 10 minutes
}

// Implement chunking for large documents
const chunks = splitDocument(largeDoc, 4000);
const results = await Promise.all(
  chunks.map(chunk => analyzeChunk(chunk))
);
```

#### Issue: GPT-4 Rate Limits
**Symptoms**: 429 errors from OpenAI
**Solutions**:
```javascript
// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw error;
      }
    }
  }
}
```

#### Issue: Document Not Found
**Symptoms**: Google Drive returns empty results
**Debugging Steps**:
1. Check folder permissions
2. Verify OAuth scopes
3. Test with known document
4. Check search query syntax

### Debug Mode

Enable detailed logging:
```javascript
// n8n workflow expression
{
  "debug": true,
  "logLevel": "verbose",
  "saveExecutionData": true
}
```

### Support Resources
- **GitHub Issues**: [github.com/yandifarinango/pe-eval/issues](https://github.com/yandifarinango/pe-eval/issues)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)
- **Task Master Docs**: [taskmaster.ai/docs](https://taskmaster.ai/docs)

---

## Appendices

### A. Glossary

| Term | Definition |
|------|------------|
| **PE** | Private Equity - Investment in private companies |
| **DD** | Due Diligence - Investigation before investment |
| **TAM** | Total Addressable Market - Market size |
| **LTV** | Lifetime Value - Customer value over time |
| **CAC** | Customer Acquisition Cost |
| **MCP** | Model Context Protocol - AI tool integration |
| **n8n** | Workflow automation platform |

### B. Sample Analysis Output

```json
{
  "company": "Example Corp",
  "ticker": "EXMP",
  "date": "2025-08-15",
  "recommendation": "PURSUE",
  "executiveSummary": "Example Corp presents a compelling mid-market opportunity...",
  "financialHighlights": {
    "revenue": "$500M",
    "growth": "25% YoY",
    "ebitda": "$100M",
    "margins": "20%"
  },
  "marketAnalysis": {
    "tam": "$10B",
    "marketShare": "5%",
    "competitors": ["CompA", "CompB"],
    "moat": "Strong brand and network effects"
  },
  "investmentThesis": {
    "bull": "Market leader with expansion opportunity",
    "bear": "Competition from tech giants",
    "valuation": "8-10x EBITDA"
  },
  "risks": [
    "Regulatory changes",
    "Market saturation",
    "Technology disruption"
  ],
  "nextSteps": [
    "Schedule management presentation",
    "Conduct customer reference calls",
    "Review detailed financials"
  ]
}
```

### C. Workflow Templates

#### Quick Analysis Template
- Skip document search
- Use cached financial data
- 3 AI agents instead of 5
- 2-minute completion time

#### Deep Dive Template
- Extended document search
- 10 AI agents with specialized roles
- Competitor analysis included
- 15-minute completion time

#### Portfolio Monitoring Template
- Batch analysis of multiple companies
- Comparative metrics
- Trend analysis
- Weekly scheduled execution

### D. Integration Examples

#### Slack Integration
```javascript
// Send notifications to Slack
const slackWebhook = 'https://hooks.slack.com/...';
await fetch(slackWebhook, {
  method: 'POST',
  body: JSON.stringify({
    text: `New PE Analysis: ${company} - ${recommendation}`
  })
});
```

#### Database Storage
```sql
-- Store analysis results
INSERT INTO analyses (
  company_name,
  ticker,
  analysis_date,
  recommendation,
  summary,
  metrics
) VALUES (?, ?, ?, ?, ?, ?);
```

#### Dashboard Integration
```javascript
// Push metrics to monitoring dashboard
const metrics = {
  analysisCount: dailyCount,
  avgProcessingTime: avgTime,
  successRate: successCount / totalCount
};
await pushToDatadog(metrics);
```

---

*Last Updated: August 2025*
*Version: 1.0.0*
*Maintained by: PE-Eval Development Team*