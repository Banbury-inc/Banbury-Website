# Microsoft Outlook Integration

## Overview

This document outlines the complete implementation of Microsoft Outlook email integration alongside the existing Gmail functionality, enabling users to connect and manage both Gmail and Outlook emails from a single interface.

## Features Implemented

### 1. Authentication & OAuth
- **Microsoft OAuth Support**: Extended authentication configuration to support Microsoft OAuth alongside Google
- **Multi-Provider Callbacks**: Created separate callback handlers for Microsoft authentication
- **Redirect URI Management**: Configured redirect URIs for Microsoft OAuth flows
- **Login Integration**: Added Microsoft login button to the login page

### 2. Email Service Architecture
- **Unified Email Interface**: Created unified email message format that works with both Gmail and Outlook
- **Provider-Specific Services**: Implemented Outlook-specific API calls and message handling
- **Type Safety**: Added comprehensive TypeScript interfaces for Outlook message structures
- **Error Handling**: Robust error handling for both providers

### 3. Email Management
- **Multi-Provider Email Tab**: New `MultiProviderEmailTab` component that supports both Gmail and Outlook
- **Provider Switching**: Users can switch between Gmail and Outlook accounts seamlessly
- **Unified Message Display**: Consistent UI for both email providers with provider indicators
- **Email Composition**: Send emails through either Gmail or Outlook

### 4. Provider Management
- **Email Provider Manager**: Dedicated UI for connecting and managing email accounts
- **Connection Status**: Real-time status indicators for each provider
- **OAuth Flow Management**: Guided connection process for both providers

### 5. Message Processing
- **Outlook Message Parsing**: Specialized utilities for processing Outlook message formats
- **Content Extraction**: Extract and format email content from Outlook API responses
- **Attachment Handling**: Support for Outlook attachments
- **Date/Time Formatting**: Consistent date formatting across providers

### 6. AI Assistant Integration
- **LangGraph Tools**: Added Outlook tools to the AI assistant for email automation
- **Tool Preferences**: Users can enable/disable Outlook tools independently
- **Message Retrieval**: AI can fetch recent Outlook messages
- **Email Sending**: AI can send emails through Outlook

## File Structure

### New Files Created
```
frontend/pages/authentication/microsoft/callback.tsx - Microsoft OAuth callback handler
frontend/src/components/LeftPanel/MultiProviderEmailTab.tsx - Multi-provider email interface
frontend/src/components/EmailProviderManager.tsx - Provider management UI
```

### Modified Files
```
frontend/src/services/authConfig.ts - Extended for Microsoft OAuth
frontend/src/services/apiService.ts - Added Microsoft OAuth methods
frontend/src/services/emailService.ts - Added Outlook email services and unified interfaces
frontend/src/services/scopeService.ts - Extended for multi-provider support
frontend/src/utils/emailUtils.ts - Added Outlook message processing utilities
frontend/src/pages/AuthCallback.tsx - Updated for multi-provider support
frontend/src/pages/Login.tsx - Added Microsoft login button
frontend/src/lib/langraph/agent.ts - Added Outlook AI tools
```

## API Endpoints Expected

The frontend expects the following backend API endpoints to be implemented:

### Microsoft Authentication
- `GET /authentication/microsoft/` - Initiate Microsoft OAuth
- `GET /authentication/microsoft/callback/` - Handle Microsoft OAuth callback
- `POST /authentication/microsoft/scopes/request/` - Request additional Microsoft scopes

### Outlook Email Operations
- `GET /authentication/outlook/list_messages/` - List Outlook messages
- `GET /authentication/outlook/messages/{messageId}/` - Get specific Outlook message
- `POST /authentication/outlook/send_message/` - Send Outlook email
- `PATCH /authentication/outlook/messages/{messageId}/` - Modify Outlook message
- `GET /authentication/outlook/messages/{messageId}/attachments/{attachmentId}` - Get attachment

### Multi-Provider Scope Management
- `GET /authentication/scopes/multi-provider/` - Get all provider scopes
- `GET /authentication/scopes/multi-provider/features/` - Get all provider features

## Usage

### For Users
1. **Connect Accounts**: Use the Email Provider Manager to connect Gmail and/or Outlook accounts
2. **Switch Providers**: Use the provider tabs in the email interface to switch between accounts
3. **Manage Emails**: Read, send, and organize emails from both providers in one interface
4. **AI Integration**: Use the AI assistant to manage emails across both providers

### For Developers
1. **Email Service**: Use `EmailService.listUnifiedMessages()` for provider-agnostic email listing
2. **Provider Status**: Check `ScopeService.getEmailProviderStatus()` for connection status
3. **Multi-Provider UI**: Use `MultiProviderEmailTab` component for email interfaces
4. **Provider Management**: Use `EmailProviderManager` for account connection flows

## Configuration

### OAuth Redirect URIs
The system supports the following redirect URI patterns:
- Google: `{origin}/authentication/auth/callback`
- Microsoft: `{origin}/authentication/microsoft/callback`

### Supported Domains
- localhost:3000, localhost:3001, localhost:3002, localhost:8080
- banbury.io, www.banbury.io, dev.banbury.io, www.dev.banbury.io

## Security Considerations

1. **Scope Management**: Users can grant permissions incrementally
2. **Provider Isolation**: Each provider's tokens are managed separately
3. **Domain Validation**: OAuth redirects only work on allowed domains
4. **Error Handling**: Sensitive information is not exposed in error messages

## Future Enhancements

1. **Additional Providers**: Framework supports adding more email providers
2. **Advanced Filtering**: Provider-specific email filtering and search
3. **Sync Status**: Real-time synchronization status indicators
4. **Bulk Operations**: Multi-provider bulk email operations
5. **Calendar Integration**: Extend to support Outlook Calendar alongside Gmail Calendar

## Testing

To test the Microsoft Outlook integration:

1. **Backend Setup**: Implement the required API endpoints
2. **Microsoft App Registration**: Register app in Microsoft Azure with appropriate scopes
3. **OAuth Configuration**: Configure redirect URIs in Microsoft app settings
4. **Frontend Testing**: Use the EmailProviderManager to connect accounts
5. **Email Operations**: Test reading, sending, and managing emails through both providers

## Troubleshooting

### Common Issues
1. **OAuth Errors**: Check redirect URI configuration in Microsoft app settings
2. **API Errors**: Verify backend endpoints are implemented correctly
3. **Scope Issues**: Ensure proper Microsoft Graph API scopes are requested
4. **CORS Issues**: Configure CORS settings for Microsoft Graph API calls

### Debug Information
- Check browser console for authentication errors
- Verify localStorage contains authToken and authProvider
- Monitor network requests to backend API endpoints
- Check sessionStorage for OAuth state information