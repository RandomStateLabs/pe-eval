# PE-Eval Project Context Map

## 📋 Project Overview
**PE-Eval** is a document-driven AI automation platform for private equity investment analysis, featuring Google Drive monitoring, real-time document processing, and living analysis reports that evolve with new documents.

## 🎯 Project Status
- **Type**: Document-Driven Investment Analysis Platform
- **Stage**: Architecture Transition Phase (Webhook → Document-Driven)
- **Primary Focus**: Real-time document monitoring and progressive analysis enhancement
- **Architecture**: Company-specific Google Drive folders with push notification triggers

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

## 🔄 Document-Driven Architecture Status

### New Architecture Implementation
- **Document Monitoring**: Google Drive push notifications for real-time triggers
- **Company Folders**: Each private company has dedicated Google Drive folder structure
- **Multi-Format Processing**: PDF, Excel, Word, PowerPoint document extraction
- **Status**: 🔧 **ACTIVE DEVELOPMENT** - Transitioning from webhook to document-driven system

### 🔄 Architecture Transition Progress
**Migration Status**: Moving from manual webhook triggers to automated document monitoring

**New Document-Driven Components:**
🔧 **Google Drive Webhook Handler**: Receives push notifications for document changes
🔧 **Company Folder Mapper**: Maps documents to specific company analysis pipelines  
🔧 **Document Type Classifier**: Identifies and routes PDF, Excel, Word documents
✅ **Multi-Format Extractors**: Text extraction from various document formats
✅ **AI Agent Enhancement**: Document-aware analysis prompts and processing
🔧 **Living Report System**: Progressive analysis updates with new document insights

### Document Processing Architecture
**New Working Flow:**
```
Company Document Upload → Google Drive Push Notification → n8n Webhook Handler 
→ Document Type Detection → Content Extraction → Company Analysis Router 
→ 5 Enhanced AI Agents → Living Report Updates → Team Notifications
```

**Company Folder Structure:**
```
Private Equity Analysis/
├── CompanyA/ (folder ID: monitored for changes)
│   ├── 10K_2024.pdf → triggers Financial + Executive agents
│   ├── earnings_Q3.pdf → triggers Financial + Thesis agents
│   └── market_research.pdf → triggers Market agent
├── CompanyB/ (folder ID: monitored for changes)  
│   ├── investor_deck.pptx → triggers Executive + Recommendation agents
│   └── financial_model.xlsx → triggers Financial agent
```

### Enhanced Integration Points
- **Google Drive API**: ✅ Real-time document change monitoring with push notifications
- **Document Processing**: ✅ Multi-format text extraction (PDF, Excel, Word, PowerPoint)
- **AI Agent Coordination**: 🔧 Document-specific analysis routing and processing
- **Living Reports**: 🔧 Version-controlled analysis that updates with new documents  
- **Company Intelligence**: 🔧 Progressive analysis enhancement per company folder

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

### Primary Use Cases
1. **Document-Driven PE Analysis** - Real-time investment analysis triggered by new documents
2. **Living Investment Intelligence** - Progressive analysis enhancement with document accumulation
3. **Multi-Company Portfolio Monitoring** - Cross-folder comparative analysis and tracking
4. **Evidence-Based Investment Decisions** - Document-cited analysis and recommendations

### Target Workflows
```bash
# Document-Driven Analysis Workflow
# 1. Upload financial document to company folder → Automatic analysis trigger
# 2. Google Drive push notification → n8n document processing
# 3. Multi-format extraction → AI agent analysis → Report updates

# Daily Development Workflow  
task-master next                    # Get next task
claude                             # Start AI development session
# Implement document processing features with AI assistance
task-master set-status --id=X --status=done

# Company Analysis Workflow
# Real-time: Document upload → Push notification → Analysis update → Team notification
```

### Learning Objectives
- **Technical**: Google Drive API, push notifications, document processing, real-time triggers
- **Business**: Document-driven investment analysis, progressive due diligence
- **AI Tools**: Document-aware AI agents, living analysis reports, multi-format processing

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

# Document-Driven Analysis (New)
# 1. Upload document to company folder in Google Drive
# 2. Push notification automatically triggers n8n workflow
# 3. Analysis updates happen automatically - no manual trigger needed

# Google Drive Structure Setup
mkdir "Private Equity Analysis/CompanyA"    # Create company folder
# Upload documents → Automatic analysis triggers
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

## 📝 Project Context Summary

**PE-Eval** is a sophisticated document-driven AI automation platform transitioning to real-time investment analysis through Google Drive monitoring and intelligent document processing. The system enables private equity firms to create living analysis reports that automatically evolve as new financial documents are added to company-specific folders.

**Current Status**: Architecture transition phase - moving from manual webhook triggers to automated document-driven analysis with Google Drive push notifications and multi-format document processing.

**Next Steps**: Complete document monitoring implementation, enhance AI agents for document-aware analysis, and deploy living analysis report system.

---

*Context Map Generated: August 2025*  
*Claude Code Session: PE-Eval Project Loading*  
*Total Files Analyzed: 72 files across 6 categories*