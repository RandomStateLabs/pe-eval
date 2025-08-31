/**
 * n8n Workflow Validation Script
 * Validates workflow definitions and node configurations
 */

const fs = require('fs');
const path = require('path');

class N8nValidator {
  constructor() {
    this.workflowsDir = path.join(__dirname, '../workflows');
    this.nodesDir = path.join(__dirname, '../nodes');
    
    this.requiredFields = {
      workflow: ['name', 'nodes', 'connections'],
      node: ['id', 'name', 'type', 'typeVersion', 'position', 'parameters']
    };
    
    this.nodeTypes = {
      'n8n-nodes-base.googleDrive': 'Google Drive',
      'n8n-nodes-base.code': 'Code',
      'n8n-nodes-base.openAi': 'OpenAI',
      'n8n-nodes-base.googleSheets': 'Google Sheets',
      'n8n-nodes-base.extractFromFile': 'Extract from File'
    };
  }

  validateWorkflowStructure(workflow) {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    this.requiredFields.workflow.forEach(field => {
      if (!workflow[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }
    
    // Validate nodes
    if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
      return { valid: false, errors, warnings };
    }
    
    // Check each node
    workflow.nodes.forEach((node, index) => {
      const nodeErrors = this.validateNode(node, index);
      errors.push(...nodeErrors.errors);
      warnings.push(...nodeErrors.warnings);
    });
    
    // Validate connections
    const connectionErrors = this.validateConnections(workflow.nodes, workflow.connections);
    errors.push(...connectionErrors.errors);
    warnings.push(...connectionErrors.warnings);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        nodeCount: workflow.nodes.length,
        connectionCount: Object.keys(workflow.connections).length
      }
    };
  }

  validateNode(node, index) {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    this.requiredFields.node.forEach(field => {
      if (!node[field]) {
        errors.push(`Node ${index}: Missing required field '${field}'`);
      }
    });
    
    // Validate node type
    if (node.type && !this.nodeTypes[node.type]) {
      warnings.push(`Node ${index}: Unknown node type '${node.type}'`);
    }
    
    // Validate position
    if (node.position && (!Array.isArray(node.position) || node.position.length !== 2)) {
      errors.push(`Node ${index}: Position must be [x, y] array`);
    }
    
    // Validate parameters based on node type
    if (node.type && node.parameters) {
      const paramErrors = this.validateNodeParameters(node, index);
      errors.push(...paramErrors.errors);
      warnings.push(...paramErrors.warnings);
    }
    
    return { errors, warnings };
  }

  validateNodeParameters(node, index) {
    const errors = [];
    const warnings = [];
    
    switch (node.type) {
      case 'n8n-nodes-base.googleDrive':
        if (!node.parameters.resource || !node.parameters.operation) {
          errors.push(`Node ${index}: Google Drive node missing resource/operation`);
        }
        if (node.parameters.resource === 'file' && node.parameters.operation === 'trigger') {
          if (!node.parameters.triggerOn || !node.parameters.folderId) {
            warnings.push(`Node ${index}: Drive trigger should specify triggerOn and folderId`);
          }
        }
        break;
        
      case 'n8n-nodes-base.code':
        if (!node.parameters.jsCode) {
          errors.push(`Node ${index}: Code node missing jsCode parameter`);
        } else {
          // Basic JavaScript syntax check
          try {
            new Function(node.parameters.jsCode);
          } catch (syntaxError) {
            errors.push(`Node ${index}: JavaScript syntax error - ${syntaxError.message}`);
          }
        }
        break;
        
      case 'n8n-nodes-base.openAi':
        if (!node.parameters.resource || !node.parameters.operation) {
          errors.push(`Node ${index}: OpenAI node missing resource/operation`);
        }
        if (!node.parameters.prompt && node.parameters.operation === 'complete') {
          warnings.push(`Node ${index}: OpenAI completion node should have prompt`);
        }
        break;
        
      case 'n8n-nodes-base.googleSheets':
        if (!node.parameters.resource || !node.parameters.operation) {
          errors.push(`Node ${index}: Google Sheets node missing resource/operation`);
        }
        if (!node.parameters.documentId) {
          warnings.push(`Node ${index}: Google Sheets node should specify documentId`);
        }
        break;
        
      case 'n8n-nodes-base.extractFromFile':
        if (!node.parameters.binaryPropertyName) {
          warnings.push(`Node ${index}: Extract node should specify binaryPropertyName`);
        }
        break;
    }
    
    return { errors, warnings };
  }

  validateConnections(nodes, connections) {
    const errors = [];
    const warnings = [];
    
    const nodeIds = nodes.map(n => n.id);
    
    // Check connection structure
    Object.entries(connections).forEach(([sourceNodeId, outputs]) => {
      if (!nodeIds.includes(sourceNodeId)) {
        errors.push(`Connection references non-existent source node: ${sourceNodeId}`);
        return;
      }
      
      Object.entries(outputs).forEach(([outputName, connections]) => {
        if (!Array.isArray(connections)) {
          errors.push(`Invalid connection format for ${sourceNodeId}.${outputName}`);
          return;
        }
        
        connections.forEach((conn, index) => {
          if (!conn.node || !nodeIds.includes(conn.node)) {
            errors.push(`Connection ${sourceNodeId}.${outputName}[${index}] references non-existent target node: ${conn.node}`);
          }
          
          if (typeof conn.type !== 'string' || typeof conn.index !== 'number') {
            errors.push(`Invalid connection structure for ${sourceNodeId}.${outputName}[${index}]`);
          }
        });
      });
    });
    
    // Check for isolated nodes (except triggers)
    const connectedNodes = new Set();
    Object.values(connections).forEach(outputs => {
      Object.values(outputs).forEach(conns => {
        conns.forEach(conn => connectedNodes.add(conn.node));
      });
    });
    
    nodes.forEach(node => {
      const isSource = connections[node.id];
      const isTarget = connectedNodes.has(node.id);
      const isTrigger = node.type && (
        node.type.includes('trigger') || 
        node.type === 'n8n-nodes-base.googleDrive'
      );
      
      if (!isSource && !isTarget && !isTrigger) {
        warnings.push(`Node '${node.name}' (${node.id}) appears to be isolated`);
      }
    });
    
    return { errors, warnings };
  }

  async validateWorkflowFile(filePath) {
    console.log(`🔍 Validating workflow file: ${filePath}`);
    
    try {
      if (!fs.existsSync(filePath)) {
        return { valid: false, errors: [`File not found: ${filePath}`], warnings: [] };
      }
      
      const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const validation = this.validateWorkflowStructure(workflowData);
      
      return {
        ...validation,
        filePath,
        workflowName: workflowData.name
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to parse JSON: ${error.message}`],
        warnings: [],
        filePath
      };
    }
  }

  async validateAllWorkflows() {
    console.log('🔍 Validating all workflow files...\n');
    
    if (!fs.existsSync(this.workflowsDir)) {
      console.error(`❌ Workflows directory not found: ${this.workflowsDir}`);
      return [];
    }
    
    const workflowFiles = fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.json'));
    
    if (workflowFiles.length === 0) {
      console.log('📭 No workflow files found');
      return [];
    }
    
    const results = [];
    
    for (const file of workflowFiles) {
      const filePath = path.join(this.workflowsDir, file);
      const validation = await this.validateWorkflowFile(filePath);
      results.push(validation);
      
      if (validation.valid) {
        console.log(`✅ ${file} - Valid (${validation.summary?.nodeCount || 0} nodes)`);
      } else {
        console.log(`❌ ${file} - Invalid`);
        validation.errors.forEach(error => {
          console.log(`   🔸 Error: ${error}`);
        });
      }
      
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          console.log(`   ⚠️ Warning: ${warning}`);
        });
      }
      
      console.log('');
    }
    
    console.log('📊 Validation Summary:');
    console.log(`   Total files: ${workflowFiles.length}`);
    console.log(`   Valid: ${results.filter(r => r.valid).length}`);
    console.log(`   Invalid: ${results.filter(r => !r.valid).length}`);
    console.log(`   Warnings: ${results.reduce((sum, r) => sum + r.warnings.length, 0)}`);
    
    return results;
  }

  async validateCodeNodes() {
    console.log('🔍 Validating custom code nodes...\n');
    
    if (!fs.existsSync(this.nodesDir)) {
      console.log('📭 No custom nodes directory found');
      return [];
    }
    
    const nodeFiles = fs.readdirSync(this.nodesDir)
      .filter(file => file.endsWith('.js'));
    
    const results = [];
    
    for (const file of nodeFiles) {
      const filePath = path.join(this.nodesDir, file);
      console.log(`🔍 Checking: ${file}`);
      
      try {
        const code = fs.readFileSync(filePath, 'utf8');
        
        // Basic validation checks
        const checks = {
          hasInput: code.includes('$input'),
          hasReturn: code.includes('return'),
          hasErrorHandling: code.includes('try') && code.includes('catch'),
          hasLogging: code.includes('console.'),
          syntaxValid: true
        };
        
        // Syntax check
        try {
          new Function(code);
        } catch (syntaxError) {
          checks.syntaxValid = false;
          checks.syntaxError = syntaxError.message;
        }
        
        results.push({
          file,
          filePath,
          checks,
          valid: checks.syntaxValid
        });
        
        if (checks.syntaxValid) {
          console.log(`   ✅ Syntax valid`);
          if (!checks.hasErrorHandling) {
            console.log(`   ⚠️ No error handling detected`);
          }
          if (!checks.hasLogging) {
            console.log(`   ⚠️ No logging detected`);
          }
        } else {
          console.log(`   ❌ Syntax error: ${checks.syntaxError}`);
        }
        
      } catch (error) {
        results.push({
          file,
          filePath,
          valid: false,
          error: error.message
        });
        console.log(`   ❌ Read error: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('📊 Code Node Summary:');
    console.log(`   Total files: ${nodeFiles.length}`);
    console.log(`   Valid: ${results.filter(r => r.valid).length}`);
    console.log(`   Invalid: ${results.filter(r => !r.valid).length}`);
    
    return results;
  }
}

// CLI interface
if (require.main === module) {
  const validator = new N8nValidator();
  
  const command = process.argv[2] || 'all';
  const target = process.argv[3];
  
  switch (command) {
    case 'all':
      Promise.all([
        validator.validateAllWorkflows(),
        validator.validateCodeNodes()
      ])
        .then(() => {
          console.log('\n✅ Validation complete!');
          process.exit(0);
        })
        .catch(error => {
          console.error(`\n❌ Validation failed: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'workflow':
      if (!target) {
        validator.validateAllWorkflows()
          .then(() => process.exit(0))
          .catch(error => {
            console.error(`\n❌ Validation failed: ${error.message}`);
            process.exit(1);
          });
      } else {
        const filePath = target.endsWith('.json') ? target : path.join(validator.workflowsDir, `${target}.json`);
        validator.validateWorkflowFile(filePath)
          .then(result => {
            if (result.valid) {
              console.log('✅ Workflow is valid');
            } else {
              console.log('❌ Workflow validation failed');
              result.errors.forEach(error => console.log(`   🔸 ${error}`));
            }
            process.exit(result.valid ? 0 : 1);
          })
          .catch(error => {
            console.error(`❌ Validation error: ${error.message}`);
            process.exit(1);
          });
      }
      break;
      
    case 'nodes':
      validator.validateCodeNodes()
        .then(() => {
          console.log('\n✅ Node validation complete!');
          process.exit(0);
        })
        .catch(error => {
          console.error(`\n❌ Node validation failed: ${error.message}`);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node validate.js [all|workflow|nodes] [target]');
      console.log('');
      console.log('Commands:');
      console.log('  all                     Validate workflows and nodes');
      console.log('  workflow [file]         Validate specific or all workflows');
      console.log('  nodes                   Validate custom code nodes');
      process.exit(1);
  }
}

module.exports = N8nValidator;