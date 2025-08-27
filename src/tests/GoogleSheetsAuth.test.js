import { GoogleSheetsAuth } from '../services/GoogleSheetsAuth.js';
import config from '../config/environment.js';

/**
 * Test Google Sheets Authentication Service
 * Validates service account authentication and basic API access
 */
async function testGoogleSheetsAuth() {
  console.log('🧪 Testing Google Sheets Authentication Service...\n');
  
  try {
    // Initialize authentication service
    console.log('1. Initializing GoogleSheetsAuth service...');
    const authService = new GoogleSheetsAuth();
    
    // Test authentication initialization
    console.log('2. Testing service account authentication...');
    await authService.initialize();
    console.log('✅ Authentication successful');
    
    // Verify clients are available
    console.log('3. Verifying API clients...');
    const sheetsClient = authService.getSheetsClient();
    const driveClient = authService.getDriveClient();
    console.log('✅ Sheets and Drive clients initialized');
    
    // Test basic API operation with retry logic
    console.log('4. Testing API operation with retry logic...');
    const testOperation = async () => {
      // Simple operation to test API access
      return await sheetsClient.spreadsheets.create({
        requestBody: {
          properties: {
            title: `PE-Eval-Test-${Date.now()}`
          }
        }
      });
    };
    
    const result = await authService.executeWithRetry(
      testOperation,
      'create-test-spreadsheet',
      2
    );
    
    console.log('✅ API operation successful');
    console.log(`   Created test spreadsheet: ${result.data.spreadsheetId}`);
    
    // Clean up test spreadsheet
    console.log('5. Cleaning up test resources...');
    await driveClient.files.delete({
      fileId: result.data.spreadsheetId
    });
    console.log('✅ Test cleanup complete');
    
    console.log('\n🎉 All Google Sheets authentication tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('   Stack:', error.stack);
    
    // Provide helpful debugging information
    console.log('\n🔍 Debugging Information:');
    console.log('   Service Account:', config.google.serviceAccountEmail);
    console.log('   Project ID:', config.google.projectId);
    console.log('   Scopes:', config.google.scopes);
    
    return false;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGoogleSheetsAuth()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

export { testGoogleSheetsAuth };