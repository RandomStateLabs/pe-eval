# n8n Workflow Development

This directory contains all n8n workflow definitions, custom nodes, and deployment scripts for the PE-Eval MVP automation system.

## Structure

```
n8n/
├── workflows/           # Workflow JSON definitions
│   ├── pe-analysis-mvp.json       # Main MVP workflow
│   └── pe-analysis-original.json  # Original workflow backup
├── nodes/              # Custom Code Node implementations
│   ├── metric-extractor.js        # Financial metric extraction
│   ├── state-database.js          # Google Sheets operations
│   └── delta-calculator.js        # Historical comparison
├── credentials/        # Credential templates (no actual keys)
├── scripts/           # Deployment and management scripts
│   ├── deploy.js      # Deploy workflows to n8n instance
│   ├── backup.js      # Backup existing workflows
│   └── validate.js    # Validate workflow definitions
└── README.md          # This file
```

## Development Workflow

1. **Export Current Workflow**: Backup existing workflow as JSON
2. **Modify Locally**: Edit workflow JSON definitions
3. **Test Code Nodes**: Test individual node logic locally
4. **Deploy**: Push changes to n8n instance
5. **Version Control**: Commit all changes to git

## MVP Workflow: PE-Analysis Document-Driven

The MVP workflow (`pe-analysis-mvp.json`) implements a complete 7-node document-driven analysis pipeline:

### Workflow Architecture
```
📁 Google Drive Trigger → 📋 Document Preprocessor → 📄 Extract Document Content → 
🔍 Metric Extraction Engine → 🤖 LLM Metrics Validator → 💾 State Database Manager → 📊 Google Sheets Database
```

### Node Details
1. **Google Drive Trigger**: Monitors company folders for new PE documents
2. **Document Preprocessor**: Extracts company metadata and validates file types
3. **Extract Document Content**: Processes PDF/Excel/Word/PowerPoint files
4. **Metric Extraction Engine**: Uses Phase 1 MetricExtractor.js patterns (89.6% accuracy)
5. **LLM Metrics Validator**: GPT-4 validation and enhancement of extracted metrics
6. **State Database Manager**: Prepares data with delta intelligence
7. **Google Sheets Database**: Updates time-series database with historical tracking

### Key Features
- **Document-Driven**: Triggered by new documents in Google Drive folders
- **LLM Enhancement**: GPT-4 validation improves accuracy beyond 89.6% baseline
- **Delta Intelligence**: Real-time historical comparison and trend analysis
- **Time-Series Database**: Google Sheets-based append-only metric storage
- **Error Handling**: Comprehensive error workflows and validation

## Deployment

### Quick Start
```bash
# Set environment variables
export N8N_URL="http://localhost:5678"
export N8N_API_KEY="your_api_key"

# Deploy MVP workflow
cd n8n/scripts && node deploy.js deploy --activate

# Validate deployment
node validate.js all

# Backup existing workflows
node backup.js export-all
```

### Manual Deployment
1. Import `workflows/pe-analysis-mvp.json` into n8n interface
2. Configure credentials (see `credentials/template-credentials.md`)
3. Set up Google Drive folders and Google Sheets database
4. Activate workflow and test with sample document

### Validation
```bash
# Validate workflow structure
cd n8n/scripts && node validate.js workflow pe-analysis-mvp

# Validate custom code nodes  
node validate.js nodes

# Full validation
node validate.js all
```

## Enhanced Nodes

### Metric Extractor (`nodes/metric-extractor.js`)
- **89.6% accuracy baseline** from Phase 1 testing
- Enhanced with LLM validation pipeline integration
- Configurable confidence thresholds and metric limits
- Comprehensive financial pattern recognition

### State Database (`nodes/state-database.js`)
- Enhanced with LLM-validated metrics processing
- Delta intelligence with historical comparison
- Validation metadata tracking
- Ready for Google Sheets integration

### Delta Calculator (`nodes/delta-calculator.js`)
- Advanced historical comparison and trend analysis
- Multi-period delta calculation with significance scoring
- Seasonal adjustment factors
- Actionable insights generation with risk indicators

## Configuration

### Environment Variables
```bash
N8N_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
```

### Required Credentials in n8n
- `googleDriveOAuth2Api` - Document monitoring
- `googleSheetsOAuth2Api` - Database operations
- `openAiApi` - LLM validation and enhancement

See `credentials/template-credentials.md` for detailed setup instructions.