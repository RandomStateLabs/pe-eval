# PE-Eval: Claude Code Project Configuration

## Project Context

PE-Eval is an AI-powered private equity document analysis system that automatically extracts financial metrics from documents uploaded to Google Drive folders and tracks changes over time.

### Core Purpose
- Monitor portfolio company financial documents automatically
- Extract key financial metrics using AI (GPT-4)
- Track historical trends and detect significant changes
- Provide real-time analysis and alerts for investment teams

### Technologies
- **N8N**: Workflow automation platform (v1.x)
- **OpenAI GPT-4**: AI-powered document analysis and metric extraction
- **Google Drive API**: Document monitoring and file access
- **Docker**: Containerization for N8N and services

## Project Structure

```
pe-eval/
├── docs/                    # System documentation
│   ├── PROJECT_OVERVIEW.md    # Business requirements and goals
│   └── SYSTEM_ARCHITECTURE.md # Technical architecture and database schema
├── n8n/workflows/          # N8N automation workflows
│   └── pe-eval-mvp.json       # Main processing workflow
├── .mcp.json              # MCP server configuration
├── .env                   # Environment variables
├── README.md              # Project documentation
└── CLAUDE.md              # This file
```

## Documentation File Purposes

| Document | Purpose |
|--------------------------------|---------------------------------|
| LIVE_TECHNICAL_DOC.md          | Current working state           |
| PLANNED_SYSTEM_ARCHITECTURE.md | Future plans                    |
| PROJECT_OVERVIEW.md            | Business overview DO NOT MODIFY |
| SAMPLE_EMAIL_OUTPUT.md         | Output template DO NOT MODIFY   |

**IMPORTANT RULES:**
- **NEVER modify** SAMPLE_EMAIL_OUTPUT.md - it's the expected output template that GPT-4 should generate
- **NEVER modify** PROJECT_OVERVIEW.md - it's the business overview only, no implementation details
- LIVE_TECHNICAL_DOC.md should **ONLY** reflect the current working state (currently 6 nodes)
- PLANNED_SYSTEM_ARCHITECTURE.md should **ONLY** contain future plans and brainstorming (two-workflow architecture)

## Common Commands

### N8N Management
```bash
# Start N8N locally
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Check N8N status
curl -X GET http://localhost:5678/api/v1/workflows

# View workflow executions
curl -X GET "http://localhost:5678/api/v1/executions?limit=10"
```

### Data Operations
```bash
# Data storage and querying commands will depend on final storage solution choice
# (Google Sheets API, PostgreSQL, or other database solution)
```

### Development Workflow
```bash
# View project structure
find . -type f -name "*.json" -o -name "*.md" | grep -v node_modules | sort

# Check Git status
git status

# Test MCP server connections
# (Use Claude Code's built-in MCP testing)
```

## Key Financial Metrics

The system extracts and tracks Financial metrics:
### Example Metrics
- **Revenue**
- **EBITDA**
- **Cash Flow**
- **Growth Rates**
- **ARR/MRR**
- **Customer Metrics**
- **Burn Rate**
- **Valuation**

## Workflow Architecture

### Document Processing Pipeline
1. **Google Drive Trigger**: Monitors folders every minute for new documents
2. **Document Download**: Retrieves PDF, Excel, Word, PowerPoint files
3. **Text Extraction**: OCR and content parsing
4. **AI Analysis**: GPT-4 extracts structured financial metrics
5. **Quality Validation**: Confidence and completeness scoring
6. **Data Storage**: Store extracted metrics with historical tracking (solution TBD)
7. **Change Detection**: Comparison with previous periods
8. **Alert Generation**: Notifications for significant changes


## Development Guidelines

### Code Style
- Use descriptive workflow names in N8N
- Document complex nodes with clear notes
- Maintain consistent error handling patterns
- Follow consistent data naming conventions

### Testing Approach
- Test with sample financial documents in monitored folders
- Validate extraction accuracy against known metrics
- Check data storage integrity after processing
- Monitor workflow execution logs for errors

### Error Handling
- All N8N workflows include retry logic (3 attempts)
- Data integrity validation (implementation depends on storage solution)
- Comprehensive logging for debugging
- Graceful degradation for API failures

### Git Workflow Standards

**Branch Strategy:**
- **main**: Stable, working code only - never commit directly to main
- **feature/***: Development branches for new features (e.g., `feature/workflow2-analysis-engine`)
- **fix/***: Bug fix branches (e.g., `fix/metric-extraction-bug`)

**File Modification Policy:**
- **ALWAYS modify existing files** instead of creating duplicates
- Example: Modify `My workflow.json` directly, DON'T create `My workflow-enhanced.json`
- Version control tracks changes - no need for multiple versions of the same file

**Documentation Creation Policy:**
- **NEVER create new markdown files without explicit user consent**
- Reason: Too many docs create confusion and increase token usage in AI conversations
- Established docs: `LIVE_TECHNICAL_DOC.md`, `PLANNED_SYSTEM_ARCHITECTURE.md`, `PROJECT_OVERVIEW.md`, `SAMPLE_EMAIL_OUTPUT.md`
- Ask before creating new documentation files

**Commit Message Standards:**
- Use descriptive, imperative mood messages (e.g., "Add folder_id tracking to Node 5")
- Include context about what changed and why
- Reference related issues or features when applicable

**Workflow Process:**
1. Create feature branch from main: `git checkout -b feature/feature-name`
2. Make changes and commit regularly with clear messages
3. Test thoroughly on the feature branch
4. When ready, create pull request or merge to main
5. Delete feature branch after successful merge

## MCP Server Integration

### Available Servers
- **n8n-mcp**: Direct N8N workflow management and monitoring
- **context7**: Documentation and best practices lookup
- **github**: Repository integration for workflow versioning
- **brave-search**: Research financial metrics and industry standards

### Common MCP Usage
- Query N8N workflow status and execution history
- Research financial metrics definitions and calculation methods
- Access documentation for troubleshooting
- Manage Git workflows for version control

## Data Schema (Conceptual)

### Data Entities (Structure TBD based on storage solution)
- **Companies**: Portfolio company information
- **Documents**: Document metadata and processing status
- **Metric Definitions**: Standardized financial metric definitions
- **Metric Values**: Extracted metric values with confidence scores
- **Metric Changes**: Historical change tracking and trend analysis

### Performance Considerations (Storage Solution Dependent)
- Efficient querying by company and date
- Flexible metadata storage for varying metrics
- Scalable historical data management

## Troubleshooting

### Common Issues
- **Document Processing Failures**: Check Google Drive permissions and API quotas
- **Data Storage Issues**: Verify storage service status and access credentials
- **N8N Workflow Errors**: Check execution logs and node configurations

### Debug Commands
```bash
# Check N8N logs
docker logs n8n

# Test Google Drive API access
curl -H "Authorization: Bearer $GOOGLE_ACCESS_TOKEN" \
  "https://www.googleapis.com/drive/v3/files"

# Data storage connectivity tests will depend on chosen solution
# (Google Sheets API, PostgreSQL, or other database solution)
```

---

**Note**: This project focuses on defensive financial analysis and regulatory compliance. All document processing maintains strict data privacy and security standards for private equity operations.