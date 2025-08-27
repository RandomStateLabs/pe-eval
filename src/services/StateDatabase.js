import { GoogleSheetsAuth } from './GoogleSheetsAuth.js';
import { DATABASE_SCHEMAS, validateData, generateSheetsFormat } from '../models/DatabaseSchema.js';
import logger from '../utils/logger.js';
import config from '../config/environment.js';

/**
 * State Database Service
 * Manages Google Sheets as time-series state database for PE analysis
 */
export class StateDatabase {
  constructor() {
    this.auth = new GoogleSheetsAuth();
    this.initialized = false;
    this.sheetsClient = null;
    this.driveClient = null;
  }

  /**
   * Initialize the state database service
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize() {
    try {
      logger.info('Initializing StateDatabase service...');
      
      await this.auth.initialize();
      this.sheetsClient = this.auth.getSheetsClient();
      this.driveClient = this.auth.getDriveClient();
      this.initialized = true;
      
      logger.info('StateDatabase service initialized successfully');
      return true;
      
    } catch (error) {
      logger.error('StateDatabase initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a new company spreadsheet with all required sheets
   * @param {string} companyName - Company name
   * @param {Object} metadata - Company metadata
   * @returns {Promise<string>} Created spreadsheet ID
   */
  async createCompanySpreadsheet(companyName, metadata = {}) {
    this.ensureInitialized();
    
    const timer = logger.timer('create-company-spreadsheet');
    
    try {
      logger.info('Creating company spreadsheet', { companyName });
      
      // Create the main spreadsheet
      const spreadsheetTitle = `${config.database.companySpreadsheetPrefix}${companyName}`;
      const createResponse = await this.auth.executeWithRetry(
        async () => this.sheetsClient.spreadsheets.create({
          requestBody: {
            properties: {
              title: spreadsheetTitle,
              locale: 'en_US',
              timeZone: 'America/New_York'
            }
          }
        }),
        'create-spreadsheet'
      );
      
      const spreadsheetId = createResponse.data.spreadsheetId;
      logger.info('Base spreadsheet created', { spreadsheetId, companyName });
      
      // Create all required sheets
      await this.createRequiredSheets(spreadsheetId);
      
      // Initialize company metadata
      await this.initializeCompanyMetadata(spreadsheetId, companyName, metadata);
      
      // Move to appropriate folder if configured
      if (config.database.rootFolderId) {
        await this.moveToFolder(spreadsheetId, config.database.rootFolderId);
      }
      
      const duration = timer.end({
        companyName,
        spreadsheetId,
        sheetsCreated: Object.keys(DATABASE_SCHEMAS).length
      });
      
      logger.info('Company spreadsheet creation complete', {
        companyName,
        spreadsheetId,
        duration: `${duration}ms`
      });
      
      return spreadsheetId;
      
    } catch (error) {
      timer.end({ error: error.message });
      logger.error('Failed to create company spreadsheet', {
        companyName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create all required sheets in a spreadsheet
   * @param {string} spreadsheetId - Spreadsheet ID
   * @private
   */
  async createRequiredSheets(spreadsheetId) {
    const requests = [];
    let sheetId = 1; // Start from 1 (0 is default sheet)
    
    // Create requests for all schema sheets
    Object.values(DATABASE_SCHEMAS).forEach(schema => {
      const sheetFormat = generateSheetsFormat(schema);
      
      // Add sheet creation request
      requests.push({
        addSheet: {
          properties: {
            sheetId: sheetId,
            title: schema.sheetName,
            gridProperties: {
              rowCount: 1000,
              columnCount: schema.headers.length,
              frozenRowCount: 1 // Freeze header row
            }
          }
        }
      });
      
      // Add header formatting request
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: schema.headers.length
          },
          cell: {
            userEnteredFormat: sheetFormat.formatting.headerFormat
          },
          fields: 'userEnteredFormat'
        }
      });
      
      sheetId++;
    });
    
    // Delete the default sheet (Sheet1)
    requests.push({
      deleteSheet: {
        sheetId: 0
      }
    });
    
    // Execute all requests in batch
    await this.auth.executeWithRetry(
      async () => this.sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
      }),
      'create-sheets'
    );
    
    // Add headers to each sheet
    await this.addHeadersToSheets(spreadsheetId);
  }

  /**
   * Add headers to all sheets
   * @param {string} spreadsheetId - Spreadsheet ID
   * @private
   */
  async addHeadersToSheets(spreadsheetId) {
    const valueRequests = [];
    
    Object.values(DATABASE_SCHEMAS).forEach(schema => {
      valueRequests.push({
        range: `${schema.sheetName}!A1:${String.fromCharCode(64 + schema.headers.length)}1`,
        values: [schema.headers]
      });
    });
    
    await this.auth.executeWithRetry(
      async () => this.sheetsClient.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: valueRequests
        }
      }),
      'add-headers'
    );
  }

  /**
   * Initialize company metadata sheet
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} companyName - Company name
   * @param {Object} metadata - Company metadata
   * @private
   */
  async initializeCompanyMetadata(spreadsheetId, companyName, metadata) {
    const now = new Date().toISOString();
    const metadataRow = [
      companyName,
      metadata.tickerSymbol || '',
      metadata.industry || '',
      metadata.sector || '',
      metadata.analysisType || 'growth',
      metadata.priorityLevel || 'normal',
      now, // first_analysis_date
      now, // last_updated
      0,   // total_documents
      0,   // total_metrics
      metadata.primaryContact || '',
      metadata.dealStage || 'sourcing',
      spreadsheetId,
      config.database.rootFolderId || '',
      '1.0.0', // template_version
      metadata.createdBy || 'pe-eval-system',
      'active'
    ];
    
    await this.auth.executeWithRetry(
      async () => this.sheetsClient.spreadsheets.values.append({
        spreadsheetId,
        range: 'company_metadata!A:Q',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [metadataRow]
        }
      }),
      'initialize-metadata'
    );
  }

  /**
   * Append metric data to appropriate sheet
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} sheetType - Sheet type (revenue_history, valuation_history, etc.)
   * @param {Array} records - Array of record objects
   * @returns {Promise<Object>} Append result
   */
  async appendMetrics(spreadsheetId, sheetType, records) {
    this.ensureInitialized();
    
    if (!records || records.length === 0) {
      return { recordsAdded: 0 };
    }
    
    const schema = DATABASE_SCHEMAS[sheetType.toUpperCase()];
    if (!schema) {
      throw new Error(`Unknown sheet type: ${sheetType}`);
    }
    
    const timer = logger.timer('append-metrics');
    
    try {
      // Validate all records
      const validatedRecords = records.map(record => {
        const validation = validateData(record, schema);
        if (!validation.isValid) {
          logger.warn('Invalid record detected', {
            record,
            errors: validation.errors
          });
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        return record;
      });
      
      // Convert records to rows
      const rows = validatedRecords.map(record => 
        schema.headers.map(header => record[header] || '')
      );
      
      // Append to sheet
      const response = await this.auth.executeWithRetry(
        async () => this.sheetsClient.spreadsheets.values.append({
          spreadsheetId,
          range: `${schema.sheetName}!A:${String.fromCharCode(64 + schema.headers.length)}`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: rows
          }
        }),
        'append-metrics'
      );
      
      const recordsAdded = rows.length;
      const duration = timer.end({
        spreadsheetId,
        sheetType,
        recordsAdded
      });
      
      logger.stateUpdate(
        'company-from-spreadsheet', // Will be updated by calling service
        'append-metrics',
        recordsAdded,
        { sheetType, duration: `${duration}ms` }
      );
      
      return {
        recordsAdded,
        updatedRange: response.data.updates.updatedRange,
        updatedRows: response.data.updates.updatedRows,
        updatedColumns: response.data.updates.updatedColumns,
        updatedCells: response.data.updates.updatedCells
      };
      
    } catch (error) {
      timer.end({ error: error.message });
      logger.error('Failed to append metrics', {
        spreadsheetId,
        sheetType,
        recordCount: records.length,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Query metrics from sheet with filters
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} sheetType - Sheet type
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Query results
   */
  async queryMetrics(spreadsheetId, sheetType, filters = {}) {
    this.ensureInitialized();
    
    const schema = DATABASE_SCHEMAS[sheetType.toUpperCase()];
    if (!schema) {
      throw new Error(`Unknown sheet type: ${sheetType}`);
    }
    
    const timer = logger.timer('query-metrics');
    
    try {
      // Get all data from sheet
      const response = await this.auth.executeWithRetry(
        async () => this.sheetsClient.spreadsheets.values.get({
          spreadsheetId,
          range: `${schema.sheetName}!A:${String.fromCharCode(64 + schema.headers.length)}`
        }),
        'query-metrics'
      );
      
      const rows = response.data.values || [];
      if (rows.length <= 1) {
        return []; // No data beyond headers
      }
      
      // Convert rows to objects
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      let results = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
      
      // Apply filters
      results = this.applyFilters(results, filters);
      
      const duration = timer.end({
        spreadsheetId,
        sheetType,
        totalRows: dataRows.length,
        filteredRows: results.length
      });
      
      return results;
      
    } catch (error) {
      timer.end({ error: error.message });
      logger.error('Failed to query metrics', {
        spreadsheetId,
        sheetType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get latest metric values for delta calculation
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} metricName - Metric name
   * @param {number} limit - Number of recent records
   * @returns {Promise<Array>} Recent metric values
   */
  async getRecentMetrics(spreadsheetId, metricName, limit = 10) {
    const sheetTypes = ['REVENUE_HISTORY', 'VALUATION_HISTORY', 'KPI_SNAPSHOTS'];
    const allResults = [];
    
    for (const sheetType of sheetTypes) {
      try {
        const results = await this.queryMetrics(spreadsheetId, sheetType, {
          metric_name: metricName,
          limit: limit
        });
        allResults.push(...results);
      } catch (error) {
        logger.warn(`Failed to query ${sheetType} for recent metrics`, { error: error.message });
      }
    }
    
    // Sort by timestamp and limit
    return allResults
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Update company metadata
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {Object} updates - Metadata updates
   * @returns {Promise<void>}
   */
  async updateCompanyMetadata(spreadsheetId, updates) {
    this.ensureInitialized();
    
    // This is a simplified implementation
    // In production, you'd want to read current values and update specific fields
    const updateData = Object.entries(updates).map(([key, value]) => ({
      range: `company_metadata!A:Q`, // Would need to map fields to columns
      values: [[value]]
    }));
    
    await this.auth.executeWithRetry(
      async () => this.sheetsClient.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updateData
        }
      }),
      'update-metadata'
    );
  }

  /**
   * Move spreadsheet to folder
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} folderId - Target folder ID
   * @private
   */
  async moveToFolder(spreadsheetId, folderId) {
    await this.auth.executeWithRetry(
      async () => this.driveClient.files.update({
        fileId: spreadsheetId,
        addParents: folderId,
        fields: 'id, parents'
      }),
      'move-to-folder'
    );
  }

  /**
   * Apply filters to query results
   * @param {Array} results - Raw results
   * @param {Object} filters - Filters to apply
   * @returns {Array} Filtered results
   * @private
   */
  applyFilters(results, filters) {
    let filtered = results;
    
    Object.entries(filters).forEach(([field, value]) => {
      if (field === 'limit') {
        filtered = filtered.slice(0, parseInt(value));
      } else if (field === 'since') {
        const sinceDate = new Date(value);
        filtered = filtered.filter(record => 
          new Date(record.timestamp) >= sinceDate
        );
      } else {
        filtered = filtered.filter(record => 
          record[field] && record[field].toString().includes(value.toString())
        );
      }
    });
    
    return filtered;
  }

  /**
   * Ensure service is initialized
   * @private
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('StateDatabase service not initialized. Call initialize() first.');
    }
  }

  /**
   * Get database statistics
   * @param {string} spreadsheetId - Spreadsheet ID
   * @returns {Promise<Object>} Database statistics
   */
  async getDatabaseStats(spreadsheetId) {
    this.ensureInitialized();
    
    const stats = {};
    
    for (const [schemaName, schema] of Object.entries(DATABASE_SCHEMAS)) {
      try {
        const results = await this.queryMetrics(spreadsheetId, schemaName);
        stats[schema.sheetName] = {
          recordCount: results.length,
          lastUpdated: results.length > 0 
            ? Math.max(...results.map(r => new Date(r.timestamp || 0).getTime()))
            : null
        };
      } catch (error) {
        stats[schema.sheetName] = {
          recordCount: 0,
          error: error.message
        };
      }
    }
    
    return stats;
  }
}

export default StateDatabase;