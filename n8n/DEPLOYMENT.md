# 🚀 n8n Programmatic Deployment Guide

## 🚨 CRITICAL DEPLOYMENT ISSUES & SOLUTIONS

### Issue #1: Missing Required Settings Field
**Problem**: API returns 400 Bad Request with no error details  
**Root Cause**: n8n API requires `settings` field in workflow JSON  
**Solution**: Always include minimum settings:
```json
{
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Issue #2: Wrong API Key Format
**Problem**: 401 Unauthorized errors during deployment  
**Root Cause**: Using wrong API key format (`n8n_api_xxx` vs JWT)  
**Solution**: Use JWT format from n8n settings:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZTUyZWEwZS01MjljLTRhNzktOTRiNS1hNzViNjEzZTBlODgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2NTk0OTg2LCJleHAiOjE3NjQzMDYwMDB9.M5QQNLTUNg215OBcdMDUAGsciNd5Lm3qZyglcV__QZ8
```

### Issue #3: Additional Settings Properties
**Problem**: 400 Bad Request with "must NOT have additional properties"  
**Root Cause**: Adding non-standard properties to settings object  
**Solution**: Use only supported settings properties:
```json
{
  "settings": {
    "executionOrder": "v1"  // Only use this
    // Remove: saveDataErrorExecution, saveDataSuccessExecution, etc.
  }
}
```

### Issue #4: ES Module Import Errors
**Problem**: `SyntaxError: Named export 'glob' not found`  
**Root Cause**: Incorrect import syntax for ES modules  
**Solution**: Use named imports:
```javascript
import { glob } from 'glob';  // ✅ Correct
// Not: import pkg from 'glob'; const { glob } = pkg;  // ❌ Wrong
```

### Issue #5: 405 Method Not Allowed on Activation
**Problem**: Workflow activation fails with 405 error  
**Impact**: Minor - workflows deploy successfully, just can't auto-activate  
**Workaround**: Manually activate in n8n UI after deployment

## ✅ WORKING DEPLOYMENT PROCESS

### Prerequisites
```bash
# Ensure package.json has ES module support
{
  "type": "module"
}

# Install dependencies
npm install axios glob
```

### Deployment Command
```bash
export N8N_API_KEY="your_jwt_token_here"
node deploy.js deploy ../workflows/your-workflow.json --activate --skip-credentials
```

### Validation Checklist
- [ ] Workflow JSON has `settings.executionOrder = "v1"`
- [ ] Using JWT API key format (starts with `eyJ`)
- [ ] ES module imports use named import syntax
- [ ] n8n server running on localhost:5678
- [ ] All node `typeVersion` fields are valid numbers

## 🎯 QUICK START: Deploy MVP in 30 Minutes

### Step 1: Configure Your Environment
```bash
# Set your Google Drive folder ID for monitoring
export GOOGLE_DRIVE_FOLDER_ID="your_pe_documents_folder_id"

# Set your Google Sheets ID for state database  
export GOOGLE_SHEETS_ID="your_company_metrics_spreadsheet_id"
```

### Step 2: Deploy Enhanced Workflow
```bash
# Option A: Use MCP (Recommended)
# Claude Code with MCP can directly modify your existing workflow

# Option B: Use our deployment scripts
npm run n8n:backup    # Backup existing workflow first
npm run n8n:deploy    # Deploy enhanced version
```

### Step 3: Test the MVP
```bash
# Trigger test (drop PE document in monitored folder)
# Watch: Document → Extract Metrics → Generate Enhanced Analysis → Email
```

## 🔧 WHAT CHANGES WE'RE MAKING

### Current Flow:
```
Webhook → Input → Search Docs → AI Agents → Email
```

### Enhanced MVP Flow:
```
Drive Monitor → Extract Text → Extract Metrics → State DB → Enhanced AI → Email
```

### Preserving Your Investment:
✅ **Keep all 5 AI agents** (Executive, Financial, Market, Investment, Recommendations)  
✅ **Keep email formatting and distribution**  
✅ **Keep existing credentials and authentication**  
➕ **Add automatic document monitoring**  
➕ **Add 89.6% accurate metric extraction**  
➕ **Add historical state database**  
➕ **Add delta intelligence to AI agents**  

## 📁 File Structure Created

```
n8n/
├── workflows/
│   ├── pe-analysis-original.json     # Your existing workflow backup
│   └── pe-analysis-mvp.json          # Enhanced MVP workflow
├── nodes/
│   ├── metric-extractor.js           # MetricExtractor.js → n8n Code Node
│   └── state-database.js             # StateDatabase.js → n8n Code Node  
├── scripts/
│   └── deploy.js                     # Deployment automation
└── DEPLOYMENT.md                     # This file
```

## 🎯 NEXT ACTIONS

### Option 1: Modify Existing Workflow (MCP - 5 minutes)
```javascript
// I can use MCP to directly modify your existing workflow EdcGmkQjHRqhcRIX
// This preserves all your AI agents and adds the new MVP features
```

### Option 2: Deploy New Workflow (Scripts - 15 minutes) 
```bash
# Use the programmatic deployment approach
npm run n8n:deploy n8n/workflows/pe-analysis-mvp.json
```

### Option 3: Manual Import (n8n UI - 10 minutes)
```bash
# Copy-paste the JSON from n8n/workflows/pe-analysis-mvp.json
# Into your n8n instance as a new workflow
```

## 🔥 THE MAGIC: Your 89.6% Accurate Extraction

The `metric-extractor.js` Code Node contains ALL your proven regex patterns:
- Revenue patterns (4 variations)
- Valuation patterns (3 variations) 
- ARR patterns (2 variations)
- Growth rate patterns (4 variations)
- Customer count patterns (3 variations)
- Burn rate patterns (2 variations)

**RESULT**: Drop any PE document → Get structured metrics instantly!

## 🚨 Ready to Deploy?

**Say "YES" and I'll modify your existing workflow EdcGmkQjHRqhcRIX right now using MCP!**

Your MVP will be live in 2 minutes with:
- ✅ All existing AI agents preserved
- ✅ Automatic document monitoring  
- ✅ 89.6% metric extraction accuracy
- ✅ Historical state tracking
- ✅ Delta intelligence
- ✅ Enhanced email reports