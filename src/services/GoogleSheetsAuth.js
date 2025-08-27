import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import config from '../config/environment.js';
import logger from '../utils/logger.js';

/**
 * Google Sheets API Authentication Service
 * Handles OAuth2 service account authentication and API client creation
 */
export class GoogleSheetsAuth {
  constructor() {
    this.auth = null;
    this.sheetsClient = null;
    this.driveClient = null;
    this.authenticated = false;
  }

  /**
   * Initialize Google API authentication with service account
   * @returns {Promise<boolean>} Authentication success status
   */
  async initialize() {
    try {
      logger.info('Initializing Google Sheets API authentication...');

      // Create GoogleAuth instance with service account credentials
      this.auth = new GoogleAuth({
        credentials: {
          client_email: config.google.serviceAccountEmail,
          private_key: config.google.privateKey,
          project_id: config.google.projectId
        },
        scopes: config.google.scopes
      });

      // Test authentication by getting access token
      const authClient = await this.auth.getClient();
      const accessToken = await authClient.getAccessToken();

      if (!accessToken.token) {
        throw new Error('Failed to obtain access token');
      }

      // Initialize Google APIs clients
      this.sheetsClient = google.sheets({ version: 'v4', auth: authClient });
      this.driveClient = google.drive({ version: 'v3', auth: authClient });

      // Test API access with a simple operation
      await this.testApiAccess();

      this.authenticated = true;
      logger.info('Google Sheets API authentication successful', {
        serviceAccount: config.google.serviceAccountEmail,
        scopes: config.google.scopes
      });

      return true;

    } catch (error) {
      logger.error('Google Sheets API authentication failed', {
        error: error.message,
        stack: error.stack,
        serviceAccount: config.google.serviceAccountEmail
      });
      
      this.authenticated = false;
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Test API access by attempting to get user information
   * @private
   */
  async testApiAccess() {
    try {
      // Test Sheets API access
      const sheetsResponse = await this.sheetsClient.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'PE-Eval-Auth-Test-' + Date.now()
          }
        }
      });

      const testSpreadsheetId = sheetsResponse.data.spreadsheetId;

      // Clean up test spreadsheet
      await this.driveClient.files.delete({
        fileId: testSpreadsheetId
      });

      logger.info('API access test successful');

    } catch (error) {
      logger.error('API access test failed', { error: error.message });
      throw new Error(`API access test failed: ${error.message}`);
    }
  }

  /**
   * Get authenticated Google Sheets client
   * @returns {object} Google Sheets API client
   */
  getSheetsClient() {
    if (!this.authenticated || !this.sheetsClient) {
      throw new Error('Google Sheets client not initialized. Call initialize() first.');
    }
    return this.sheetsClient;
  }

  /**
   * Get authenticated Google Drive client
   * @returns {object} Google Drive API client
   */
  getDriveClient() {
    if (!this.authenticated || !this.driveClient) {
      throw new Error('Google Drive client not initialized. Call initialize() first.');
    }
    return this.driveClient;
  }

  /**
   * Check if authentication is valid
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * Refresh authentication token if needed
   * @returns {Promise<boolean>} Refresh success status
   */
  async refreshAuth() {
    try {
      if (!this.auth) {
        throw new Error('Auth not initialized');
      }

      const authClient = await this.auth.getClient();
      const accessToken = await authClient.getAccessToken();

      if (accessToken.token) {
        logger.info('Authentication token refreshed successfully');
        return true;
      } else {
        throw new Error('Failed to refresh token');
      }

    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      this.authenticated = false;
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Handle API errors with appropriate retry logic
   * @param {Error} error - API error
   * @param {string} operation - Operation being performed
   * @returns {boolean} Whether retry should be attempted
   */
  shouldRetryError(error, operation) {
    const retryableCodes = [429, 500, 502, 503, 504]; // Rate limit, server errors
    const authErrorCodes = [401, 403]; // Authentication/authorization errors

    if (authErrorCodes.includes(error.code)) {
      logger.warn(`Authentication error in ${operation}, attempting token refresh`, {
        code: error.code,
        message: error.message
      });
      return true; // Retry after token refresh
    }

    if (retryableCodes.includes(error.code)) {
      logger.warn(`Retryable error in ${operation}`, {
        code: error.code,
        message: error.message
      });
      return true;
    }

    logger.error(`Non-retryable error in ${operation}`, {
      code: error.code,
      message: error.message
    });
    return false;
  }

  /**
   * Execute API operation with automatic retry and error handling
   * @param {Function} operation - API operation to execute
   * @param {string} operationName - Name of operation for logging
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<*>} Operation result
   */
  async executeWithRetry(operation, operationName, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          logger.info(`Operation ${operationName} succeeded on attempt ${attempt}`);
        }
        
        return result;

      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          logger.error(`Operation ${operationName} failed after ${maxRetries} attempts`, {
            error: error.message,
            attempts: maxRetries
          });
          break;
        }

        if (!this.shouldRetryError(error, operationName)) {
          logger.error(`Operation ${operationName} failed with non-retryable error`, {
            error: error.message,
            attempt
          });
          break;
        }

        // Handle authentication errors
        if ([401, 403].includes(error.code)) {
          try {
            await this.refreshAuth();
          } catch (refreshError) {
            logger.error('Token refresh failed during retry', {
              refreshError: refreshError.message
            });
            break;
          }
        }

        // Exponential backoff
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.info(`Retrying operation ${operationName} in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError;
  }
}

export default GoogleSheetsAuth;