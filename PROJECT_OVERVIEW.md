# PE-Eval: Private Equity AI Automation Platform

## Executive Summary

PE-Eval is an advanced document-driven AI automation platform designed for private equity firms to enable real-time investment analysis through intelligent document monitoring. The system uses Google Drive push notifications and specialized AI agents to automatically analyze new financial documents, creating living analysis reports that evolve with each new document addition.

## Core Capabilities

### 1. Document-Driven Analysis
- **Company-Specific Folders**: Each private company has dedicated Google Drive folder containing all financial documents
- **Real-Time Monitoring**: Google Drive push notifications trigger immediate analysis when new documents are added
- **Multi-Format Processing**: Automated extraction from PDF, Excel, Word, and PowerPoint documents
- **Progressive Enhancement**: Analysis reports continuously improve with each new document

### 2. Specialized AI Agents
- **Executive Summary Agent**: Synthesizes company overviews from document collections
- **Financial Analysis Agent**: Extracts metrics and trends from financial documents
- **Market Analysis Agent**: Processes industry reports and competitive intelligence
- **Investment Thesis Agent**: Develops investment rationale based on accumulated evidence
- **Recommendation Agent**: Provides DEEP DIVE/PURSUE/PASS decisions with document citations

### 3. Living Analysis Reports
- **Always-Current Analysis**: Reports automatically update when new documents are added
- **Document Change Tracking**: Version control showing how each document impacts analysis
- **Evidence-Based Insights**: All analysis points directly cite source documents
- **Progressive Decision Making**: Investment recommendations strengthen with more document evidence

## Technical Architecture

### Document-Driven Workflow Architecture
**⚠️ NEW ARCHITECTURE**: Transitioning from webhook-based to document-driven system

**Document Monitoring Flow:**
```
Google Drive Document Changes → Push Notifications → n8n Webhook Handler 
→ Document Type Detection → Content Extraction → Company Analysis Router 
→ 5 AI Agents → Living Report Updates → Team Notifications
```

**Company Folder Structure:**
```
Private Equity Analysis/
├── CompanyA/
│   ├── 10K_2024.pdf (triggers: Executive, Financial, Market agents)
│   ├── Q3_earnings.pdf (triggers: Financial, Thesis agents)
│   └── investor_deck.pptx (triggers: Executive, Recommendation agents)
├── CompanyB/
│   ├── financial_model.xlsx (triggers: Financial agent)
│   └── market_research.pdf (triggers: Market agent)
```

### AI Agent Integration
**Document-Responsive Agents:**
1. **Executive Summary Agent**: Updates company overviews with new document insights
2. **Financial Analysis Agent**: Processes financial documents for metrics extraction
3. **Market Analysis Agent**: Analyzes market intelligence documents
4. **Investment Thesis Agent**: Refines investment rationale with new evidence
5. **Recommendation Agent**: Adjusts recommendations based on document-driven insights

### Integration Points
- **Google Drive API**: Real-time document change monitoring with push notifications
- **n8n Workflows**: Document processing orchestration and AI agent coordination
- **Multi-Format Extractors**: PDF, Excel, Word, PowerPoint text extraction
- **OpenAI GPT-4 & Claude**: Document-aware analysis agents
- **Living Reports**: Version-controlled analysis that updates with new documents

## Current Status

### 🔄 **Architecture Transition Status**
**Transitioning from webhook-based to document-driven architecture**

**Migration Progress**: Moving from manual company input to automated document monitoring

### Document-Driven Implementation Status
- 🔧 **In Development**: Google Drive push notification system
- 🔧 **In Development**: Multi-format document extraction pipeline
- 🔧 **In Development**: Company-specific folder monitoring
- ✅ **Designed**: 5 AI agents for document-based analysis
- ✅ **Designed**: Living analysis report system
- 📋 **Planning**: Document change tracking and versioning

### New Architecture Features
- ✅ **Company Folder Structure**: Each company gets dedicated Drive folder
- ✅ **Document Processing**: PDF, Excel, Word, PowerPoint extraction
- ✅ **Real-Time Triggers**: Push notifications for immediate analysis
- 🔧 **AI Agent Enhancement**: Document-aware analysis prompts
- 🔧 **Living Reports**: Progressive analysis improvement with new documents
- 📋 **Version Control**: Track how each document impacts analysis

### Enhanced Capabilities (Document-Driven)
- 📋 **Document History Analysis**: Trend analysis across document timeline
- 📋 **Multi-Company Comparison**: Cross-folder comparative analysis
- 📋 **Document Impact Scoring**: Measure how each document changes analysis
- 📋 **Automated Due Diligence**: Document completeness tracking
- 📋 **Evidence-Based Recommendations**: All insights cite source documents

## Use Cases

### Primary Use Case: Document-Driven Investment Analysis
**Input**: Financial documents uploaded to company-specific Google Drive folders
**Process**: Real-time document monitoring, multi-format extraction, AI agent analysis
**Output**: Living investment analysis that evolves with each new document

**Example Workflow:**
1. Upload 10-K filing to "CompanyA" folder → Triggers financial analysis update
2. Add earnings report → Investment thesis refined with new data
3. Include competitor analysis → Market positioning updated automatically
4. New investor deck → Executive summary enhanced with latest insights

### Secondary Use Cases
- **Progressive Due Diligence**: Analysis deepens automatically as documents accumulate
- **Portfolio Monitoring**: Regular document updates trigger performance re-evaluation  
- **Document Impact Analysis**: Track how each new document changes investment outlook
- **Multi-Company Intelligence**: Cross-folder analysis for portfolio comparison
- **Evidence-Based Reporting**: All analysis claims supported by document citations

## Technology Stack

### Core Technologies
- **n8n**: Workflow automation and orchestration
- **OpenAI GPT-4**: Advanced language model for analysis
- **Node.js**: Runtime environment
- **MCP (Model Context Protocol)**: Tool integration framework

### AI Tools
- **Claude Code**: AI-powered development assistant
- **Task Master AI**: Project and task management
- **Cursor IDE**: AI-enhanced code editor

### Integrations
- **Google Workspace**: Drive and Gmail
- **Brave Search**: Web research API
- **GitHub**: Version control and collaboration
- **Webhook.site**: Testing and debugging

## Development Workflow

### Task Management
Using Task Master AI for structured development:
1. Parse PRD documents into actionable tasks
2. Track development progress with AI assistance
3. Manage task dependencies and complexity
4. Generate reports and documentation

### MCP Server Ecosystem
- **n8n MCP**: Workflow management and execution
- **TaskMaster AI**: Development task tracking
- **Context7**: Library documentation
- **Brave Search**: Financial research
- **GitHub**: Code management

## Success Metrics

### Efficiency Gains
- 90% reduction in manual research time
- 24/7 automated analysis capability
- Consistent analysis quality and depth
- Parallel processing of multiple companies

### Quality Improvements
- Standardized analysis framework
- Comprehensive data coverage
- Unbiased AI-driven insights
- Professional report generation

## Future Vision

The PE-Eval platform aims to become the comprehensive AI automation solution for private equity firms, handling everything from initial deal sourcing through portfolio exit strategies. Future enhancements will include:

1. **Advanced Analytics**: Machine learning models for predictive analysis
2. **Real-time Monitoring**: Continuous portfolio company tracking
3. **Collaborative Features**: Team collaboration and approval workflows
4. **Custom Integrations**: Firm-specific data sources and systems
5. **Mobile Access**: iOS/Android apps for on-the-go analysis

## Getting Started

1. **Setup n8n Instance**: Deploy the PE analysis workflow
2. **Configure API Keys**: OpenAI, Google, Brave Search
3. **Initialize Task Master**: Set up project management
4. **Connect MCP Servers**: Enable extended functionality
5. **Test Workflow**: Run sample analysis with test company

## Support & Documentation

- **README.md**: Setup and configuration guide
- **MCP_DOCUMENTATION.md**: MCP server integration details
- **CLAUDE.md**: Task Master AI integration
- **n8n Workflow**: EdcGmkQjHRqhcRIX

---

*Built for institutional investors seeking AI-powered efficiency in private equity analysis.*