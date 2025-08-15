# PE-Eval: AI Automation Development & Learning

Live documentation of building PE (Performance Engineering) AI automations while learning Claude Code and modern AI coding tools.

## 🎯 Project Goals

1. **Build PE Automations** - Create practical performance engineering automation tools
2. **Learn AI Coding** - Document workflows with Claude Code, Cursor, and other AI tools  
3. **Share Knowledge** - Create a public learning resource for AI-assisted development

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

## 🔧 AI Tool Integration

### Claude Code
- Project instructions in `.taskmaster/CLAUDE.md`
- Custom commands in `.claude/commands/`
- MCP servers for extended functionality

### Task Master AI  
- Task management with AI assistance
- PRD parsing and task generation
- Complexity analysis and planning

### Cursor IDE
- AI pair programming
- Code generation and refactoring
- Integrated terminal workflows

## 📚 Learning Objectives

### Technical Skills
- [ ] Claude Code advanced workflows
- [ ] Task Master project management
- [ ] MCP server integration
- [ ] AI-assisted debugging and testing
- [ ] Multi-tool AI development workflows

### PE Automation Goals
- [ ] Performance monitoring tools
- [ ] Automated bottleneck detection  
- [ ] Load testing automation
- [ ] Performance regression alerts
- [ ] Optimization recommendation engine

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