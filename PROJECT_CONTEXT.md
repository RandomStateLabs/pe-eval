# PE-Eval Project Context Map

## 📋 Project Overview
**PE-Eval** is a document-driven AI automation platform for private equity investment analysis, featuring Google Drive monitoring, real-time document processing with state management, and living analysis reports that provide instant metric intelligence and evolve with new documents.

## 🎯 Project Status
- **Type**: Document-Driven Investment Analysis Platform with Delta Intelligence
- **Stage**: Architecture Transition Phase (Webhook → Document-Driven + State Management)
- **Primary Focus**: Real-time document monitoring, metric extraction, delta calculation, and progressive analysis enhancement
- **Architecture**: Company-specific Google Drive folders with push notification triggers and append-only state database
- **NEW Enhancement**: Time-series state management for instant metric change detection

---

## 🗂 Project Structure Analysis

### Core Files (6)
```
📄 CLAUDE.md                     # Main project Claude instructions
📄 README.md                     # Setup guide and project overview  
📄 PROJECT_OVERVIEW.md           # Executive summary and architecture
📄 MCP_DOCUMENTATION.md          # MCP server integration guide
📄 DOCUMENTATION.md              # Comprehensive technical documentation
📄 claude-desktop-config-review.md # Configuration review notes
```

### Configuration Management
```
🔧 .env.example                  # API key template (12 providers)
🔧 .mcp.json                     # Active MCP server configuration
🔧 .mcp.template.json            # MCP configuration template
🔧 .gitignore                    # Security-focused ignore rules
```

### TaskMaster AI Integration (5 files)
```
📁 .taskmaster/
  ├── 🎯 config.json             # AI model configuration (Claude Sonnet 4)
  ├── 🎯 config.template.json    # Model configuration template
  ├── 📋 state.json              # Project state management
  ├── 📄 CLAUDE.md               # TaskMaster integration guide
  └── 📁 templates/
      └── example_prd.txt        # PRD template for task generation
```

### Claude Code Integration (60+ files)
```
📁 .claude/
  ├── ⚙️ settings.local.json     # Active Claude settings
  ├── ⚙️ settings.template.json  # Claude settings template
  ├── 📋 TM_COMMANDS_GUIDE.md    # TaskMaster command reference
  └── 📁 commands/tm/            # 57 custom slash commands
      ├── 📁 init/               # Project initialization
      ├── 📁 list/               # Task listing commands
      ├── 📁 set-status/         # Status management
      ├── 📁 expand/             # Task expansion
      ├── 📁 update/             # Task updates
      └── 📁 workflows/          # Advanced workflows
```

---

## ⚙️ Configuration Analysis

### Environment Variables (.env.example)
**12 AI Provider APIs Supported:**
- ✅ `ANTHROPIC_API_KEY` (Required - Claude models)
- 🔍 `PERPLEXITY_API_KEY` (Research features)
- 🤖 `OPENAI_API_KEY` (GPT models)
- 🔎 `GOOGLE_API_KEY` (Gemini models)
- ⚡ `MISTRAL_API_KEY` (Mistral models)
- 🚀 `XAI_API_KEY` (xAI models)
- 💨 `GROQ_API_KEY` (Groq models)
- 🌐 `OPENROUTER_API_KEY` (Multi-provider)
- ☁️ `AZURE_OPENAI_API_KEY` (Azure OpenAI)
- 🦙 `OLLAMA_API_KEY` (Local models)
- 🐙 `GITHUB_API_KEY` (GitHub integration)

### MCP Server Configuration (.mcp.json)
**7 Active MCP Servers:**
1. **task-master-ai** - Project management (⚠️ API key exposed)
2. **microsoft-docs** - Documentation lookup
3. **context7** - Library documentation
4. **brave-search** - Web search (⚠️ API key exposed)
5. **github** - Repository operations (⚠️ API key exposed)
6. **mcp-obsidian** - Note management
7. **n8n-mcp** - Workflow orchestration (⚠️ API key exposed)

⚠️ **Security Alert**: API keys are hardcoded in .mcp.json - should use environment variables

### TaskMaster AI Configuration
**Model Setup (config.json):**
- **Main Model**: Claude Sonnet 4 (anthropic)
- **Research Model**: Claude Code Sonnet (claude-code)
- **Fallback Model**: Claude Sonnet 4 (anthropic)
- **Settings**: Conservative temperature (0.1-0.2), max 64K tokens

### Claude Code Settings
**Permissions (settings.local.json):**
- ✅ Context7 library resolution
- ✅ TaskMaster AI task operations
- ✅ Microsoft Docs search
- ✅ Brave Search web queries
- ✅ GitHub repository operations
- ✅ Obsidian note access
- ❌ TaskMaster AI MCP disabled (intentional)

---

## 🚨 Security & Configuration Issues

### Critical Security Concerns
1. **API Keys Exposed** - .mcp.json contains hardcoded API keys
2. **Private Data Committed** - .gitignore present but some sensitive files may be tracked
3. **Token Exposure** - GitHub PAT and other tokens visible in configuration

### Configuration Inconsistencies
1. **TaskMaster MCP Disabled** - Listed in .mcp.json but disabled in settings
2. **Missing Dependencies** - No package.json for Node.js dependencies
3. **Template Mismatch** - Active configs don't match templates

### Recommended Actions
```bash
# Immediate security fixes
cp .mcp.json .mcp.json.backup
# Replace hardcoded keys with environment variables in .mcp.json

# Verify .gitignore compliance
git status --ignored

# Setup proper environment
cp .env.example .env
# Add real API keys to .env file
```

---

## 🔄 Dual-Track Implementation Status

### Current Architecture Implementation
- ✅ **Phase 1 Foundation**: State management with 89.6% metric extraction accuracy (COMPLETED)
- 🚀 **MVP Track**: 5-node n8n workflow for rapid deployment (CURRENT PRIORITY - Tasks 28-33)
- 📋 **Future Track**: Full JavaScript architecture with enterprise features (Tasks 19-27)
- **Document Monitoring**: Google Drive push notifications for real-time triggers
- **Company Folders**: Each private company has dedicated Google Drive folder structure  
- **MVP Processing**: n8n Extract From File node for PDF, Excel, Word, PowerPoint
- **MVP Intelligence**: LLM validation enhancing proven regex patterns
- **Status**: 🚀 **MVP IMPLEMENTATION** - 2-week n8n deployment using proven Phase 1 logic

### 🚀 MVP Implementation Progress (Current Priority)
**Status**: Implementing 5-node n8n workflow using proven Phase 1 foundation

**MVP n8n Workflow Components (Tasks 28-33):**
📋 **Task 28**: n8n Workflow Setup and API Configuration
📋 **Task 29**: Google Drive Trigger + Extract From File nodes  
📋 **Task 30**: Metric Extraction Code Node (MetricExtractor.js patterns)
📋 **Task 31**: LLM Validation via OpenAI node (Derek's suggestion)
📋 **Task 32**: Google Sheets operations (StateDatabase.js logic)
📋 **Task 33**: Error handling, monitoring, end-to-end testing

**Phase 1 Foundation (COMPLETED - Ready for MVP):**
✅ **MetricExtractor.js**: 89.6% accuracy regex patterns for financial metrics
✅ **StateDatabase.js**: Google Sheets time-series operations and delta calculations
✅ **DatabaseSchema.js**: Comprehensive schemas for all metric types
✅ **CircuitBreaker.js**: Resilience patterns and error handling
✅ **CompanySpreadsheetProvisioner.js**: Automated company setup workflows

### Document Processing Architecture (Dual-Track)

**MVP Workflow (Current - 2 weeks):**
```
Google Drive Document Change → n8n Trigger → Extract From File → Metric Extraction (Code Node)
→ LLM Validation (OpenAI) → Google Sheets Update → Alert Generation
```

**Future Workflow (Phase 2+ - 3-6 months):**
```
Company Document Upload → Google Drive Push Notification → n8n Webhook Handler 
→ Document Type Detection → Advanced Content Extraction → Enhanced Metric Extraction
→ State Database Update → Real-time Delta Calculation → Historical Context Integration
→ 6 Enhanced AI Agents (with Delta Intelligence) → Living Report Updates → Smart Notifications
```

**Company Folder Structure:**
```
Private Equity Analysis/
├── CompanyA/ (monitored by n8n Google Drive trigger)
│   ├── Q1_2024_financials.pdf → n8n workflow → metric extraction → Google Sheets
│   ├── Q2_2024_earnings.pdf → MVP: basic delta calculation
│   └── market_research.pdf → MVP: text extraction and basic analysis
├── CompanyB/ (monitored by n8n Google Drive trigger)  
│   ├── investor_deck.pptx → n8n Extract From File → LLM validation
│   └── financial_model.xlsx → proven regex patterns → 89.6% accuracy
└── State-Database/ (Google Sheets - Phase 1 foundation)
    ├── CompanyA-Metrics/ (revenue_history, valuation_history, kpi_snapshots)
    ├── CompanyB-Metrics/ (existing schemas from DatabaseSchema.js)
    └── MVP: Basic delta calculations with future enhancement to full intelligence
```

### Integration Points (Dual-Track)

**MVP Integration Points (Current):**
- **Google Drive API**: ✅ n8n native trigger for document monitoring
- **Google Sheets API**: ✅ n8n native node using Phase 1 StateDatabase.js logic  
- **Document Processing**: ✅ n8n Extract From File with native optimization
- **OpenAI API**: 📋 LLM validation integration for enhanced accuracy
- **Metric Extraction**: ✅ JavaScript Code Node with proven 89.6% accuracy patterns
- **n8n Platform**: 🚀 Visual workflow with managed infrastructure

**Future Integration Points (Phase 2+):**
- **Advanced Document Processing**: Enhanced multi-format extraction with confidence scoring
- **6 AI Agents**: Specialized agents with delta intelligence and historical context
- **Real-time Delta Engine**: Sophisticated metric change calculation and trend analysis
- **Smart Alert System**: Priority-based notifications for significant metric changes
- **Living Reports**: Version-controlled analysis with visual delta intelligence
- **Enterprise Features**: Security, audit, compliance, and production infrastructure

---

## 📊 Project Dependencies

### Runtime Dependencies
**MCP Servers (npx packages):**
- `task-master-ai` - Project management
- `mcp-remote` - Microsoft Docs access
- `@upstash/context7-mcp` - Library documentation
- `@modelcontextprotocol/server-brave-search` - Web search
- `@modelcontextprotocol/server-github` - GitHub integration
- `mcp-obsidian` - Note management

**Docker Dependencies:**
- `ghcr.io/czlonkowski/n8n-mcp:latest` - n8n workflow integration

### Development Dependencies
**AI Tools:**
- Claude Code (AI development assistant)
- TaskMaster AI (Project management)
- Cursor IDE (AI code editor)

**Version Control:**
- Git repository with selective .gitignore
- Public repository strategy with private configs

---

## 🎯 Usage Context

### Primary Use Cases (Enhanced with Delta Intelligence)
1. **Document-Driven PE Analysis with State Management** - Real-time investment analysis with instant metric intelligence
2. **Living Investment Intelligence** - Progressive analysis enhancement with historical context and trend analysis
3. **Multi-Company Portfolio Monitoring** - Cross-folder comparative analysis with delta intelligence
4. **Evidence-Based Investment Decisions** - Document-cited analysis with quantitative metric backing
5. **NEW - Instant Metric Monitoring** - Real-time awareness of financial performance changes
6. **NEW - Delta Intelligence Alerts** - Immediate notifications for significant metric changes

### Target Workflows (Enhanced)
```bash
# Enhanced Document-Driven Analysis Workflow with State Management
# 1. Upload financial document → Metric extraction → State database update
# 2. Delta calculation → Historical context integration → Smart alerts
# 3. 6 AI agents with historical awareness → Enhanced report with delta visualization

# Enhanced Daily Development Workflow  
task-master next                    # Get next task
claude                             # Start AI development session
# Implement state management and delta intelligence features
task-master set-status --id=X --status=done

# Enhanced Company Analysis Workflow with Delta Intelligence
# Real-time: Document upload → Metric extraction → Delta calculation → Smart alerts → Updated analysis
```

### Learning Objectives (Enhanced)
- **Technical**: Google Drive API, push notifications, document processing, real-time triggers, time-series databases, delta calculation
- **Business**: Document-driven investment analysis, progressive due diligence, metric intelligence, trend analysis
- **AI Tools**: Document-aware AI agents with historical context, living analysis reports, multi-format processing, delta intelligence
- **NEW - State Management**: Append-only databases, time-series analysis, metric extraction, delta intelligence systems

---

## 🔍 Quick Reference

### Key Commands
```bash
# TaskMaster AI
task-master init                   # Initialize project
task-master next                   # Get next task  
task-master show <id>              # View task details

# Claude Code
claude                            # Start AI session
claude --mcp-debug               # Debug MCP connections

# Document-Driven Analysis with Delta Intelligence (Enhanced)
# 1. Upload financial document to company folder in Google Drive
# 2. Push notification triggers n8n workflow with metric extraction
# 3. State database updated, deltas calculated, smart alerts triggered
# 4. Enhanced analysis with historical context happens automatically

# Google Drive Structure Setup (Enhanced)
mkdir "Private Equity Analysis/CompanyA"    # Create company folder
mkdir "System/State-Database/CompanyA-Metrics"  # State management setup
# Upload documents → Automatic metric extraction + delta intelligence
```

### Configuration Files Priority
1. `.env` (private API keys)
2. `.mcp.json` (active MCP config)
3. `.claude/settings.local.json` (Claude permissions)
4. `.taskmaster/config.json` (AI models)

### Documentation Hierarchy
1. `README.md` - Setup and overview
2. `PROJECT_OVERVIEW.md` - Executive summary
3. `DOCUMENTATION.md` - Technical reference
4. `MCP_DOCUMENTATION.md` - Integration guide
5. `.taskmaster/CLAUDE.md` - TaskMaster integration

---

## 📝 Project Context Summary (Enhanced with State Management)

**PE-Eval** is a sophisticated document-driven AI automation platform with state management capabilities, transitioning to real-time investment analysis with instant metric intelligence through Google Drive monitoring and intelligent document processing. The system enables private equity firms to create living analysis reports that automatically evolve as new financial documents are added to company-specific folders, while providing immediate awareness of metric changes like "Company revenue increased $10M since last quarter."

**Current Status**: Architecture transition phase - moving from manual webhook triggers to automated document-driven analysis with Google Drive push notifications, multi-format document processing, metric extraction, delta calculation, and historical context integration.

**Enhanced Features**: Time-series state database using Google Sheets for append-only metric storage, real-time delta intelligence for instant change detection, 6 AI agents with historical context awareness, and smart priority-based alerts for significant metric changes.

**Next Steps**: 
1. **Immediate (Tasks 28-33)**: Deploy MVP n8n workflow using Phase 1 foundation
2. **Short-term**: Validate MVP with real PE documents and user feedback  
3. **Medium-term**: Enhance MVP based on learnings and business requirements
4. **Long-term (Tasks 19-27)**: Migrate to full JavaScript architecture with enterprise features

**MVP Success Criteria**: >85% accuracy, <5 min processing time, >80% user satisfaction, clear migration path validation

---

*Context Map Generated: August 2025*  
*Claude Code Session: PE-Eval Project Loading*  
*Total Files Analyzed: 72 files across 6 categories*