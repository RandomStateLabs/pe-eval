/**
 * Company Spreadsheet Provisioner Service
 * Handles automatic creation and management of company-specific spreadsheets
 */

import { StateDatabase } from './StateDatabase.js';
import logger from '../utils/logger.js';
import config from '../config/environment.js';

export class CompanySpreadsheetProvisioner {
  constructor() {
    this.stateDb = new StateDatabase();
    this.companyRegistry = new Map(); // Track company -> spreadsheetId mappings
    this.initialized = false;
  }

  /**
   * Initialize the provisioner service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      logger.info('Initializing CompanySpreadsheetProvisioner...');
      
      await this.stateDb.initialize();
      
      // Load existing company mappings from Drive
      await this.loadExistingMappings();
      
      this.initialized = true;
      logger.info('CompanySpreadsheetProvisioner initialized successfully');
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize CompanySpreadsheetProvisioner', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get or create spreadsheet for a company
   * @param {string} companyName - Company name
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Spreadsheet details
   */
  async provisionCompanySpreadsheet(companyName, options = {}) {
    this.ensureInitialized();
    
    const timer = logger.timer('provision-company-spreadsheet');
    
    try {
      // Normalize company name for consistency
      const normalizedName = this.normalizeCompanyName(companyName);
      
      // Check if spreadsheet already exists
      if (this.companyRegistry.has(normalizedName)) {
        const existingId = this.companyRegistry.get(normalizedName);
        logger.info('Using existing company spreadsheet', {
          company: normalizedName,
          spreadsheetId: existingId
        });
        
        timer.end({ 
          company: normalizedName, 
          action: 'existing',
          spreadsheetId: existingId 
        });
        
        return {
          spreadsheetId: existingId,
          isNew: false,
          company: normalizedName
        };
      }
      
      // Check Drive for existing spreadsheet
      const existingSpreadsheet = await this.findExistingSpreadsheet(normalizedName);
      if (existingSpreadsheet) {
        this.companyRegistry.set(normalizedName, existingSpreadsheet.id);
        
        logger.info('Found existing spreadsheet in Drive', {
          company: normalizedName,
          spreadsheetId: existingSpreadsheet.id
        });
        
        timer.end({ 
          company: normalizedName, 
          action: 'found',
          spreadsheetId: existingSpreadsheet.id 
        });
        
        return {
          spreadsheetId: existingSpreadsheet.id,
          isNew: false,
          company: normalizedName
        };
      }
      
      // Create new spreadsheet
      const metadata = {
        createdAt: new Date().toISOString(),
        industry: options.industry || 'Unknown',
        stage: options.stage || 'Unknown',
        sourceFolder: options.sourceFolder || null,
        ...options.metadata
      };
      
      const spreadsheetId = await this.stateDb.createCompanySpreadsheet(
        normalizedName,
        metadata
      );
      
      // Register mapping
      this.companyRegistry.set(normalizedName, spreadsheetId);
      
      // Set sharing permissions if specified
      if (options.shareWith) {
        await this.configureSharing(spreadsheetId, options.shareWith);
      }
      
      // Add to monitoring if configured
      if (config.monitoring?.autoWatch) {
        await this.addToMonitoring(spreadsheetId, normalizedName);
      }
      
      const duration = timer.end({ 
        company: normalizedName, 
        action: 'created',
        spreadsheetId 
      });
      
      logger.info('New company spreadsheet provisioned', {
        company: normalizedName,
        spreadsheetId,
        duration: `${duration}ms`
      });
      
      return {
        spreadsheetId,
        isNew: true,
        company: normalizedName,
        metadata
      };
      
    } catch (error) {
      timer.end({ error: error.message });
      logger.error('Failed to provision company spreadsheet', {
        company: companyName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Batch provision multiple companies
   * @param {Array<Object>} companies - Array of company configurations
   * @returns {Promise<Array>} Provisioning results
   */
  async batchProvision(companies) {
    this.ensureInitialized();
    
    const timer = logger.timer('batch-provision');
    const results = [];
    
    logger.info('Starting batch provisioning', { 
      companyCount: companies.length 
    });
    
    for (const company of companies) {
      try {
        const result = await this.provisionCompanySpreadsheet(
          company.name,
          company.options || {}
        );
        results.push({ success: true, ...result });
        
      } catch (error) {
        logger.error('Failed to provision company in batch', {
          company: company.name,
          error: error.message
        });
        results.push({
          success: false,
          company: company.name,
          error: error.message
        });
      }
    }
    
    const duration = timer.end({
      total: companies.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
    
    logger.info('Batch provisioning complete', {
      duration: `${duration}ms`,
      successRate: `${(results.filter(r => r.success).length / companies.length * 100).toFixed(1)}%`
    });
    
    return results;
  }

  /**
   * Find existing spreadsheet by company name
   * @param {string} companyName - Company name
   * @returns {Promise<Object|null>} Spreadsheet info or null
   * @private
   */
  async findExistingSpreadsheet(companyName) {
    try {
      const driveClient = this.stateDb.auth.getDriveClient();
      const spreadsheetName = `${config.database.companySpreadsheetPrefix}${companyName}`;
      
      const response = await this.stateDb.auth.executeWithRetry(
        async () => driveClient.files.list({
          q: `name='${spreadsheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
          fields: 'files(id, name, createdTime, modifiedTime)',
          spaces: 'drive',
          ...(config.database.rootFolderId && {
            q: `name='${spreadsheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and '${config.database.rootFolderId}' in parents and trashed=false`
          })
        }),
        'find-existing-spreadsheet'
      );
      
      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }
      
      return null;
      
    } catch (error) {
      logger.warn('Error searching for existing spreadsheet', {
        company: companyName,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Configure sharing permissions for spreadsheet
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {Array} shareWith - Array of email addresses or domains
   * @private
   */
  async configureSharing(spreadsheetId, shareWith) {
    const driveClient = this.stateDb.auth.getDriveClient();
    
    for (const recipient of shareWith) {
      try {
        const permission = {
          type: recipient.includes('@') ? 'user' : 'domain',
          role: 'writer',
          emailAddress: recipient.includes('@') ? recipient : undefined,
          domain: !recipient.includes('@') ? recipient : undefined
        };
        
        await this.stateDb.auth.executeWithRetry(
          async () => driveClient.permissions.create({
            fileId: spreadsheetId,
            requestBody: permission,
            sendNotificationEmail: false
          }),
          'configure-sharing'
        );
        
        logger.info('Sharing configured', { spreadsheetId, recipient });
        
      } catch (error) {
        logger.error('Failed to configure sharing', {
          spreadsheetId,
          recipient,
          error: error.message
        });
      }
    }
  }

  /**
   * Add spreadsheet to monitoring system
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} companyName - Company name
   * @private
   */
  async addToMonitoring(spreadsheetId, companyName) {
    // This would integrate with your monitoring system
    // For now, just log the action
    logger.info('Added to monitoring', {
      spreadsheetId,
      company: companyName,
      monitoringEnabled: true
    });
  }

  /**
   * Load existing company mappings from Drive
   * @private
   */
  async loadExistingMappings() {
    try {
      const driveClient = this.stateDb.auth.getDriveClient();
      const prefix = config.database.companySpreadsheetPrefix;
      
      const response = await this.stateDb.auth.executeWithRetry(
        async () => driveClient.files.list({
          q: `name contains '${prefix}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
          fields: 'files(id, name)',
          pageSize: 1000,
          ...(config.database.rootFolderId && {
            q: `name contains '${prefix}' and mimeType='application/vnd.google-apps.spreadsheet' and '${config.database.rootFolderId}' in parents and trashed=false`
          })
        }),
        'load-existing-mappings'
      );
      
      if (response.data.files) {
        response.data.files.forEach(file => {
          const companyName = file.name.replace(prefix, '');
          this.companyRegistry.set(this.normalizeCompanyName(companyName), file.id);
        });
        
        logger.info('Loaded existing company mappings', {
          count: this.companyRegistry.size
        });
      }
      
    } catch (error) {
      logger.warn('Could not load existing mappings', { 
        error: error.message 
      });
    }
  }

  /**
   * Normalize company name for consistency
   * @param {string} name - Company name
   * @returns {string} Normalized name
   * @private
   */
  normalizeCompanyName(name) {
    return name
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_')      // Replace spaces with underscores
      .toLowerCase();
  }

  /**
   * Get all registered companies
   * @returns {Array} List of registered companies
   */
  getRegisteredCompanies() {
    return Array.from(this.companyRegistry.keys());
  }

  /**
   * Get spreadsheet ID for a company
   * @param {string} companyName - Company name
   * @returns {string|null} Spreadsheet ID or null
   */
  getSpreadsheetId(companyName) {
    return this.companyRegistry.get(this.normalizeCompanyName(companyName)) || null;
  }

  /**
   * Ensure service is initialized
   * @private
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('CompanySpreadsheetProvisioner not initialized. Call initialize() first.');
    }
  }
}

export default CompanySpreadsheetProvisioner;