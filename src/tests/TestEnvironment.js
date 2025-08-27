/**
 * Test Environment Configuration
 * Provides mock configuration for testing when actual credentials aren't available
 */

export const TEST_CONFIG = {
  google: {
    serviceAccountEmail: 'test-service-account@test-project.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK_TEST_KEY\n-----END PRIVATE KEY-----\n',
    projectId: 'test-project-id',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  },

  database: {
    rootFolderId: 'test-root-folder-id',
    templateSpreadsheetId: 'test-template-spreadsheet-id',
    companySpreadsheetPrefix: 'PE-Analysis-Test-',
    stateDatabaseFolder: 'State-Database-Test'
  },

  rateLimits: {
    googleSheets: {
      maxRequests: 100,
      windowSeconds: 100,
      retryAttempts: 3,
      backoffMultiplier: 2
    }
  },

  logging: {
    level: 'info',
    format: 'json',
    file: 'logs/pe-eval-test.log'
  },

  server: {
    port: 3001,
    host: 'localhost'
  },

  metrics: {
    confidenceThreshold: 0.7,
    supportedTypes: ['revenue', 'valuation', 'arr', 'burn_rate', 'growth_rate', 'customer_count'],
    currencyUnits: ['USD', 'EUR', 'GBP'],
    percentageUnits: ['percent', 'percentage', '%']
  },

  delta: {
    significanceThresholds: {
      revenue: { percentage: 10, absolute: 1000000 },
      valuation: { percentage: 15, absolute: 10000000 },
      arr: { percentage: 12, absolute: 500000 },
      burn_rate: { percentage: 20, absolute: 100000 },
      growth_rate: { percentage: 5, absolute: 5 },
      customer_count: { percentage: 15, absolute: 100 }
    },
    alertPriorities: {
      critical: { percentageThreshold: 25, absoluteMultiplier: 5 },
      high: { percentageThreshold: 15, absoluteMultiplier: 2 },
      medium: { percentageThreshold: 10, absoluteMultiplier: 1 },
      low: { percentageThreshold: 5, absoluteMultiplier: 0.5 }
    }
  }
};

export default TEST_CONFIG;