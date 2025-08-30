# MCP Server Documentation for PE-Eval Document-Driven Investment Analysis

## Overview
This document tracks the MCP (Model Context Protocol) servers used in the PE-Eval document-driven investment analysis platform. The platform uses a dual-track implementation strategy: **MVP n8n workflow** (current priority - 2 weeks) followed by **enhanced JavaScript architecture** (3-6 months), both leveraging the same core MCP integrations.

## Configured MCP Servers

### 1. **TaskMaster AI** 
- **Purpose**: Project management and task tracking
- **Use Cases**: 
  - Parse PRD documents into actionable tasks
  - Track development progress
  - Manage task dependencies
  - Generate complexity reports
- **Key Commands**: `task-master init`, `task-master next`, `task-master show <id>`
- **Required**: ANTHROPIC_API_KEY

### 2. **Microsoft Docs**
- **Purpose**: Access Microsoft documentation directly
- **Use Cases**:
  - Look up .NET/C# documentation
  - Access Azure service documentation
  - Reference Windows API documentation
  - TypeScript/JavaScript docs from Microsoft
- **No API key required** (uses public endpoint)

### 3. **Context7**
- **Purpose**: Library documentation and code examples
- **Use Cases**:
  - Get official documentation for npm packages
  - Find code examples and patterns
  - Check library best practices
  - Version-specific documentation
- **No API key required**

### 4. **Brave Search**
- **Purpose**: Web search capabilities
- **Use Cases**:
  - Research technical solutions
  - Find recent updates and changes
  - Search for error messages
  - General web queries
- **Required**: BRAVE_API_KEY

### 5. **GitHub**
- **Purpose**: GitHub repository operations
- **Use Cases**:
  - Create/manage issues
  - Create pull requests
  - Search code across GitHub
  - Manage repository files
- **Required**: GITHUB_PERSONAL_ACCESS_TOKEN

### 6. **n8n MCP**
- **Purpose**: Core integration for both MVP workflow and future JavaScript architecture
- **Current Use Cases (MVP n8n Workflow - Tasks 28-33)**:
  - **5-Node Workflow Management**: Google Drive Trigger → Extract From File → Code Node → OpenAI → Google Sheets
  - **MetricExtractor.js Pattern Translation**: Copy proven 89.6% accuracy patterns to n8n Code Node
  - **StateDatabase.js Operations**: Configure Google Sheets operations using existing logic
  - **Real-time Document Processing**: Google Drive push notifications to n8n triggers
  - **LLM Validation Integration**: OpenAI node for enhanced metric extraction accuracy
- **Future Use Cases (Enhanced Architecture - Tasks 19-27)**:
  - **6 AI Agent Orchestration**: Document-aware analysis with delta intelligence
  - **Advanced Workflow Management**: Complex multi-step document processing pipelines
  - **Enterprise Integration**: Advanced monitoring and error handling coordination
  - **Smart Notification System**: Priority-based alerts and business intelligence
- **Key Features**:
  - **Dual-Track Support**: MVP rapid deployment + future production enhancement
  - **Phase 1 Foundation Integration**: Leverages MetricExtractor, StateDatabase, DatabaseSchema components
  - **Visual Workflow Development**: 2-week MVP deployment vs. months of custom development
  - **Managed Infrastructure**: n8n Cloud handles scaling, monitoring, and reliability
- **Required**: n8n Cloud account, Google Drive API, Google Sheets API, OpenAI API

## How to Use

### Starting Claude Code with Project MCPs
```bash
# From project directory
claude

# With debug info to troubleshoot connections
claude --mcp-debug
```

### Testing MCP Connectivity
Use the `/mcp` command in Claude Code to see connection status.

### Common Issues & Solutions

1. **MCP not connecting**: 
   - Restart Claude Code
   - Check API keys are valid
   - Use `--mcp-debug` flag

2. **Microsoft Docs not working**:
   - Updated to use `mcp-remote` with proper endpoint
   - Should work now with the corrected configuration

3. **TaskMaster not initialized**:
   - Run `task-master init` first  
   - Project already has 33 tasks (Tasks 28-33: MVP n8n, Tasks 19-27: Future JavaScript)
   - Use `task-master next` to get current task, `task-master show <id>` for details

## Best Practices

1. **Always use project-level `.mcp.json`** for reproducibility
2. **Document which MCPs are needed** for each project
3. **Keep API keys secure** - consider using environment variables
4. **Test MCP connectivity** at start of each session
5. **Use appropriate MCPs** for the task at hand

## MCP Selection Guide for Dual-Track Implementation

### MVP n8n Workflow (Current Priority - Tasks 28-33)
- **Core Workflow Management**: n8n MCP for 5-node workflow configuration and monitoring
- **Proven Logic Translation**: Context7 for n8n best practices and MetricExtractor pattern implementation
- **API Integration**: n8n MCP for Google Drive, Google Sheets, OpenAI node configuration
- **Task Management**: TaskMaster AI for MVP development progress tracking
- **Research Support**: Brave Search for n8n workflow examples and optimization techniques
- **Development Documentation**: GitHub for workflow version control and sharing

### Future JavaScript Architecture (Tasks 19-27)
- **Advanced Document Processing**: n8n MCP for complex multi-format extraction and AI agent orchestration
- **Real-Time Delta Intelligence**: n8n workflows for sophisticated metric change detection
- **Company Intelligence Research**: Brave Search for market data integration and competitive analysis
- **Enterprise Integration**: Microsoft Docs for Azure services and enterprise features
- **Production Development**: GitHub for full codebase management and CI/CD integration
- **Living Analysis Reports**: n8n MCP orchestrating 6 specialized AI agents with historical context

### Cross-Track Support
- **Project Management**: TaskMaster AI for coordinating both MVP and future development
- **Technical Guidance**: Context7 for framework patterns and implementation best practices
- **Documentation**: Microsoft Docs for comprehensive technical documentation standards

## Implementation Status Notes

### Current Configuration
- Project uses `.mcp.json` for PE-Eval specific MCP configuration
- **MVP Focus**: n8n MCP is primary integration for rapid 2-week deployment
- **Phase 1 Foundation**: MetricExtractor (89.6% accuracy), StateDatabase, DatabaseSchema components ready for translation

### MCP Integration Strategy
- **Immediate (MVP)**: n8n MCP, Context7, TaskMaster AI for workflow development
- **Research Support**: Brave Search, Microsoft Docs for technical guidance
- **Future Enhancement**: All MCPs coordinated for production JavaScript architecture

### Configuration Management
- Global MCPs in `~/Library/Application Support/Claude/claude_desktop_config.json`
- Project-specific `.mcp.json` optimized for document-driven investment analysis
- Environment variables in `.env` for API keys (use `.env.example` as template)