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

## 🔄 Document-Driven Architecture Status (Enhanced with State Management)

### New Architecture Implementation
- **Document Monitoring**: Google Drive push notifications for real-time triggers
- **Company Folders**: Each private company has dedicated Google Drive folder structure
- **Multi-Format Processing**: PDF, Excel, Word, PowerPoint document extraction with metric parsing
- **NEW - State Management**: Append-only time-series database for metric tracking
- **NEW - Delta Intelligence**: Real-time metric change calculation and alerts
- **Status**: 🔧 **ACTIVE DEVELOPMENT** - Transitioning from webhook to document-driven + state management system

### 🔄 Architecture Transition Progress
**Migration Status**: Moving from manual webhook triggers to automated document monitoring with delta intelligence

**New Document-Driven + State Management Components:**
🔧 **Google Drive Webhook Handler**: Receives push notifications for document changes
🔧 **Company Folder Mapper**: Maps documents to specific company analysis pipelines  
🔧 **Document Type Classifier**: Identifies and routes PDF, Excel, Word documents
✅ **Multi-Format Extractors**: Text extraction from various document formats
📋 **NEW - Metric Extraction Engine**: Financial metric pattern recognition and extraction
📋 **NEW - State Database Manager**: Append-only Google Sheets time-series storage
📋 **NEW - Delta Calculator**: Real-time metric change analysis and significance scoring
✅ **AI Agent Enhancement**: Document-aware analysis prompts with historical context
🔧 **Living Report System**: Progressive analysis updates with delta intelligence visualization

### Document Processing Architecture (Enhanced)
**New Working Flow with State Management:**
```
Company Document Upload → Google Drive Push Notification → n8n Webhook Handler 
→ Document Type Detection → Content Extraction → Metric Extraction
→ State Database Update → Delta Calculation → Historical Context Integration
→ 6 Enhanced AI Agents (with Delta Intelligence) → Living Report Updates → Smart Notifications
```

**Company Folder Structure (Enhanced):**
```
Private Equity Analysis/
├── CompanyA/ (folder ID: monitored for changes)
│   ├── Q1_2024_financials.pdf → extracts revenue metrics → calculates deltas
│   ├── Q2_2024_earnings.pdf → detects +$10M revenue → triggers high-priority alert
│   └── market_research.pdf → triggers Market agent
├── CompanyB/ (folder ID: monitored for changes)  
│   ├── investor_deck.pptx → extracts valuation data → updates state database
│   └── financial_model.xlsx → comprehensive metrics → historical trend analysis
└── System/State-Database/ (Google Sheets)
    ├── CompanyA-Metrics/ (revenue_history, valuation_history, kpi_snapshots)
    ├── CompanyB-Metrics/ 
    └── Delta-Intelligence/ (monthly_deltas, trend_analysis, alert_triggers)
```

### Enhanced Integration Points
- **Google Drive API**: ✅ Real-time document change monitoring with push notifications
- **Google Sheets API**: 📋 NEW - Time-series state database for append-only metric storage
- **Document Processing**: ✅ Multi-format text extraction with financial metric pattern recognition
- **AI Agent Coordination**: 🔧 Document-specific analysis routing with historical context integration
- **Living Reports**: 🔧 Version-controlled analysis with delta intelligence visualization
- **Company Intelligence**: 🔧 Progressive analysis enhancement per company folder with metric evolution
- **Delta Intelligence Engine**: 📋 NEW - Real-time metric change calculation and trend analysis
- **Smart Alert System**: 📋 NEW - Priority-based notifications for significant metric changes

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

**Next Steps**: Complete document monitoring implementation, deploy Google Sheets state database, implement metric extraction and delta calculation engines, enhance AI agents for document-aware analysis with historical context, and deploy living analysis report system with delta intelligence visualization.

---

*Context Map Generated: August 2025*  
*Claude Code Session: PE-Eval Project Loading*  
*Total Files Analyzed: 72 files across 6 categories*