import React from 'react'
import { 
  Mail, 
  Send, 
  Star, 
  StarOff, 
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Trash2,
  AlertCircle,
  Settings,
  Plus,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { EmailViewer } from '../MiddlePanel/EmailViewer/EmailViewer'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  EmailService, 
  UnifiedEmailMessage, 
  UnifiedMessageListResponse,
  EmailProvider 
} from '../../services/emailService'
import { ScopeService, EmailProvider as ScopeEmailProvider } from '../../services/scopeService'
import { ApiService } from '../../services/apiService'
import { AUTH_CONFIG } from '../../services/authConfig'

interface MultiProviderEmailTabProps {
  onOpenEmailApp?: () => void
  onMessageSelect?: (message: UnifiedEmailMessage) => void
  onComposeEmail?: () => void
}

interface ProviderStatus {
  connected: boolean
  available: boolean
  loading: boolean
}

export function MultiProviderEmailTab({ onOpenEmailApp, onMessageSelect, onComposeEmail }: MultiProviderEmailTabProps) {
  const [messages, setMessages] = useState<UnifiedEmailMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<UnifiedEmailMessage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts' | 'starred'>('inbox')
  const [activeProvider, setActiveProvider] = useState<EmailProvider>('gmail')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Provider status
  const [providerStatus, setProviderStatus] = useState<{
    gmail: ProviderStatus
    outlook: ProviderStatus
  }>({
    gmail: { connected: false, available: false, loading: false },
    outlook: { connected: false, available: false, loading: false }
  })
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: ''
  })

  // Format date for display
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }, [])

  // Load messages for the active provider
  const loadMessages = useCallback(async () => {
    if (!providerStatus[activeProvider].available) return

    setLoading(true)
    setError(null)
    
    try {
      const params = {
        maxResults: 25,
        ...(activeTab === 'inbox' && { labelIds: ['INBOX'], folder: 'inbox' }),
        ...(activeTab === 'sent' && { labelIds: ['SENT'], folder: 'sentitems' }),
        ...(activeTab === 'drafts' && { labelIds: ['DRAFT'], folder: 'drafts' }),
        ...(activeTab === 'starred' && { labelIds: ['STARRED'], filter: 'flag eq true' }),
        ...(searchQuery && { q: searchQuery, filter: searchQuery })
      }

      const response = await EmailService.listUnifiedMessages(activeProvider, params)
      setMessages(response.messages || [])
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(`Failed to load ${activeProvider} messages`)
    } finally {
      setLoading(false)
    }
  }, [activeProvider, activeTab, searchQuery, providerStatus])

  // Check provider status
  const checkProviderStatus = useCallback(async () => {
    try {
      const status = await ScopeService.getEmailProviderStatus()
      setProviderStatus({
        gmail: {
          connected: status.gmail.connected,
          available: status.gmail.available,
          loading: false
        },
        outlook: {
          connected: status.outlook.connected,
          available: status.outlook.available,
          loading: false
        }
      })
    } catch (error) {
      console.error('Error checking provider status:', error)
    }
  }, [])

  // Connect to Gmail
  const connectGmail = useCallback(async () => {
    try {
      setProviderStatus(prev => ({
        ...prev,
        gmail: { ...prev.gmail, loading: true }
      }))

      await ScopeService.requestFeatureAccess(['gmail'])
    } catch (error) {
      console.error('Error connecting to Gmail:', error)
      setError('Failed to connect to Gmail')
      setProviderStatus(prev => ({
        ...prev,
        gmail: { ...prev.gmail, loading: false }
      }))
    }
  }, [])

  // Connect to Outlook
  const connectOutlook = useCallback(async () => {
    try {
      setProviderStatus(prev => ({
        ...prev,
        outlook: { ...prev.outlook, loading: true }
      }))

      // Check if domain is allowed for OAuth
      if (!AUTH_CONFIG.isAllowedDomain()) {
        setError(AUTH_CONFIG.getRedirectUriError('microsoft'))
        return
      }

      await ScopeService.requestMicrosoftFeatureAccess(['outlook'])
    } catch (error) {
      console.error('Error connecting to Outlook:', error)
      setError('Failed to connect to Outlook')
      setProviderStatus(prev => ({
        ...prev,
        outlook: { ...prev.outlook, loading: false }
      }))
    }
  }, [])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!composeForm.to.trim()) return

    try {
      await EmailService.sendUnifiedMessage(activeProvider, {
        to: composeForm.to,
        subject: composeForm.subject,
        body: composeForm.body
      })
      
      setComposeOpen(false)
      setComposeForm({ to: '', subject: '', body: '' })
      loadMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('Failed to send message')
    }
  }, [composeForm, activeProvider, loadMessages])

  // Handle message selection
  const handleMessageClick = useCallback((message: UnifiedEmailMessage) => {
    setSelectedMessage(message)
    onMessageSelect?.(message)
  }, [onMessageSelect])

  // Handle provider change
  const handleProviderChange = useCallback((provider: EmailProvider) => {
    setActiveProvider(provider)
    setMessages([])
    setSelectedMessage(null)
  }, [])

  // Load initial data
  useEffect(() => {
    checkProviderStatus()
  }, [checkProviderStatus])

  // Load messages when provider or tab changes
  useEffect(() => {
    if (providerStatus[activeProvider].available) {
      loadMessages()
    }
  }, [loadMessages, providerStatus, activeProvider])

  // Render provider connection status
  const renderProviderStatus = (provider: EmailProvider) => {
    const status = providerStatus[provider]
    const isActive = activeProvider === provider
    const providerName = provider === 'gmail' ? 'Gmail' : 'Outlook'
    const icon = provider === 'gmail' ? Mail : Mail

    return (
      <Button
        key={provider}
        variant={isActive ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleProviderChange(provider)}
        disabled={!status.available}
        className={`flex items-center gap-2 ${
          !status.available ? 'opacity-50' : ''
        }`}
      >
        {React.createElement(icon, { className: 'w-4 h-4' })}
        <span>{providerName}</span>
        {status.available && <CheckCircle className="w-3 h-3 text-green-500" />}
        {!status.connected && <AlertCircle className="w-3 h-3 text-yellow-500" />}
      </Button>
    )
  }

  // Render connection prompt
  const renderConnectionPrompt = () => {
    const hasAnyConnection = providerStatus.gmail.available || providerStatus.outlook.available
    
    if (hasAnyConnection) return null

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Email Accounts
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Connect your Gmail and Outlook accounts to view and manage your emails from one place.
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={connectGmail}
            disabled={providerStatus.gmail.loading}
            className="flex items-center gap-2"
          >
            {providerStatus.gmail.loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Connect Gmail
          </Button>
          
          <Button
            onClick={connectOutlook}
            disabled={providerStatus.outlook.loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {providerStatus.outlook.loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Connect Outlook
          </Button>
        </div>
      </div>
    )
  }

  // Render no provider available prompt
  const renderNoProviderPrompt = () => {
    if (providerStatus[activeProvider].available) return null

    const providerName = activeProvider === 'gmail' ? 'Gmail' : 'Outlook'
    const connectAction = activeProvider === 'gmail' ? connectGmail : connectOutlook
    const isLoading = providerStatus[activeProvider].loading

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {providerName} Not Connected
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Connect your {providerName} account to view and manage your emails.
        </p>
        
        <Button
          onClick={connectAction}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          Connect {providerName}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with provider selection */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Email</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenEmailApp}
            className="text-gray-500 hover:text-gray-700"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Provider tabs */}
        <div className="flex gap-2 mb-4">
          {renderProviderStatus('gmail')}
          {renderProviderStatus('outlook')}
        </div>

        {/* Search and actions */}
        {(providerStatus.gmail.available || providerStatus.outlook.available) && (
          <>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMessages}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Folder tabs */}
            <div className="flex gap-1">
              {[
                { key: 'inbox', label: 'Inbox', icon: Mail },
                { key: 'sent', label: 'Sent', icon: Send },
                { key: 'drafts', label: 'Drafts', icon: Mail },
                { key: 'starred', label: 'Starred', icon: Star }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={activeTab === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(key as any)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderConnectionPrompt()}
        {renderNoProviderPrompt()}
        
        {providerStatus[activeProvider].available && (
          <>
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading messages...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Mail className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No messages found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {messages.map((message) => (
                      <div
                        key={`${message.provider}-${message.id}`}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              message.isRead ? 'bg-transparent' : 'bg-blue-500'
                            }`} />
                            <span className={`truncate ${
                              message.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'
                            }`}>
                              {message.from}
                            </span>
                            {message.hasAttachments && (
                              <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {message.provider === 'gmail' && (
                                <div className="w-2 h-2 bg-red-500 rounded-full" title="Gmail" />
                              )}
                              {message.provider === 'outlook' && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Outlook" />
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDate(message.date)}
                          </span>
                        </div>
                        <div className="mb-1">
                          <span className={`text-sm truncate block ${
                            message.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'
                          }`}>
                            {message.subject || '(No Subject)'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {message.snippet}
                        </div>
                        
                        {message.labels.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {message.labels.slice(0, 3).map((label) => (
                              <span
                                key={label}
                                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                              >
                                {label}
                              </span>
                            ))}
                            {message.labels.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{message.labels.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Compose button */}
      {providerStatus[activeProvider].available && (
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={() => setComposeOpen(true)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Compose
          </Button>
        </div>
      )}

      {/* Compose modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Compose Email ({activeProvider === 'gmail' ? 'Gmail' : 'Outlook'})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setComposeOpen(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <Input
                placeholder="To"
                value={composeForm.to}
                onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
              />
              <Input
                placeholder="Subject"
                value={composeForm.subject}
                onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
              />
              <textarea
                placeholder="Message"
                value={composeForm.body}
                onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setComposeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!composeForm.to.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}