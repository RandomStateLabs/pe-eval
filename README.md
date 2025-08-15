# PE-Eval: Private Equity AI Automation Platform

Advanced AI-powered automation system for institutional private equity investment analysis, deal flow management, and portfolio monitoring.

## 🎯 Project Goals

1. **Automate PE Analysis** - Build intelligent workflows for institutional investment analysis and due diligence
2. **Streamline Deal Flow** - Automate company research, financial document processing, and investment recommendations  
3. **AI-Powered Insights** - Leverage GPT-4, Claude, and other LLMs for sophisticated financial analysis
4. **Enterprise Integration** - Connect with Google Drive, Gmail, web research APIs, and internal systems

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

## 📊 Core n8n Workflow: Institutional PE Analysis

### Workflow ID: EdcGmkQjHRqhcRIX
The main workflow automates comprehensive private equity investment analysis:

1. **Webhook Trigger** - Accepts company name, ticker, and analysis parameters
2. **Data Collection**:
   - Search financial documents in Google Drive
   - Fetch market research and competitive analysis
   - Web scraping for SEC filings and earnings reports
3. **AI Analysis Pipeline** (GPT-4 powered):
   - Executive Summary Generation
   - Financial Highlights Extraction
   - Market Analysis & Competitive Positioning
   - Investment Thesis Development
   - Actionable Recommendations (DEEP DIVE/PURSUE/PASS)
4. **Report Generation** - Professional HTML email with color-coded recommendations
5. **Distribution** - Automated email delivery to investment team

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

### Technical Skills
- [ ] n8n workflow orchestration for financial analysis
- [ ] Multi-agent AI systems for investment research
- [ ] MCP server integration for enterprise tools
- [ ] LLM orchestration (GPT-4, Claude) for financial insights
- [ ] API integration (Brave Search, Google Drive, Gmail)
- [ ] Webhook-based automation triggers
- [ ] Structured data extraction from financial documents

### Private Equity Automation Goals
- [ ] Automated company financial analysis (10-K, 10-Q, earnings reports)
- [ ] Market research and competitive landscape assessment  
- [ ] Investment thesis generation with AI insights
- [ ] Risk assessment and due diligence automation
- [ ] Portfolio monitoring and performance tracking
- [ ] Automated investment recommendation reports
- [ ] Deal flow pipeline management

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