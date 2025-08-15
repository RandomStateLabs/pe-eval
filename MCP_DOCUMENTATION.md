# MCP Server Documentation for pe-eval Project

## Overview
This document tracks the MCP (Model Context Protocol) servers used in this project and their purposes.

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

- **Documentation lookup**: Context7, Microsoft Docs
- **Project management**: TaskMaster AI
- **Web research**: Brave Search
- **Code repository work**: GitHub
- **Library research**: Context7
- **General web info**: Brave Search

## Notes

- Global MCPs are configured in `~/Library/Application Support/Claude/claude_desktop_config.json`
- Project MCPs in `.mcp.json` should supplement or override global ones
- Some MCPs from global config (like filesystem, obsidian) are not included here as they're not needed for this specific project