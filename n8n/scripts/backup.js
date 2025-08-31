/**
 * n8n Workflow Backup Script
 * Export and backup n8n workflows for version control
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class N8nBackup {
  constructor() {
    this.config = {
      baseUrl: process.env.N8N_URL || 'http://localhost:5678',
      apiKey: process.env.N8N_API_KEY,
      workflowsDir: path.join(__dirname, '../workflows'),
      backupDir: path.join(__dirname, '../backups')
    };

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'X-N8N-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async validateConnection() {
    console.log('🔍 Validating n8n connection...');
    
    if (!this.config.apiKey) {
      throw new Error('N8N_API_KEY environment variable required');
    }

    try {
      const response = await this.httpClient.get('/api/v1/workflows');
      console.log(`✅ Connected to n8n instance: ${this.config.baseUrl}`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to connect to n8n: ${error.message}`);
    }
  }

  async exportWorkflow(workflowId, outputPath = null) {
    console.log(`📥 Exporting workflow: ${workflowId}`);
    
    try {
      const response = await this.httpClient.get(`/api/v1/workflows/${workflowId}`);
      const workflow = response.data.data;
      
      // Determine output path
      if (!outputPath) {
        const sanitizedName = workflow.name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
        outputPath = path.join(this.config.workflowsDir, `${sanitizedName}.json`);
      }
      
      // Ensure directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Clean workflow data (remove runtime-specific fields)
      const cleanWorkflow = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings,
        staticData: workflow.staticData,
        tags: workflow.tags,
        versionId: workflow.versionId
      };
      
      fs.writeFileSync(outputPath, JSON.stringify(cleanWorkflow, null, 2));
      console.log(`✅ Workflow exported: ${outputPath}`);
      
      return {
        workflowId,
        name: workflow.name,
        outputPath,
        nodeCount: workflow.nodes.length
      };
      
    } catch (error) {
      throw new Error(`Failed to export workflow ${workflowId}: ${error.message}`);
    }
  }

  async exportAllWorkflows() {
    console.log('📦 Exporting all workflows...\n');
    
    const workflows = await this.validateConnection();
    const results = [];
    
    for (const workflow of workflows) {
      try {
        const result = await this.exportWorkflow(workflow.id);
        results.push(result);
        console.log(`   ✅ ${result.name} (${result.nodeCount} nodes)`);
      } catch (error) {
        console.error(`   ❌ Failed to export ${workflow.name}: ${error.message}`);
        results.push({
          workflowId: workflow.id,
          name: workflow.name,
          error: error.message
        });
      }
    }
    
    console.log(`\n📊 Export Summary:`);
    console.log(`   Total workflows: ${workflows.length}`);
    console.log(`   Successfully exported: ${results.filter(r => !r.error).length}`);
    console.log(`   Failed: ${results.filter(r => r.error).length}`);
    
    return results;
  }

  async backupWorkflow(workflowId) {
    console.log(`💾 Creating backup for workflow: ${workflowId}`);
    
    try {
      const response = await this.httpClient.get(`/api/v1/workflows/${workflowId}`);
      const workflow = response.data.data;
      
      // Ensure backup directory exists
      if (!fs.existsSync(this.config.backupDir)) {
        fs.mkdirSync(this.config.backupDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedName = workflow.name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
      const backupPath = path.join(this.config.backupDir, `${sanitizedName}-${timestamp}.json`);
      
      fs.writeFileSync(backupPath, JSON.stringify(workflow, null, 2));
      console.log(`✅ Backup saved: ${backupPath}`);
      
      return {
        workflowId,
        name: workflow.name,
        backupPath,
        timestamp
      };
      
    } catch (error) {
      throw new Error(`Failed to backup workflow ${workflowId}: ${error.message}`);
    }
  }

  async findWorkflowByName(name) {
    const workflows = await this.validateConnection();
    return workflows.find(w => w.name.toLowerCase().includes(name.toLowerCase()));
  }
}

// CLI interface
if (require.main === module) {
  const backup = new N8nBackup();
  
  const command = process.argv[2] || 'export-all';
  const target = process.argv[3];
  
  switch (command) {
    case 'export-all':
      backup.exportAllWorkflows()
        .then(results => {
          console.log('\n✅ Export complete!');
          process.exit(0);
        })
        .catch(error => {
          console.error(`\n❌ Export failed: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'export':
      if (!target) {
        console.error('Usage: node backup.js export <workflow-id-or-name>');
        process.exit(1);
      }
      
      // Try as ID first, then as name
      const exportTarget = target.match(/^[a-zA-Z0-9]+$/) ? target : null;
      const exportPromise = exportTarget 
        ? backup.exportWorkflow(exportTarget)
        : backup.findWorkflowByName(target).then(w => w ? backup.exportWorkflow(w.id) : null);
      
      exportPromise
        .then(result => {
          if (!result) {
            console.error(`❌ Workflow not found: ${target}`);
            process.exit(1);
          }
          console.log(`\n✅ Export complete! File: ${result.outputPath}`);
          process.exit(0);
        })
        .catch(error => {
          console.error(`\n❌ Export failed: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'backup':
      if (!target) {
        console.error('Usage: node backup.js backup <workflow-id>');
        process.exit(1);
      }
      
      backup.backupWorkflow(target)
        .then(result => {
          console.log(`\n✅ Backup complete! File: ${result.backupPath}`);
          process.exit(0);
        })
        .catch(error => {
          console.error(`\n❌ Backup failed: ${error.message}`);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node backup.js [export-all|export|backup] [target]');
      console.log('');
      console.log('Commands:');
      console.log('  export-all              Export all workflows to ../workflows/');
      console.log('  export <id-or-name>     Export specific workflow');
      console.log('  backup <workflow-id>    Create timestamped backup');
      process.exit(1);
  }
}

module.exports = N8nBackup;