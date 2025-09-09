import React from 'react'
import { 
  Mail, 
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { Button } from './ui/button'
import { ScopeService, EmailProvider } from '../services/scopeService'
import { AUTH_CONFIG } from '../services/authConfig'

interface EmailProviderManagerProps {
  onProviderConnected?: (provider: EmailProvider) => void
  className?: string
}

interface ProviderInfo {
  key: EmailProvider
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  connected: boolean
  available: boolean
  loading: boolean
}

export function EmailProviderManager({ onProviderConnected, className = '' }: EmailProviderManagerProps) {
  const [providers, setProviders] = useState<ProviderInfo[]>([
    {
      key: 'gmail',
      name: 'Gmail',
      icon: Mail,
      description: 'Connect your Gmail account to access your Google emails',
      connected: false,
      available: false,
      loading: false
    },
    {
      key: 'outlook',
      name: 'Outlook',
      icon: Mail,
      description: 'Connect your Outlook account to access your Microsoft emails',
      connected: false,
      available: false,
      loading: false
    }
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load provider status
  const loadProviderStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const status = await ScopeService.getEmailProviderStatus()
      
      setProviders(prev => prev.map(provider => ({
        ...provider,
        connected: provider.key === 'gmail' ? status.gmail.connected : status.outlook.connected,
        available: provider.key === 'gmail' ? status.gmail.available : status.outlook.available,
        loading: false
      })))
    } catch (err) {
      console.error('Error loading provider status:', err)
      setError('Failed to load email provider status')
    } finally {
      setLoading(false)
    }
  }, [])

  // Connect to Gmail
  const connectGmail = useCallback(async () => {
    try {
      setProviders(prev => prev.map(p => 
        p.key === 'gmail' ? { ...p, loading: true } : p
      ))
      setError(null)

      // Check if domain is allowed for OAuth
      if (!AUTH_CONFIG.isAllowedDomain()) {
        setError(AUTH_CONFIG.getRedirectUriError('google'))
        return
      }

      await ScopeService.requestFeatureAccess(['gmail'])
    } catch (error) {
      console.error('Error connecting to Gmail:', error)
      setError('Failed to connect to Gmail')
      setProviders(prev => prev.map(p => 
        p.key === 'gmail' ? { ...p, loading: false } : p
      ))
    }
  }, [])

  // Connect to Outlook
  const connectOutlook = useCallback(async () => {
    try {
      setProviders(prev => prev.map(p => 
        p.key === 'outlook' ? { ...p, loading: true } : p
      ))
      setError(null)

      // Check if domain is allowed for OAuth
      if (!AUTH_CONFIG.isAllowedDomain()) {
        setError(AUTH_CONFIG.getRedirectUriError('microsoft'))
        return
      }

      await ScopeService.requestMicrosoftFeatureAccess(['outlook'])
    } catch (error) {
      console.error('Error connecting to Outlook:', error)
      setError('Failed to connect to Outlook')
      setProviders(prev => prev.map(p => 
        p.key === 'outlook' ? { ...p, loading: false } : p
      ))
    }
  }, [])

  // Handle provider connection
  const handleConnect = useCallback(async (providerKey: EmailProvider) => {
    if (providerKey === 'gmail') {
      await connectGmail()
    } else if (providerKey === 'outlook') {
      await connectOutlook()
    }
  }, [connectGmail, connectOutlook])

  // Handle provider reconnection
  const handleReconnect = useCallback(async (providerKey: EmailProvider) => {
    await handleConnect(providerKey)
  }, [handleConnect])

  // Load initial data
  useEffect(() => {
    loadProviderStatus()
  }, [loadProviderStatus])

  // Check for scope activation on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const scopeActivated = urlParams.get('scopeActivated')
    const provider = urlParams.get('provider') as EmailProvider

    if (scopeActivated === 'true' && provider) {
      // Reload status after scope activation
      setTimeout(() => {
        loadProviderStatus()
        onProviderConnected?.(provider)
      }, 1000)
    }
  }, [loadProviderStatus, onProviderConnected])

  const getProviderStatus = (provider: ProviderInfo) => {
    if (provider.loading) {
      return (
        <div className="flex items-center text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Connecting...</span>
        </div>
      )
    }

    if (provider.available) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      )
    }

    if (provider.connected) {
      return (
        <div className="flex items-center text-yellow-600">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">Needs Permission</span>
        </div>
      )
    }

    return (
      <div className="flex items-center text-gray-500">
        <span className="text-sm">Not Connected</span>
      </div>
    )
  }

  const getActionButton = (provider: ProviderInfo) => {
    if (provider.loading) {
      return (
        <Button size="sm" disabled>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </Button>
      )
    }

    if (provider.available) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReconnect(provider.key)}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      )
    }

    return (
      <Button
        size="sm"
        onClick={() => handleConnect(provider.key)}
        className="flex items-center gap-1"
      >
        <ExternalLink className="w-4 h-4" />
        Connect
      </Button>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading email providers...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Email Providers</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadProviderStatus}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {providers.map((provider) => {
          const Icon = provider.icon
          
          return (
            <div
              key={provider.key}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  provider.available 
                    ? 'bg-green-100 text-green-600' 
                    : provider.connected
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{provider.name}</h4>
                    {getProviderStatus(provider)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {provider.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getActionButton(provider)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">About Email Connections</h4>
            <p className="text-sm text-blue-800">
              Connect multiple email providers to access all your emails in one place. 
              You can switch between providers and manage emails from different accounts seamlessly.
            </p>
          </div>
        </div>
      </div>

      {providers.some(p => p.available) && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">Connected Providers</h4>
              <p className="text-sm text-green-800">
                You have successfully connected {providers.filter(p => p.available).length} email provider(s). 
                You can now access your emails from the Email tab.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}