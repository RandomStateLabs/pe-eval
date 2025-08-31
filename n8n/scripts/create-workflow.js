/**
 * Programmatic n8n Workflow Creator
 * Create workflows in code and deploy them via API
 */

import N8nDeployer from './deploy.js';

class WorkflowBuilder {
  constructor() {
    this.workflow = {
      name: '',
      active: false,
      nodes: [],
      connections: {},
      settings: {
        executionOrder: 'v1'
      }
    };
    this.nodeCounter = 0;
  }

  setName(name) {
    this.workflow.name = name;
    return this;
  }

  addNode(config) {
    const node = {
      id: config.id || `node-${this.nodeCounter++}`,
      name: config.name,
      type: config.type,
      typeVersion: config.typeVersion || 1,
      position: config.position || [200 + this.nodeCounter * 200, 300],
      parameters: config.parameters || {},
      ...config
    };
    
    this.workflow.nodes.push(node);
    return this;
  }

  connect(fromNodeName, toNodeName, outputIndex = 0, inputIndex = 0) {
    if (!this.workflow.connections[fromNodeName]) {
      this.workflow.connections[fromNodeName] = { main: [] };
    }
    
    if (!this.workflow.connections[fromNodeName].main[outputIndex]) {
      this.workflow.connections[fromNodeName].main[outputIndex] = [];
    }
    
    this.workflow.connections[fromNodeName].main[outputIndex].push({
      node: toNodeName,
      type: 'main',
      index: inputIndex
    });
    
    return this;
  }

  build() {
    return this.workflow;
  }
}

// Example: Create PE Analysis workflow programmatically
export function createPEAnalysisWorkflow() {
  return new WorkflowBuilder()
    .setName('PE Analysis MVP - Programmatic')
    .addNode({
      id: 'google-drive-trigger',
      name: '🗂️ Google Drive Document Trigger',
      type: 'n8n-nodes-base.googleDriveTrigger',
      parameters: {
        resource: 'file',
        operation: 'watchFiles',
        watchFor: ['fileAdded', 'fileUpdated'],
        options: { includeSubfolders: true }
      },
      credentials: {
        googleDriveApi: { id: null, name: 'Google Drive API' }
      }
    })
    .addNode({
      id: 'document-processor',
      name: '📋 Document Preprocessor',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      parameters: {
        jsCode: `
const items = $input.all();
const results = [];

for (const item of items) {
  const file = item.json;
  const folderPath = file.parents?.[0]?.name || 'Unknown';
  const companyName = folderPath.replace(/[^a-zA-Z0-9\\s]/g, '').trim();
  
  results.push({
    json: {
      file_id: file.id,
      file_name: file.name,
      company_name: companyName,
      analysis_id: \`pe-\${companyName.replace(/\\s+/g, '-').toLowerCase()}-\${Date.now()}\`,
      processing_timestamp: new Date().toISOString(),
      ready_for_extraction: true
    }
  });
}

return results;
        `.trim()
      }
    })
    .connect('🗂️ Google Drive Document Trigger', '📋 Document Preprocessor')
    .build();
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployer = new N8nDeployer();
  
  async function main() {
    try {
      // Create workflow programmatically
      const workflow = createPEAnalysisWorkflow();
      
      // Save workflow to file
      const workflowPath = path.join(__dirname, '../workflows/generated-pe-analysis.json');
      fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
      console.log(`📁 Generated workflow saved: ${workflowPath}`);
      
      // Deploy it using the existing deployer
      await deployer.deployWorkflow(workflow, { 
        activate: true,
        backup: true 
      });
      
      console.log('✅ Programmatic workflow created and deployed!');
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
  }
  
  main();
}

export { WorkflowBuilder, createPEAnalysisWorkflow };