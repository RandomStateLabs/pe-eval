/**
 * n8n Universal Workflow Deployment Script
 * Deploy any n8n workflow(s) to local or remote n8n instance
 * Supports single files, batch deployment, validation, and backup
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class N8nDeployer {
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

  async validateEnvironment() {
    console.log('🔍 Validating deployment environment...');
    
    if (!this.config.apiKey) {
      throw new Error('N8N_API_KEY environment variable required');
    }

    try {
      const response = await this.httpClient.get('/api/v1/workflows');
      console.log(`✅ Connected to n8n instance: ${this.config.baseUrl}`);
      console.log(`📊 Found ${response.data.data.length} existing workflows`);
      return true;
    } catch (error) {
      throw new Error(`Failed to connect to n8n: ${error.message}`);
    }
  }

  async backupExistingWorkflow(workflowId) {
    if (!workflowId) return null;

    console.log(`💾 Backing up existing workflow: ${workflowId}`);
    
    try {
      const response = await this.httpClient.get(`/api/v1/workflows/${workflowId}`);
      const workflow = response.data.data;
      
      // Ensure backup directory exists
      if (!fs.existsSync(this.config.backupDir)) {
        fs.mkdirSync(this.config.backupDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.config.backupDir, `${workflow.name}-${timestamp}.json`);
      
      fs.writeFileSync(backupPath, JSON.stringify(workflow, null, 2));
      console.log(`✅ Backup saved: ${backupPath}`);
      
      return backupPath;
    } catch (error) {
      console.warn(`⚠️ Could not backup workflow ${workflowId}: ${error.message}`);
      return null;
    }
  }

  async loadWorkflowDefinition(workflowPath) {
    // Support both absolute and relative paths
    const fullPath = path.isAbsolute(workflowPath) 
      ? workflowPath 
      : path.join(this.config.workflowsDir, workflowPath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Workflow file not found: ${fullPath}`);
    }

    try {
      const workflowData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      console.log(`📄 Loaded workflow: ${workflowData.name}`);
      return workflowData;
    } catch (error) {
      throw new Error(`Failed to parse workflow JSON: ${error.message}`);
    }
  }

  async validateWorkflowStructure(workflowData) {
    console.log(`🔍 Validating workflow structure: ${workflowData.name}`);
    
    const requiredFields = ['name', 'nodes', 'connections'];
    const missing = requiredFields.filter(field => !workflowData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Invalid workflow structure. Missing fields: ${missing.join(', ')}`);
    }
    
    if (!Array.isArray(workflowData.nodes) || workflowData.nodes.length === 0) {
      throw new Error('Workflow must contain at least one node');
    }
    
    // Validate node structure
    for (const node of workflowData.nodes) {
      const requiredNodeFields = ['id', 'name', 'type', 'position'];
      const missingNodeFields = requiredNodeFields.filter(field => !node[field]);
      
      if (missingNodeFields.length > 0) {
        throw new Error(`Invalid node '${node.name || node.id}': Missing fields: ${missingNodeFields.join(', ')}`);
      }
    }
    
    console.log(`✅ Workflow structure valid: ${workflowData.nodes.length} nodes`);
    return true;
  }

  async findWorkflowFiles(pattern) {
    console.log(`🔍 Searching for workflow files: ${pattern}`);
    
    try {
      const files = await glob(pattern, { 
        cwd: this.config.workflowsDir,
        absolute: false 
      });
      
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      console.log(`📁 Found ${jsonFiles.length} workflow files`);
      
      return jsonFiles.map(f => path.join(this.config.workflowsDir, f));
    } catch (error) {
      throw new Error(`Failed to search for workflow files: ${error.message}`);
    }
  }

  async findExistingWorkflow(workflowName) {
    try {
      const response = await this.httpClient.get('/api/v1/workflows');
      const workflows = response.data.data;
      
      return workflows.find(w => w.name === workflowName);
    } catch (error) {
      console.warn('Could not search existing workflows:', error.message);
      return null;
    }
  }

  async deployWorkflow(workflowData, options = {}) {
    const { backup = true, activate = false } = options;
    
    console.log(`🚀 Deploying workflow: ${workflowData.name}`);
    
    // Check for existing workflow
    const existingWorkflow = await this.findExistingWorkflow(workflowData.name);
    
    if (existingWorkflow) {
      if (backup) {
        await this.backupExistingWorkflow(existingWorkflow.id);
      }
      
      // Update existing workflow
      console.log(`🔄 Updating existing workflow: ${existingWorkflow.id}`);
      
      try {
        const response = await this.httpClient.put(
          `/api/v1/workflows/${existingWorkflow.id}`,
          workflowData
        );
        
        const updatedWorkflow = response.data.data;
        console.log(`✅ Workflow updated successfully: ${updatedWorkflow.id}`);
        
        if (activate) {
          await this.activateWorkflow(updatedWorkflow.id);
        }
        
        return updatedWorkflow;
      } catch (error) {
        throw new Error(`Failed to update workflow: ${error.message}`);
      }
    } else {
      // Create new workflow
      console.log('📝 Creating new workflow...');
      
      try {
        const response = await this.httpClient.post('/api/v1/workflows', workflowData);
        const newWorkflow = response.data.data || response.data;
        console.log(`✅ Workflow created successfully: ${newWorkflow.id}`);
        
        if (activate) {
          await this.activateWorkflow(newWorkflow.id);
        }
        
        return newWorkflow;
      } catch (error) {
        console.error('API Error Details:', error.response?.data || error.message);
        console.error('Full response:', JSON.stringify(error.response?.data, null, 2));
        throw new Error(`Failed to create workflow: ${error.message}`);
      }
    }
  }

  async activateWorkflow(workflowId) {
    console.log(`▶️ Activating workflow: ${workflowId}`);
    
    try {
      await this.httpClient.patch(`/api/v1/workflows/${workflowId}`, {
        active: true
      });
      console.log('✅ Workflow activated successfully');
    } catch (error) {
      throw new Error(`Failed to activate workflow: ${error.message}`);
    }
  }

  async validateCredentials(workflowData = null) {
    console.log('🔑 Validating credentials...');
    
    try {
      const response = await this.httpClient.get('/api/v1/credentials');
      const credentials = response.data.data;
      
      console.log(`📊 Found ${credentials.length} configured credentials`);
      
      // If workflow data provided, extract required credential types
      if (workflowData) {
        const requiredCredTypes = new Set();
        
        workflowData.nodes.forEach(node => {
          if (node.credentials) {
            Object.keys(node.credentials).forEach(credType => {
              requiredCredTypes.add(credType);
            });
          }
        });
        
        if (requiredCredTypes.size > 0) {
          console.log(`🔍 Workflow requires credentials: ${Array.from(requiredCredTypes).join(', ')}`);
          
          const missing = Array.from(requiredCredTypes).filter(type => 
            !credentials.some(cred => cred.type === type)
          );
          
          if (missing.length > 0) {
            console.warn(`⚠️ Missing required credentials: ${missing.join(', ')}`);
            console.log('📝 Create these credentials in n8n before deploying:');
            missing.forEach(type => {
              console.log(`   - ${type}`);
            });
            return false;
          }
          
          console.log('✅ All required credentials found');
        }
      }
      
      return true;
    } catch (error) {
      console.warn('Could not validate credentials:', error.message);
      return false;
    }
  }

  async listWorkflows() {
    try {
      const response = await this.httpClient.get('/api/v1/workflows');
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to list workflows: ${error.message}`);
    }
  }

  async deployWorkflows(input, options = {}) {
    const { 
      activate = false, 
      skipCredentialCheck = false, 
      skipValidation = false,
      backupExisting = true,
      force = false
    } = options;
    
    console.log('🎯 Starting workflow deployment...\n');
    
    try {
      // Step 1: Validate environment
      await this.validateEnvironment();
      
      // Step 2: Determine workflow files to deploy
      let workflowFiles = [];
      
      if (fs.statSync(input).isDirectory()) {
        console.log(`📁 Deploying all workflows from directory: ${input}`);
        workflowFiles = await this.findWorkflowFiles(path.join(input, '*.json'));
      } else if (fs.statSync(input).isFile()) {
        console.log(`📄 Deploying single workflow: ${input}`);
        workflowFiles = [input];
      } else if (input.includes('*')) {
        console.log(`🔍 Deploying workflows matching pattern: ${input}`);
        workflowFiles = await this.findWorkflowFiles(input);
      } else {
        throw new Error(`Invalid input: ${input}. Must be file, directory, or glob pattern`);
      }
      
      if (workflowFiles.length === 0) {
        throw new Error('No workflow files found to deploy');
      }
      
      console.log(`📋 Found ${workflowFiles.length} workflow(s) to deploy\n`);
      
      const deploymentResults = [];
      
      // Step 3: Deploy each workflow
      for (const workflowFile of workflowFiles) {
        try {
          console.log(`\n🔄 Processing: ${path.basename(workflowFile)}`);
          
          // Load workflow data
          const workflowData = await this.loadWorkflowDefinition(workflowFile);
          
          // Validate workflow structure
          if (!skipValidation) {
            await this.validateWorkflowStructure(workflowData);
          }
          
          // Check credentials
          if (!skipCredentialCheck) {
            const credentialsValid = await this.validateCredentials(workflowData);
            if (!credentialsValid && !force) {
              console.log('⚠️ Skipping due to missing credentials. Use --force to deploy anyway.');
              deploymentResults.push({ 
                file: workflowFile, 
                status: 'skipped', 
                reason: 'missing_credentials' 
              });
              continue;
            }
          }
          
          // Deploy workflow
          const deployedWorkflow = await this.deployWorkflow(workflowData, { 
            backup: backupExisting, 
            activate 
          });
          
          deploymentResults.push({ 
            file: workflowFile, 
            status: 'success', 
            workflow: deployedWorkflow 
          });
          
        } catch (error) {
          console.error(`❌ Failed to deploy ${path.basename(workflowFile)}: ${error.message}`);
          deploymentResults.push({ 
            file: workflowFile, 
            status: 'failed', 
            error: error.message 
          });
          
          if (!force) {
            throw error;
          }
        }
      }
      
      // Step 4: Summary
      console.log('\n🎉 Deployment Summary:');
      const successful = deploymentResults.filter(r => r.status === 'success');
      const failed = deploymentResults.filter(r => r.status === 'failed');
      const skipped = deploymentResults.filter(r => r.status === 'skipped');
      
      console.log(`   ✅ Successful: ${successful.length}`);
      console.log(`   ❌ Failed: ${failed.length}`);
      console.log(`   ⏭️ Skipped: ${skipped.length}`);
      
      successful.forEach(result => {
        const wf = result.workflow;
        console.log(`      ${wf.id}: ${wf.name} (${wf.active ? 'active' : 'inactive'})`);
      });
      
      if (failed.length > 0) {
        console.log('\n❌ Failed deployments:');
        failed.forEach(result => {
          console.log(`      ${path.basename(result.file)}: ${result.error}`);
        });
      }
      
      return deploymentResults;
      
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      throw error;
    }
  }
}

// CLI interface  
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployer = new N8nDeployer();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'deploy';
  
  // Parse flags
  const flags = {
    activate: args.includes('--activate'),
    skipCredentialCheck: args.includes('--skip-credentials'),
    skipValidation: args.includes('--skip-validation'),
    force: args.includes('--force'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  // Get input (file, directory, or pattern)
  let input = args.find(arg => !arg.startsWith('--') && arg !== command);
  
  // Default input handling
  if (!input && command === 'deploy') {
    input = path.join(__dirname, '../workflows'); // Default to workflows directory
  }
  
  // Help text
  const showHelp = () => {
    console.log(`n8n Universal Workflow Deployer\n`);
    console.log('Usage:');
    console.log('  node deploy.js <command> [input] [options]\n');
    console.log('Commands:');
    console.log('  deploy <input>    Deploy workflow(s) from file, directory, or pattern');
    console.log('  list              List all existing workflows in n8n');
    console.log('  validate <input>  Validate workflow file(s) without deploying');
    console.log('  backup            Backup all existing workflows\n');
    console.log('Input types:');
    console.log('  file.json         Deploy single workflow file');
    console.log('  /path/to/dir      Deploy all .json files in directory');
    console.log('  "*.json"          Deploy files matching glob pattern\n');
    console.log('Options:');
    console.log('  --activate            Activate workflows after deployment');
    console.log('  --skip-credentials    Skip credential validation');
    console.log('  --skip-validation     Skip workflow structure validation');
    console.log('  --force               Continue on errors, deploy anyway');
    console.log('  --help, -h            Show this help\n');
    console.log('Examples:');
    console.log('  node deploy.js deploy my-workflow.json --activate');
    console.log('  node deploy.js deploy ./workflows --force');
    console.log('  node deploy.js deploy "pe-*.json" --skip-credentials');
    console.log('  node deploy.js validate ./workflows');
    console.log('  node deploy.js list');
  };
  
  if (flags.help) {
    showHelp();
    process.exit(0);
  }
  
  switch (command) {
    case 'deploy':
      if (!input) {
        console.error('❌ Input required for deploy command. Use --help for usage.');
        process.exit(1);
      }
      
      deployer.deployWorkflows(input, flags)
        .then(results => {
          const successful = results.filter(r => r.status === 'success').length;
          console.log(`\n✅ Deployment complete! ${successful}/${results.length} workflows deployed successfully`);
          process.exit(results.some(r => r.status === 'failed') ? 1 : 0);
        })
        .catch(error => {
          console.error(`\n❌ Deployment failed: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'list':
      deployer.listWorkflows()
        .then(workflows => {
          console.log('\n📋 Existing workflows:');
          if (workflows.length === 0) {
            console.log('   No workflows found');
          } else {
            workflows.forEach(w => {
              console.log(`   ${w.id}: ${w.name} (${w.active ? 'active' : 'inactive'}) - ${w.nodes?.length || 0} nodes`);
            });
          }
        })
        .catch(error => {
          console.error('Failed to list workflows:', error.message);
          process.exit(1);
        });
      break;
      
    case 'validate':
      if (!input) {
        console.error('❌ Input required for validate command. Use --help for usage.');
        process.exit(1);
      }
      
      (async () => {
        try {
          await deployer.validateEnvironment();
          
          let workflowFiles = [];
          if (fs.statSync(input).isDirectory()) {
            workflowFiles = await deployer.findWorkflowFiles(path.join(input, '*.json'));
          } else {
            workflowFiles = [input];
          }
          
          console.log(`\n🔍 Validating ${workflowFiles.length} workflow(s)...\n`);
          
          let validCount = 0;
          for (const file of workflowFiles) {
            try {
              const workflowData = await deployer.loadWorkflowDefinition(file);
              await deployer.validateWorkflowStructure(workflowData);
              if (!flags.skipCredentialCheck) {
                await deployer.validateCredentials(workflowData);
              }
              validCount++;
            } catch (error) {
              console.error(`❌ ${path.basename(file)}: ${error.message}`);
            }
          }
          
          console.log(`\n✅ Validation complete: ${validCount}/${workflowFiles.length} workflows valid`);
          process.exit(validCount === workflowFiles.length ? 0 : 1);
        } catch (error) {
          console.error('Validation failed:', error.message);
          process.exit(1);
        }
      })();
      break;
      
    case 'backup':
      (async () => {
        try {
          const workflows = await deployer.listWorkflows();
          console.log(`\n💾 Backing up ${workflows.length} workflows...\n`);
          
          let backupCount = 0;
          for (const workflow of workflows) {
            try {
              await deployer.backupExistingWorkflow(workflow.id);
              backupCount++;
            } catch (error) {
              console.error(`❌ Failed to backup ${workflow.name}: ${error.message}`);
            }
          }
          
          console.log(`\n✅ Backup complete: ${backupCount}/${workflows.length} workflows backed up`);
          process.exit(0);
        } catch (error) {
          console.error('Backup failed:', error.message);
          process.exit(1);
        }
      })();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

export default N8nDeployer;