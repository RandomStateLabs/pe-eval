# PE-Eval: Document-Driven Private Equity Analysis Platform

Real-time document monitoring system that automatically generates living investment analysis when new financial documents are added to company-specific Google Drive folders.

## 🎯 Project Goals

1. **Document-Driven Analysis** - Automatically trigger updated analysis when new documents are added to company folders
2. **Living Intelligence Reports** - Create analysis that evolves and improves with each new document
3. **Real-Time Monitoring** - Use Google Drive push notifications for instant document change detection
4. **Multi-Format Processing** - Extract insights from PDF, Excel, Word, and PowerPoint documents
5. **AI-Powered Insights** - 5 specialized AI agents provide comprehensive document-based analysis

## 🛠 Setup Instructions

### 1. Clone and Basic Setup
```bash
git clone https://github.com/yandifarinango/pe-eval.git
cd pe-eval
```

### 2. Configure API Keys
```bash
# Copy template and add your keys
cp .env.example .env
# Edit .env with your actual API keys
```

### 3. Set Up AI Tool Configurations

#### Claude Code
```bash
# Copy template and customize
cp .claude/settings.template.json .claude/settings.json
# Customize tool allowlist and preferences
```

#### Task Master AI
```bash
# Copy template and configure models
cp .taskmaster/config.template.json .taskmaster/config.json
# Or use interactive setup:
task-master models --setup
```

#### MCP Servers
```bash
# Copy template and add API keys
cp .mcp.template.json .mcp.json
# Add your API keys to env vars section
```

## 📁 Project Structure

### **Committed Files** (Public Learning Resource)
```
├── README.md                          # This file
├── .gitignore                         # Protects private configs
├── .env.example                       # API key template
├── .claude/settings.template.json     # Claude Code config template
├── .taskmaster/
│   ├── config.template.json          # Task Master config template
│   ├── docs/                         # PRDs and documentation
│   ├── tasks/                        # Task definitions (sanitized)
│   └── CLAUDE.md                     # Project-specific Claude instructions
├── .mcp.template.json                 # MCP server config template
├── src/                              # PE automation source code
└── docs/                             # Learning documentation
```

### **Private Files** (Not Committed)
```
├── .env                              # Your actual API keys
├── .claude/settings.json             # Your personal Claude preferences  
├── .cursor/                          # Cursor IDE settings
├── .taskmaster/config.json           # Your model preferences & keys
└── .mcp.json                         # Your MCP config with API keys
```

## 🔄 Version Control Strategy

### Public Repository (this repo)
- **Purpose**: Learning resource and code sharing
- **Contents**: Code, documentation, sanitized configs
- **Audience**: Other developers learning AI coding

### Private Configuration Management

#### Option 1: Separate Private Repo (Recommended)
```bash
# Create private backup of configs
mkdir ~/.ai-configs-backup
cd ~/.ai-configs-backup
git init
cp ~/path/to/pe-eval/.claude/settings.json ./claude-settings.json
cp ~/path/to/pe-eval/.taskmaster/config.json ./taskmaster-config.json  
cp ~/path/to/pe-eval/.env ./env-vars
git add .
git commit -m "Private AI tool configurations backup"
```

#### Option 2: Local Git History
```bash
# Track private files in separate local branch
git checkout -b private-configs
git add .claude/settings.json .taskmaster/config.json .env .mcp.json
git commit -m "Private configurations"
git checkout main
# Private configs tracked locally, never pushed
```

#### Option 3: Symlinks to External Location
```bash
# Store configs outside project, symlink in
mkdir ~/.ai-tool-configs/pe-eval
mv .claude/settings.json ~/.ai-tool-configs/pe-eval/
ln -s ~/.ai-tool-configs/pe-eval/settings.json .claude/settings.json
# Configs tracked separately, symlinks work locally
```

## 🚀 Workflow

### Daily Development
1. `task-master next` - Get next task
2. `claude` - Start Claude Code session  
3. Work on task with AI assistance
4. `task-master set-status --id=X --status=done` - Mark complete
5. Document learnings and patterns

### Learning Documentation
- Document AI tool workflows in `/docs/workflows/`
- Record successful prompting patterns
- Note tool integration discoveries
- Share troubleshooting solutions

## 📊 Document-Driven Analysis System

### Architecture Transition: Webhook → Document Monitoring

### 🔄 **NEW ARCHITECTURE STATUS**
**Migrating from manual webhook triggers to automated document monitoring**

**Document-Driven Components:**
- 🔧 Google Drive push notifications for real-time document detection
- 🔧 Company-specific folder monitoring and routing
- 🔧 Multi-format document extraction (PDF, Excel, Word, PowerPoint)
- ✅ 5 AI agents enhanced for document-based analysis
- ✅ Living analysis reports with progressive enhancement
- 📋 Version control and document change tracking

**How It Works:**
1. Upload document to company folder → Google Drive push notification
2. n8n workflow triggered for specific company
3. All company documents extracted and analyzed
4. 5 AI agents update analysis with new insights
5. Living report automatically enhanced and distributed

**Core Concept:** Each company gets a dedicated folder, new documents trigger updated analysis automatically.

### Implementation Priority
The document-driven approach eliminates webhook reliability issues and creates truly automated investment intelligence that stays current with new information.

## 🔧 AI Tool Integration

### n8n Workflow Automation
- Complex multi-agent workflows for PE analysis
- Integration with Google Drive, Gmail, and web APIs
- GPT-4 orchestration for financial insights
- MCP server connectivity for extended capabilities

### Claude Code
- Project instructions in `.taskmaster/CLAUDE.md`
- Custom commands in `.claude/commands/`
- MCP servers for extended functionality
- Direct n8n workflow management via MCP

### Task Master AI  
- Task management with AI assistance
- PRD parsing and task generation
- Complexity analysis and planning
- Workflow development tracking

### Cursor IDE
- AI pair programming
- Code generation and refactoring
- Integrated terminal workflows

## 📚 Learning Objectives

### Technical Skills (Current Status)
- [x] **Document monitoring architecture** - Google Drive push notification design complete
- [ ] **Company folder structure** - Need to implement folder-to-company mapping
- [ ] **Multi-format document processing** - PDF, Excel, Word, PowerPoint extraction
- [x] **MCP server integration** - n8n MCP server functional for document workflows
- [ ] **Document-aware AI agents** - Enhance existing agents for document processing
- [x] **API integration** - Google Drive API configured for real-time monitoring
- [x] **Living analysis reports** - Report generation system designed
- [ ] **End-to-end document workflow** - Document upload to analysis pipeline

### Document-Driven PE Analysis Goals
- [ ] **Real-time document monitoring** - Google Drive push notifications implementation
- [ ] **Company-specific analysis** - Automatic routing based on folder structure
- [ ] **Progressive intelligence** - Analysis that improves with each new document
- [ ] **Multi-format processing** - Extract insights from all document types
- [ ] **Version-controlled reports** - Track how each document impacts analysis
- [ ] **Evidence-based recommendations** - All insights cite source documents
- [ ] **Living investment intelligence** - Always-current analysis for decision making

### Implementation Priorities  
1. **Google Drive push notifications** - Real-time document change detection
2. **Implement error handling** - Add proper error handling throughout
3. **Test end-to-end execution** - Validate complete workflow functionality
4. **Activate workflow** - Enable for production testing

## 🤝 Contributing

This is a learning project, but contributions welcome:
1. Fork the repository
2. Create feature branch
3. Document your AI tool workflows
4. Share learnings and patterns
5. Submit pull request

## 📄 License

MIT License - Feel free to use and adapt for your own AI coding learning journey.

---

*Built with ❤️ and AI assistance from Claude Code, Task Master AI, and friends.*