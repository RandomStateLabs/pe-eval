# MCP Server Documentation for PE-Eval Private Equity Automation

## Overview
This document tracks the MCP (Model Context Protocol) servers used in the Private Equity AI Automation platform and their integration with n8n workflows.

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
- **Purpose**: Direct integration with n8n workflow automation platform
- **Use Cases**:
  - Access and manage PE analysis workflows
  - View workflow ID: EdcGmkQjHRqhcRIX (Institutional PE Analysis)
  - Monitor workflow executions
  - Update workflow configurations
  - Trigger webhook-based analyses
- **Key Features**:
  - Financial document search integration
  - GPT-4 AI analysis orchestration
  - Automated report generation
  - Email distribution management
- **Required**: n8n instance access credentials

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
   - Create PRD in `.taskmaster/docs/prd.txt`
   - Parse with `task-master parse-prd`

## Best Practices

1. **Always use project-level `.mcp.json`** for reproducibility
2. **Document which MCPs are needed** for each project
3. **Keep API keys secure** - consider using environment variables
4. **Test MCP connectivity** at start of each session
5. **Use appropriate MCPs** for the task at hand

## MCP Selection Guide

- **PE Workflow Management**: n8n MCP for workflow orchestration
- **Financial Research**: Brave Search for market data and SEC filings
- **Document Management**: Integration with Google Drive via n8n
- **Project Management**: TaskMaster AI for development tracking
- **Documentation Lookup**: Context7, Microsoft Docs
- **Code Repository Work**: GitHub
- **Investment Analysis**: n8n workflows with GPT-4 integration

## Notes

- Global MCPs are configured in `~/Library/Application Support/Claude/claude_desktop_config.json`
- Project MCPs in `.mcp.json` should supplement or override global ones
- Some MCPs from global config (like filesystem, obsidian) are not included here as they're not needed for this specific project