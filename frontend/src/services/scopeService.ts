import axios from 'axios'
import { CONFIG } from '../config/config'
import { AuthProvider } from './authConfig'

export type EmailProvider = 'gmail' | 'outlook';

export interface ProviderFeature {
  name: string
  description: string
  scopes: string[]
  required: boolean
  provider: AuthProvider
}

export interface GoogleFeature extends ProviderFeature {
  provider: 'google'
}

export interface MicrosoftFeature extends ProviderFeature {
  provider: 'microsoft'
}

export interface UserScopes {
  scopes: string[]
  available_features: {
    profile: boolean
    drive: boolean
    gmail: boolean
    calendar: boolean
  }
  message: string
}

export interface AvailableFeatures {
  features: {
    profile: GoogleFeature
    drive: GoogleFeature
    gmail: GoogleFeature
    calendar: GoogleFeature
  }
  message: string
}

// Extended interfaces for multi-provider support
export interface MultiProviderUserScopes {
  google?: UserScopes
  microsoft?: {
    scopes: string[]
    available_features: {
      profile: boolean
      outlook: boolean
      calendar: boolean
    }
    message: string
  }
  message: string
}

export interface MultiProviderAvailableFeatures {
  google?: AvailableFeatures
  microsoft?: {
    features: {
      profile: MicrosoftFeature
      outlook: MicrosoftFeature
      calendar: MicrosoftFeature
    }
    message: string
  }
  message: string
}

export class ScopeService {
  private static baseURL = CONFIG.url

  private static withAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Get the current scopes for the authenticated user
   */
  static async getUserScopes(): Promise<UserScopes> {
    const resp = await axios.get<UserScopes>(
      `${this.baseURL}/authentication/scopes/user/`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  /**
   * Get information about available Google features and their required scopes
   */
  static async getAvailableFeatures(): Promise<AvailableFeatures> {
    const resp = await axios.get<AvailableFeatures>(
      `${this.baseURL}/authentication/scopes/features/`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  /**
   * Request additional scopes for specific features
   */
  static async requestAdditionalScopes(features: string[]): Promise<{
    authUrl: string
    requested_features: string[]
    new_scopes: string[]
    message: string
  }> {
    const redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/authentication/auth/callback`
      : 'http://localhost:3000/authentication/auth/callback'

    const resp = await axios.post(
      `${this.baseURL}/authentication/scopes/request/?redirect_uri=${encodeURIComponent(redirectUri)}`,
      { features },
      { headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() } }
    )
    return resp.data
  }

  /**
   * Check if a specific feature is available for the user
   */
  static async isFeatureAvailable(feature: string): Promise<boolean> {
    try {
      const userScopes = await this.getUserScopes()
      return userScopes.available_features[feature as keyof typeof userScopes.available_features] || false
    } catch (error) {
      console.error(`Error checking feature availability for ${feature}:`, error)
      return false
    }
  }

  /**
   * Get missing features that the user doesn't have access to
   */
  static async getMissingFeatures(): Promise<string[]> {
    try {
      const [userScopes, availableFeatures] = await Promise.all([
        this.getUserScopes(),
        this.getAvailableFeatures()
      ])

      const missingFeatures: string[] = []
      
      Object.entries(availableFeatures.features).forEach(([featureKey, feature]) => {
        if (!feature.required && !userScopes.available_features[featureKey as keyof typeof userScopes.available_features]) {
          missingFeatures.push(featureKey)
        }
      })

      return missingFeatures
    } catch (error) {
      console.error('Error getting missing features:', error)
      return []
    }
  }

  /**
   * Redirect user to Google OAuth for additional scopes
   */
  static async requestFeatureAccess(features: string[]): Promise<void> {
    try {
      const result = await this.requestAdditionalScopes(features)
      
      if (result.authUrl) {
        // Store the requested features in session storage for callback handling
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('requestedFeatures', JSON.stringify(features))
        }
        
        // Redirect to Google OAuth
        window.location.href = result.authUrl
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (error) {
      console.error('Error requesting feature access:', error)
      throw error
    }
  }

  /**
   * Get features that were requested during the current session
   */
  static getRequestedFeatures(): string[] {
    if (typeof window === 'undefined') return []
    
    try {
      const requested = sessionStorage.getItem('requestedFeatures')
      return requested ? JSON.parse(requested) : []
    } catch (error) {
      console.error('Error getting requested features:', error)
      return []
    }
  }

  /**
   * Clear requested features from session storage
   */
  static clearRequestedFeatures(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('requestedFeatures')
    }
  }

  // Multi-provider methods

  /**
   * Get scopes for all connected providers
   */
  static async getMultiProviderScopes(): Promise<MultiProviderUserScopes> {
    const resp = await axios.get<MultiProviderUserScopes>(
      `${this.baseURL}/authentication/scopes/multi-provider/`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  /**
   * Get available features for all providers
   */
  static async getMultiProviderFeatures(): Promise<MultiProviderAvailableFeatures> {
    const resp = await axios.get<MultiProviderAvailableFeatures>(
      `${this.baseURL}/authentication/scopes/multi-provider/features/`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  /**
   * Check if a specific email provider is connected and has required scopes
   */
  static async isEmailProviderAvailable(provider: EmailProvider): Promise<boolean> {
    try {
      const scopes = await this.getMultiProviderScopes()
      
      if (provider === 'gmail') {
        return scopes.google?.available_features.gmail || false
      } else if (provider === 'outlook') {
        return scopes.microsoft?.available_features.outlook || false
      }
      
      return false
    } catch (error) {
      console.error(`Error checking ${provider} provider availability:`, error)
      return false
    }
  }

  /**
   * Request Microsoft OAuth for specific features
   */
  static async requestMicrosoftFeatureAccess(features: string[]): Promise<void> {
    try {
      const redirectUri = typeof window !== 'undefined' 
        ? `${window.location.origin}/authentication/microsoft/callback`
        : 'http://localhost:3000/authentication/microsoft/callback'

      const resp = await axios.post(
        `${this.baseURL}/authentication/microsoft/scopes/request/?redirect_uri=${encodeURIComponent(redirectUri)}`,
        { features },
        { headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() } }
      )

      const result = resp.data
      
      if (result.authUrl) {
        // Store the requested features and provider in session storage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('requestedFeatures', JSON.stringify(features))
          sessionStorage.setItem('requestedProvider', 'microsoft')
        }
        
        // Redirect to Microsoft OAuth
        window.location.href = result.authUrl
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (error) {
      console.error('Error requesting Microsoft feature access:', error)
      throw error
    }
  }

  /**
   * Get the list of available email providers and their connection status
   */
  static async getEmailProviderStatus(): Promise<{
    gmail: { connected: boolean; available: boolean }
    outlook: { connected: boolean; available: boolean }
  }> {
    try {
      const scopes = await this.getMultiProviderScopes()
      
      return {
        gmail: {
          connected: !!scopes.google,
          available: scopes.google?.available_features.gmail || false
        },
        outlook: {
          connected: !!scopes.microsoft,
          available: scopes.microsoft?.available_features.outlook || false
        }
      }
    } catch (error) {
      console.error('Error getting email provider status:', error)
      return {
        gmail: { connected: false, available: false },
        outlook: { connected: false, available: false }
      }
    }
  }

  /**
   * Get the requested provider from session storage
   */
  static getRequestedProvider(): AuthProvider | null {
    if (typeof window === 'undefined') return null
    
    try {
      const provider = sessionStorage.getItem('requestedProvider')
      return (provider as AuthProvider) || null
    } catch (error) {
      console.error('Error getting requested provider:', error)
      return null
    }
  }

  /**
   * Clear requested provider from session storage
   */
  static clearRequestedProvider(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('requestedProvider')
    }
  }
}
