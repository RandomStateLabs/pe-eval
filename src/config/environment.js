import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

export const config = {
  // Google API Configuration
  google: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
    projectId: process.env.GOOGLE_PROJECT_ID,
    // Google Sheets API scopes
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  },

  // Database Configuration
  database: {
    // Root folder ID in Google Drive for PE analysis
    rootFolderId: process.env.PE_ANALYSIS_ROOT_FOLDER_ID,
    // Template spreadsheet ID for new companies
    templateSpreadsheetId: process.env.TEMPLATE_SPREADSHEET_ID,
    // Naming conventions
    companySpreadsheetPrefix: 'PE-Analysis-',
    stateDatabaseFolder: 'State-Database'
  },

  // API Rate Limiting
  rateLimits: {
    // Google Sheets API: 100 requests per 100 seconds per user
    googleSheets: {
      maxRequests: 100,
      windowSeconds: 100,
      retryAttempts: 3,
      backoffMultiplier: 2
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE || 'logs/pe-eval.log'
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  // Metric Extraction Configuration
  metrics: {
    confidenceThreshold: 0.7,
    supportedTypes: ['revenue', 'valuation', 'arr', 'burn_rate', 'growth_rate', 'customer_count'],
    currencyUnits: ['USD', 'EUR', 'GBP'],
    percentageUnits: ['percent', 'percentage', '%']
  },

  // Delta Intelligence Configuration
  delta: {
    significanceThresholds: {
      revenue: { percentage: 10, absolute: 1000000 }, // 10% or $1M
      valuation: { percentage: 15, absolute: 10000000 }, // 15% or $10M
      arr: { percentage: 12, absolute: 500000 }, // 12% or $500K
      burn_rate: { percentage: 20, absolute: 100000 }, // 20% or $100K
      growth_rate: { percentage: 5, absolute: 5 }, // 5 percentage points
      customer_count: { percentage: 15, absolute: 100 } // 15% or 100 customers
    },
    alertPriorities: {
      critical: { percentageThreshold: 25, absoluteMultiplier: 5 },
      high: { percentageThreshold: 15, absoluteMultiplier: 2 },
      medium: { percentageThreshold: 10, absoluteMultiplier: 1 },
      low: { percentageThreshold: 5, absoluteMultiplier: 0.5 }
    }
  }
};

// Validation
const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_SERVICE_ACCOUNT_KEY',
  'GOOGLE_PROJECT_ID',
  'PE_ANALYSIS_ROOT_FOLDER_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export default config;