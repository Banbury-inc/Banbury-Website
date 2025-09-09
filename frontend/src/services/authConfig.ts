/**
 * Authentication configuration for different environments
 * This helps manage the redirect URI issues seen in the backend
 */

export type AuthProvider = 'google' | 'microsoft';

export const AUTH_CONFIG = {
  // Get the current environment redirect URI for a specific provider
  getRedirectUri(provider: AuthProvider = 'google'): string {
    const origin = window.location.origin;
    
    // Map of known domains to their correct redirect URIs
    const redirectUriMap: Record<string, Record<AuthProvider, string>> = {
      'http://localhost:3000': {
        google: 'http://localhost:3000/authentication/auth/callback',
        microsoft: 'http://localhost:3000/authentication/microsoft/callback'
      },
      'http://localhost:3001': {
        google: 'http://localhost:3001/authentication/auth/callback',
        microsoft: 'http://localhost:3001/authentication/microsoft/callback'
      },
      'http://localhost:3002': {
        google: 'http://localhost:3002/authentication/auth/callback',
        microsoft: 'http://localhost:3002/authentication/microsoft/callback'
      },
      'http://localhost:8080': {
        google: 'http://localhost:8080/authentication/auth/callback',
        microsoft: 'http://localhost:8080/authentication/microsoft/callback'
      },
      'https://banbury.io': {
        google: 'https://banbury.io/authentication/auth/callback',
        microsoft: 'https://banbury.io/authentication/microsoft/callback'
      },
      'https://www.banbury.io': {
        google: 'https://www.banbury.io/authentication/auth/callback',
        microsoft: 'https://www.banbury.io/authentication/microsoft/callback'
      },
      'https://dev.banbury.io': {
        google: 'https://dev.banbury.io/authentication/auth/callback',
        microsoft: 'https://dev.banbury.io/authentication/microsoft/callback'
      },
      'https://www.dev.banbury.io': {
        google: 'https://www.dev.banbury.io/authentication/auth/callback',
        microsoft: 'https://www.dev.banbury.io/authentication/microsoft/callback'
      },
    };

    return redirectUriMap[origin]?.[provider] || `${origin}/authentication/${provider === 'microsoft' ? 'microsoft' : 'auth'}/callback`;
  },

  // Check if current domain is allowed for OAuth
  isAllowedDomain(): boolean {
    const origin = window.location.origin;
    const allowedDomains = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:8080',
      'https://banbury.io',
      'https://www.banbury.io',
      'https://dev.banbury.io',
      'https://www.dev.banbury.io',
    ];

    return allowedDomains.includes(origin);
  },

  // Get helpful error message for disallowed domains
  getRedirectUriError(provider: AuthProvider = 'google'): string {
    const origin = window.location.origin;
    const providerName = provider === 'microsoft' ? 'Microsoft' : 'Google';
    return `The domain "${origin}" is not configured for ${providerName} OAuth. Please contact support to add this domain to the allowlist.`;
  }
};