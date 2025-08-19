# PE-Eval Project Context Map

## 📋 Project Overview
**PE-Eval** is an AI-powered automation platform for private equity investment analysis, featuring n8n workflow orchestration, multi-agent AI analysis, and comprehensive task management.

## 🎯 Project Status
- **Type**: Learning/Development Platform
- **Stage**: Configuration & Setup Phase
- **Primary Focus**: AI workflow automation for PE analysis
- **Repository**: Public learning resource with private configurations

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

## 🔄 Workflow Integration Status

### n8n Automation Platform
- **Workflow ID**: `EdcGmkQjHRqhcRIX` (Institutional PE Analysis)
- **Connection**: Docker-based MCP server configured
- **API Access**: Configured with JWT token
- **Status**: ⚠️ **DEVELOPMENT/INCOMPLETE** - Critical workflow issues identified

### ⚠️ Workflow Analysis Results
**Validation Status**: FAILED (27 errors, 14 warnings)

**Working Components:**
✅ Webhook trigger (POST /institutional-pe-analysis)
✅ Data collection (Google Drive search for financial docs)
✅ Market research (Brave Search API integration)
✅ Input validation and processing

**Broken/Incomplete Components:**
❌ **AI Analysis Pipeline**: 5 GPT-4 agents exist but are DISCONNECTED
❌ **Report Generation**: HTML formatter not connected to AI outputs
❌ **Email Distribution**: Gmail sender not connected to workflow
❌ **Error Handling**: Missing throughout workflow
❌ **Workflow State**: Currently inactive

### Current Architecture Reality
**Actual Working Flow:**
```
Webhook → Input Validation → Parallel Data Collection → Data Processing → [BROKEN CHAIN]
                                   ↓
                    [5 Disconnected AI Agents - Cannot Execute]
                                   ↓
                    [Disconnected HTML Formatter & Email]
```

**Planned Architecture (Not Implemented):**
1. Executive Summary Generator (GPT-4)
2. Financial Metrics Analyzer (GPT-4)
3. Market Intelligence Agent (GPT-4)
4. Investment Thesis Developer (GPT-4)
5. Recommendation Engine (GPT-4)

### Data Integration Points
- **Google Drive**: ✅ Document repository access (WORKING)
- **Gmail**: ⚠️ Report distribution system (CONFIGURED BUT DISCONNECTED)
- **Brave Search**: ✅ Market research API (WORKING)
- **Webhook Triggers**: ✅ External analysis requests (WORKING)

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
1. **PE Investment Analysis** - Automated company research and evaluation
2. **AI Tool Learning** - Educational platform for AI-assisted development
3. **Workflow Automation** - n8n-based business process automation
4. **Task Management** - AI-powered project tracking and planning

### Target Workflows
```bash
# Daily Development Workflow
task-master next                    # Get next task
claude                             # Start AI development session
# Implement features with AI assistance
task-master set-status --id=X --status=done

# PE Analysis Workflow  
# Trigger via webhook: POST /webhook/pe-analysis
# Automated: Document search → AI analysis → Report generation
```

### Learning Objectives
- **Technical**: n8n workflows, MCP integration, AI orchestration
- **Business**: PE analysis automation, investment research
- **AI Tools**: Claude Code, TaskMaster AI, multi-agent systems

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

# n8n Workflow
curl -X POST webhook-url \        # Trigger PE analysis
  -d '{"company":"Apple","ticker":"AAPL"}'
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

**PE-Eval** is a sophisticated AI automation platform in active development, configured for private equity investment analysis through n8n workflows and multi-agent AI systems. The project demonstrates advanced integration of AI tools (Claude Code, TaskMaster AI) with workflow automation (n8n) and protocol-based tool communication (MCP servers).

**Current Status**: Configuration phase with functional AI tool integration, ready for workflow development and PE analysis implementation.

**Next Steps**: Secure API key management, implement core PE analysis workflows, and expand AI agent capabilities.

---

*Context Map Generated: August 2025*  
*Claude Code Session: PE-Eval Project Loading*  
*Total Files Analyzed: 72 files across 6 categories*