# GitHub API Integration for Banbury Workspaces

This document describes the GitHub API integration implementation for Banbury workspaces, allowing users to connect their GitHub accounts and access repository data through the AI assistant.

## Overview

The GitHub integration enables:
- OAuth authentication to connect GitHub accounts
- Access to repositories, issues, pull requests, and code
- AI assistant tools for GitHub operations
- Secure token storage and management

## Frontend Implementation (Completed)

### 1. GitHub Service (`/frontend/src/services/githubService.ts`)
- Handles OAuth flow initiation and callback
- Provides methods for all GitHub API operations
- Manages connection status checks

### 2. Authentication Configuration (`/frontend/src/services/authConfig.ts`)
- Added `getGitHubRedirectUri()` method for OAuth redirect URLs
- Supports all environments (localhost, dev, production)

### 3. UI Components

#### Settings Integration (`/frontend/src/components/modals/settings-tabs/GitHubConnection.tsx`)
- Shows connection status
- Displays connected user profile
- Allows connecting/disconnecting GitHub account

#### Data Viewer (`/frontend/src/components/integrations/GitHubDataViewer.tsx`)
- Browse repositories, issues, and pull requests
- Search and filter functionality
- Integration with workspace editor

### 4. OAuth Callback (`/frontend/pages/integrations/github/callback.tsx`)
- Handles OAuth callback from GitHub
- Exchanges authorization code for access token
- Redirects to appropriate page after authentication

### 5. AI Tools (`/frontend/src/lib/langraph/tools/githubTools.ts`)
- LangGraph tools for GitHub operations
- Search repositories, issues, and code
- Create issues programmatically

## Backend Implementation Requirements

### 1. OAuth Endpoints

#### `GET /integrations/github/oauth/authorize/`
```python
def github_oauth_authorize(request):
    """
    Initiates GitHub OAuth flow
    
    Query Parameters:
    - redirect_uri: The frontend callback URL
    - state: Optional state parameter for security
    
    Returns:
    {
        "authUrl": "https://github.com/login/oauth/authorize?..."
    }
    """
    # Build GitHub OAuth URL with:
    # - client_id from settings
    # - redirect_uri from request
    # - scope: "repo read:user read:org"
    # - state for CSRF protection
```

#### `GET /integrations/github/oauth/callback/`
```python
def github_oauth_callback(request):
    """
    Handles OAuth callback from GitHub
    
    Query Parameters:
    - code: Authorization code from GitHub
    - state: State parameter for validation
    - redirect_uri: The frontend callback URL
    
    Returns:
    {
        "success": true,
        "user": {
            "login": "username",
            "id": 123456,
            "avatar_url": "...",
            "name": "Full Name",
            "email": "email@example.com",
            ...
        }
    }
    """
    # 1. Validate state parameter
    # 2. Exchange code for access token
    # 3. Get user profile from GitHub
    # 4. Store token securely (encrypted)
    # 5. Return user data
```

### 2. GitHub API Wrapper Service

#### Connection Status
```python
@login_required
def github_connection_status(request):
    """
    GET /integrations/github/status/
    
    Returns:
    {
        "connected": true,
        "username": "github-username",
        "scopes": ["repo", "read:user"],
        "expires_at": null  # GitHub tokens don't expire
    }
    """
```

#### Disconnect Account
```python
@login_required
def github_disconnect(request):
    """
    DELETE /integrations/github/disconnect/
    
    Revokes token and removes from database
    """
```

### 3. GitHub Data Endpoints

All endpoints should check for valid GitHub token before proceeding.

```python
# User Profile
GET /integrations/github/user/

# Repositories
GET /integrations/github/repositories/
GET /integrations/github/repositories/{owner}/{repo}/

# Issues
GET /integrations/github/issues/
GET /integrations/github/repositories/{owner}/{repo}/issues/
POST /integrations/github/repositories/{owner}/{repo}/issues/
PUT /integrations/github/repositories/{owner}/{repo}/issues/{number}/

# Pull Requests
GET /integrations/github/pulls/
GET /integrations/github/repositories/{owner}/{repo}/pulls/

# Branches & Commits
GET /integrations/github/repositories/{owner}/{repo}/branches/
GET /integrations/github/repositories/{owner}/{repo}/commits/

# Search
GET /integrations/github/search/{type}/  # type: repositories, issues, code, commits, users

# File Content
GET /integrations/github/repositories/{owner}/{repo}/contents/{path}
```

### 4. Database Schema

```sql
-- GitHub OAuth tokens table
CREATE TABLE github_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,  -- Encrypted
    token_type VARCHAR(50) DEFAULT 'bearer',
    scope VARCHAR(255),
    github_user_id INTEGER,
    github_username VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_github_tokens_user_id ON github_tokens(user_id);
CREATE INDEX idx_github_tokens_github_username ON github_tokens(github_username);
```

### 5. Security Considerations

1. **Token Encryption**: Store GitHub access tokens encrypted using a secure encryption key
2. **Scope Limitation**: Request only necessary scopes (repo, read:user, read:org)
3. **Rate Limiting**: Implement rate limiting to avoid GitHub API limits
4. **Token Validation**: Validate tokens periodically and handle revoked tokens
5. **CSRF Protection**: Use state parameter in OAuth flow

### 6. Environment Variables

```bash
# GitHub OAuth App credentials
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Encryption key for storing tokens
GITHUB_TOKEN_ENCRYPTION_KEY=your_encryption_key

# Optional: GitHub App for higher rate limits
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
```

### 7. Error Handling

All endpoints should handle:
- Missing or invalid tokens
- GitHub API rate limits (403 with X-RateLimit headers)
- Network errors
- Invalid repository/issue/PR references

### 8. Webhook Support (Future Enhancement)

Consider adding webhook support for real-time updates:
- Repository events (push, releases)
- Issue/PR events (opened, closed, commented)
- Workflow run events

## Testing

### Frontend Testing
1. Test OAuth flow with different redirect URIs
2. Test connection/disconnection flow
3. Test data viewer with various repository types
4. Test AI tools with connected/disconnected states

### Backend Testing
1. Mock GitHub API responses
2. Test token encryption/decryption
3. Test rate limiting
4. Test error scenarios

## Deployment Checklist

1. **GitHub OAuth App Setup**
   - Create OAuth App at https://github.com/settings/developers
   - Add all redirect URIs for each environment
   - Note client ID and secret

2. **Environment Configuration**
   - Set all required environment variables
   - Generate secure encryption key
   - Configure allowed redirect URIs

3. **Database Migration**
   - Run migration to create github_tokens table
   - Add indexes for performance

4. **Security Review**
   - Verify token encryption
   - Check CSRF protection
   - Review scope requirements

## API Usage Examples

### Connect GitHub Account
```javascript
// Frontend
const result = await GitHubService.initiateGitHubAuth()
if (result.success && result.authUrl) {
  window.location.href = result.authUrl
}
```

### Get User's Repositories
```javascript
const repos = await GitHubService.getRepositories({
  type: 'owner',
  sort: 'updated',
  per_page: 30
})
```

### AI Assistant Usage
```
User: "Show me my most starred GitHub repositories"
AI: *uses search_github_repos tool*

User: "Create an issue in my project repo about the bug we discussed"
AI: *uses create_github_issue tool*
```

## Future Enhancements

1. **GitHub Actions Integration**
   - View workflow runs
   - Trigger workflows
   - Monitor deployment status

2. **Code Review Features**
   - AI-assisted code reviews
   - Automated PR descriptions
   - Security vulnerability scanning

3. **Project Management**
   - GitHub Projects integration
   - Milestone tracking
   - Team collaboration features

4. **Advanced Search**
   - Code search with syntax highlighting
   - Cross-repository search
   - Search history and saved searches