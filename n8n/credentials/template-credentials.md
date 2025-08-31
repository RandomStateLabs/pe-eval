# n8n Credential Templates

This directory contains templates for setting up required credentials in your n8n instance.

## Required Credentials

### 1. Google Drive OAuth2 API
**Credential Type**: `googleDriveOAuth2Api`
**Purpose**: Monitor company folders for new documents

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs for your n8n instance
6. Configure in n8n with:
   - Client ID
   - Client Secret
   - Scopes: `https://www.googleapis.com/auth/drive.readonly`

### 2. Google Sheets OAuth2 API  
**Credential Type**: `googleSheetsOAuth2Api`
**Purpose**: Update time-series database with extracted metrics

**Setup Steps**:
1. Use same Google Cloud project as Drive API
2. Enable Google Sheets API
3. Use same OAuth 2.0 credentials or create new ones
4. Configure in n8n with:
   - Client ID
   - Client Secret  
   - Scopes: `https://www.googleapis.com/auth/spreadsheets`

### 3. OpenAI API
**Credential Type**: `openAiApi`
**Purpose**: LLM validation and enhancement of extracted metrics

**Setup Steps**:
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Configure in n8n with:
   - API Key
   - Organization ID (optional)

## Security Best Practices

### Credential Management
- Never commit actual API keys to version control
- Use n8n's credential encryption features
- Regularly rotate API keys
- Monitor API usage and set billing alerts
- Use least privilege access (read-only for Drive, specific sheet access for Sheets)

### Google API Security
- Restrict OAuth redirect URIs to your n8n domain only
- Enable 2FA on Google accounts with API access
- Use service accounts for production deployments
- Monitor Google Cloud audit logs

### OpenAI Security
- Set usage limits and monitoring
- Use project-specific API keys
- Monitor token usage and costs
- Enable usage notifications

## Testing Credentials

Use the deployment script to validate credentials:

```bash
# Validate all credentials
cd n8n/scripts && node deploy.js validate

# Test specific credential
cd n8n/scripts && node deploy.js deploy --skip-credentials
```

## Troubleshooting

### Common Issues

**Google Drive Access Denied**:
- Verify OAuth scopes include drive.readonly
- Check folder sharing permissions
- Ensure n8n redirect URI is authorized

**Google Sheets Permission Error**:
- Verify OAuth scopes include spreadsheets
- Check spreadsheet sharing permissions
- Ensure service account has editor access

**OpenAI Rate Limiting**:
- Check API usage limits
- Implement exponential backoff
- Consider upgrading API tier

### Debug Steps

1. Test credentials in n8n interface manually
2. Check n8n logs for authentication errors
3. Verify API quotas and billing status
4. Test with minimal workflow first

## Environment Variables

For deployment scripts, set these environment variables:

```bash
# n8n Instance
export N8N_URL="http://localhost:5678"
export N8N_API_KEY="your_n8n_api_key"

# Optional: For automated credential setup
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"
export OPENAI_API_KEY="your_openai_api_key"
```