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

**PE-Eval** is an advanced AI-powered automation platform for institutional private equity investment analysis, deal flow management, and portfolio monitoring.

### Core Value Proposition
- **90% reduction** in manual research time
- **24/7 automated** investment analysis capability
- **Standardized** analysis framework across all deals
- **AI-powered insights** from GPT-4 and Claude models

### Key Features
- 🤖 Multi-agent AI analysis pipeline
- 📊 Automated financial document processing
- 🔍 Intelligent market research and competitive analysis
- 📈 Investment thesis generation and recommendations
- 📧 Professional report generation and distribution
- 🔄 n8n workflow orchestration

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- API keys for: OpenAI, Google (Drive/Gmail), Brave Search
- n8n instance (local or cloud)
- Git for version control

### 30-Second Setup
```bash
# Clone repository
git clone https://github.com/yandifarinango/pe-eval.git
cd pe-eval

# Setup configurations
cp .env.example .env
cp .mcp.template.json .mcp.json
cp .claude/settings.template.json .claude/settings.json
cp .taskmaster/config.template.json .taskmaster/config.json

# Add your API keys to .env
# Configure Task Master
task-master init
task-master models --setup

# Test the system
claude  # Start Claude Code session
```

### First Analysis - ⚠️ CURRENTLY NOT FUNCTIONAL
**Before attempting analysis, be aware:**
- Workflow `EdcGmkQjHRqhcRIX` is INCOMPLETE and will NOT produce reports
- Only data collection components are working
- AI analysis and report generation are BROKEN

**For development/testing data collection only:**
1. Open n8n dashboard
2. Import workflow ID: `EdcGmkQjHRqhcRIX`
3. Configure webhook trigger (if attempting to test data collection)
4. Send test request (will only collect data, not generate analysis):
```json
{
  "company_name": "Apple Inc",
  "ticker": "AAPL",
  "analysis_depth": "deep_dive"
}
```

**Expected Result**: Data collection will work, but workflow will fail at AI analysis step.

---

## Architecture

### System Architecture
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Webhook        │────▶│  n8n         │────▶│  AI Agents  │
│  Trigger        │     │  Orchestrator│     │  (GPT-4)    │
└─────────────────┘     └──────────────┘     └─────────────┘
                               │                     │
                               ▼                     ▼
                        ┌──────────────┐     ┌─────────────┐
                        │  Google      │     │  Report     │
                        │  Drive/Gmail │     │  Generation │
                        └──────────────┘     └─────────────┘
```

### Data Flow
1. **Input**: Company name and ticker via webhook
2. **Document Search**: Google Drive financial documents
3. **Web Research**: Brave Search API for market data
4. **AI Analysis**: 5 parallel GPT-4 agents
5. **Report Generation**: HTML formatted investment report
6. **Distribution**: Automated email to investment team

### Technology Stack/sc
| Layer | Technology | Purpose |
|-------|------------|---------|
| Orchestration | n8n | Workflow automation |
| AI Models | OpenAI GPT-4 | Financial analysis |
| Search | Brave API | Market research |
| Storage | Google Drive | Document repository |
| Communication | Gmail | Report distribution |
| Development | Claude Code | AI-assisted coding |
| Task Management | Task Master AI | Project tracking |

---

## Core Components

### 1. n8n Workflow Engine
**Workflow ID**: `EdcGmkQjHRqhcRIX`

### ⚠️ **CRITICAL WORKFLOW STATUS**
**Current State**: INCOMPLETE/BROKEN - Cannot execute end-to-end PE analysis
**Validation Status**: FAILED (27 errors, 14 warnings)
**Workflow Active**: NO

#### Actual Workflow Nodes (13 total)

**✅ WORKING NODES:**
1. **PE Analysis Trigger** (webhook) - Accepts POST requests to `/institutional-pe-analysis`
2. **Extract & Validate Input** (code) - Validates company_name, ticker, analysis parameters
3. **Search Financial Documents** (googleDrive) - Searches Drive for financial documents
4. **Search Market Research** (googleDrive) - Searches Drive for market research
5. **Web Financial Research** (httpRequest) - Brave Search API for web research
6. **Process Document Data** (code) - Consolidates all collected data

**❌ DISCONNECTED/BROKEN NODES:**
7. **📊 Executive Summary AI** (openAI) - GPT-4 agent (NOT CONNECTED)
8. **💰 Financial Highlights AI** (openAI) - GPT-4 agent (NOT CONNECTED)
9. **🌍 Market Analysis AI** (openAI) - GPT-4 agent (NOT CONNECTED)
10. **⚖️ Investment Thesis AI** (openAI) - GPT-4 agent (NOT CONNECTED)
11. **🎯 Recommendations AI** (openAI) - GPT-4 agent (NOT CONNECTED)
12. **📧 Institutional HTML Formatter** (code) - Report generation (NOT CONNECTED)
13. **📤 Send Institutional Email** (gmail) - Email distribution (NOT CONNECTED)

#### Critical Issues
- **Missing Connections**: AI agents cannot receive data from processing step
- **Broken Pipeline**: HTML formatter cannot access AI outputs
- **No Error Handling**: All external service calls lack error handling
- **Inactive State**: Workflow cannot be triggered in current state

#### Configuration Variables
```javascript
// Webhook URL
WEBHOOK_URL = "https://your-n8n-instance.com/webhook/pe-analysis"

// Google Drive Folder ID
DRIVE_FOLDER_ID = "your-folder-id-here"

// Email Recipients
RECIPIENTS = ["investment-team@company.com"]
```

### 2. AI Analysis Pipeline

#### Agent Roles and Prompts

**Executive Summary Agent**
```
Role: Generate high-level investment overview
Input: Company data, financials, market research
Output: 2-3 paragraph executive summary
Focus: Key investment highlights and risks
```

**Financial Analysis Agent**
```
Role: Extract and analyze financial metrics
Input: 10-K, 10-Q, earnings reports
Output: Key metrics, trends, ratios
Focus: Revenue growth, margins, cash flow
```

**Market Analysis Agent**
```
Role: Assess competitive positioning
Input: Industry reports, competitor data
Output: Market size, growth, competitive advantages
Focus: TAM, market share, moats
```

**Investment Thesis Agent**
```
Role: Develop investment rationale
Input: All previous analyses
Output: Bull/bear case, opportunities
Focus: Value creation potential
```

**Recommendation Agent**
```
Role: Provide actionable next steps
Input: Complete analysis
Output: DEEP DIVE / PURSUE / PASS
Focus: Clear recommendation with rationale
```

### 3. Document Processing

#### Supported Document Types
- SEC Filings (10-K, 10-Q, 8-K)
- Earnings Reports and Transcripts
- Investor Presentations
- Industry Research Reports
- Financial Statements (PDF/Excel)

#### Data Extraction Pipeline
```python
# Pseudo-code for document processing
def process_document(file):
    content = extract_text(file)
    metrics = extract_financial_metrics(content)
    insights = generate_ai_insights(content)
    return {
        'metrics': metrics,
        'insights': insights,
        'source': file.name
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