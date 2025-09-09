import axios from 'axios'

import { CONFIG } from '../config/config'

export type EmailProvider = 'gmail' | 'outlook';

// Gmail interfaces
export interface GmailMessageListResponse {
  messages?: Array<{ id: string; threadId: string }>
  nextPageToken?: string
  resultSizeEstimate?: number
}

export interface GmailMessage {
  id: string
  threadId: string
  labelIds?: string[]
  snippet?: string
  payload?: any
  internalDate?: string
}

// Outlook interfaces
export interface OutlookMessageListResponse {
  value?: Array<{ id: string; conversationId: string }>
  '@odata.nextLink'?: string
  '@odata.count'?: number
}

export interface OutlookMessage {
  id: string
  conversationId: string
  categories?: string[]
  bodyPreview?: string
  body?: {
    contentType: string
    content: string
  }
  receivedDateTime?: string
  sentDateTime?: string
  subject?: string
  from?: {
    emailAddress: {
      name: string
      address: string
    }
  }
  toRecipients?: Array<{
    emailAddress: {
      name: string
      address: string
    }
  }>
  ccRecipients?: Array<{
    emailAddress: {
      name: string
      address: string
    }
  }>
  hasAttachments?: boolean
  isRead?: boolean
  isDraft?: boolean
  flag?: {
    flagStatus: string
  }
}

// Unified email interfaces
export interface UnifiedEmailMessage {
  id: string
  threadId: string
  provider: EmailProvider
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  isRead: boolean
  hasAttachments: boolean
  labels: string[]
  isDraft: boolean
  rawMessage: GmailMessage | OutlookMessage
}

export interface UnifiedMessageListResponse {
  messages: UnifiedEmailMessage[]
  nextPageToken?: string
  totalCount?: number
}

export class EmailService {
  private static baseURL = CONFIG.url

  private static withAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Helper method to convert Outlook message to unified format
  private static convertOutlookToUnified(message: OutlookMessage): UnifiedEmailMessage {
    const fromAddress = message.from?.emailAddress?.address || 'Unknown'
    const fromName = message.from?.emailAddress?.name
    const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress
    
    const toRecipients = message.toRecipients?.map(r => 
      r.emailAddress.name ? `${r.emailAddress.name} <${r.emailAddress.address}>` : r.emailAddress.address
    ).join(', ') || ''

    // Convert Outlook categories to labels
    const labels = message.categories || []
    if (message.isRead === false) labels.push('UNREAD')
    if (message.isDraft) labels.push('DRAFT')
    if (message.flag?.flagStatus === 'flagged') labels.push('STARRED')

    return {
      id: message.id,
      threadId: message.conversationId,
      provider: 'outlook',
      subject: message.subject || '(No Subject)',
      from,
      to: toRecipients,
      date: message.receivedDateTime || message.sentDateTime || '',
      snippet: message.bodyPreview || '',
      isRead: message.isRead ?? true,
      hasAttachments: message.hasAttachments ?? false,
      labels,
      isDraft: message.isDraft ?? false,
      rawMessage: message
    }
  }

  // Helper method to convert Gmail message to unified format
  private static convertGmailToUnified(message: GmailMessage): UnifiedEmailMessage {
    const headers = (message.payload?.headers as Array<{name: string, value: string}>) || []
    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
    
    const from = getHeader('from') || 'Unknown'
    const to = getHeader('to') || ''
    
    let dateString = 'Unknown'
    if (message.internalDate) {
      try {
        const date = new Date(parseInt(message.internalDate))
        if (!isNaN(date.getTime())) {
          dateString = date.toISOString()
        }
      } catch (e) {
        console.error('Failed to parse Gmail date:', message.internalDate)
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      provider: 'gmail',
      subject: getHeader('subject') || '(No Subject)',
      from,
      to,
      date: dateString,
      snippet: message.snippet || '',
      isRead: !message.labelIds?.includes('UNREAD'),
      hasAttachments: this.checkGmailAttachments(message.payload),
      labels: message.labelIds || [],
      isDraft: message.labelIds?.includes('DRAFT') ?? false,
      rawMessage: message
    }
  }

  private static checkGmailAttachments(payload: any): boolean {
    if (!payload) return false
    if (payload.filename) return true
    if (payload.parts) {
      return payload.parts.some((part: any) => this.checkGmailAttachments(part))
    }
    return false
  }

  static async listMessages(params?: { labelIds?: string[]; maxResults?: number; pageToken?: string; q?: string }) {
    const query: Record<string, any> = {}
    if (params?.labelIds && params.labelIds.length > 0) {
      query.labelIds = params.labelIds[0]
    }
    if (typeof params?.maxResults === 'number') query.maxResults = params.maxResults
    if (params?.pageToken) query.pageToken = params.pageToken
    if (params?.q) query.q = params.q

    const url = new URL(`${this.baseURL}/authentication/gmail/list_messages/`)
    Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, String(v)))
    if (params?.labelIds && params.labelIds.length > 1) {
      params.labelIds.slice(1).forEach((lid) => url.searchParams.append('labelIds', lid))
    }

    const resp = await axios.get<GmailMessageListResponse>(url.toString(), {
      headers: this.withAuthHeaders()
    })
    return resp.data
  }

  static async getMessage(messageId: string) {
    const resp = await axios.get<GmailMessage>(
      `${this.baseURL}/authentication/gmail/messages/${encodeURIComponent(messageId)}/`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  static async sendMessage(input: { to: string; subject: string; body: string; cc?: string; bcc?: string; isDraft?: boolean; in_reply_to?: string; references?: string; thread_id?: string; attachments?: Array<{ filename: string; mimeType?: string; content: string }> }) {
    const resp = await axios.post(`${this.baseURL}/authentication/gmail/send_message/`, input, {
      headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() }
    })
    return resp.data
  }

  static async sendReply(input: { original_message_id: string; to: string; subject: string; body: string; cc?: string; bcc?: string; attachments?: Array<{ filename: string; mimeType?: string; content: string }> }) {
    // Use files app endpoint to support attachments
    const resp = await axios.post(`${this.baseURL}/files/gmail/reply`, input, {
      headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() }
    })
    return resp.data
  }

  static async getThread(threadId: string) {
    const resp = await axios.get<GmailMessage>(
      `${this.baseURL}/authentication/gmail/thread/${encodeURIComponent(threadId)}/`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  static async listThreads(params?: { q?: string; maxResults?: number }) {
    const query: Record<string, any> = {}
    if (params?.q) query.q = params.q
    if (typeof params?.maxResults === 'number') query.maxResults = params.maxResults

    const url = new URL(`${this.baseURL}/authentication/gmail/threads/`)
    Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, String(v)))

    const resp = await axios.get(url.toString(), {
      headers: this.withAuthHeaders()
    })
    return resp.data
  }

  static async modifyMessage(messageId: string, change: { addLabelIds?: string[]; removeLabelIds?: string[] }) {
    const resp = await axios.post(
      `${this.baseURL}/authentication/gmail/messages/${encodeURIComponent(messageId)}/modify/`,
      change,
      { headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() } }
    )
    return resp.data
  }

  static async getMessagesBatch(messageIds: string[]) {
    const resp = await axios.post(
      `${this.baseURL}/authentication/gmail/messages/batch`,
      { messageIds },
      { headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() } }
    )
    return resp.data
  }

  static async getAttachment(messageId: string, attachmentId: string) {
    const resp = await axios.get(
      `${this.baseURL}/authentication/gmail/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  static async getSignature() {
    const resp = await axios.get(
      `${this.baseURL}/files/gmail/signature`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  static async sendMessageWithSignature(input: { to: string; subject: string; body: string; cc?: string; bcc?: string; isDraft?: boolean; in_reply_to?: string; references?: string; thread_id?: string; attachments?: Array<{ filename: string; mimeType?: string; content: string }> }) {
    const resp = await axios.post(`${this.baseURL}/files/gmail/send_with_signature`, input, {
      headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() }
    })
    return resp.data
  }

  // Outlook-specific methods
  static async listOutlookMessages(params?: { folder?: string; maxResults?: number; pageToken?: string; filter?: string }) {
    const query: Record<string, any> = {}
    if (params?.folder) query.folder = params.folder
    if (typeof params?.maxResults === 'number') query.maxResults = params.maxResults
    if (params?.pageToken) query.pageToken = params.pageToken
    if (params?.filter) query.filter = params.filter

    const url = new URL(`${this.baseURL}/authentication/outlook/list_messages/`)
    Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, String(v)))

    const resp = await axios.get<OutlookMessageListResponse>(url.toString(), {
      headers: this.withAuthHeaders()
    })
    return resp.data
  }

  static async getOutlookMessage(messageId: string) {
    const resp = await axios.get<OutlookMessage>(
      `${this.baseURL}/authentication/outlook/messages/${encodeURIComponent(messageId)}/`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  static async sendOutlookMessage(input: { to: string; subject: string; body: string; cc?: string; bcc?: string; isDraft?: boolean; replyTo?: string; attachments?: Array<{ filename: string; mimeType?: string; content: string }> }) {
    const resp = await axios.post(`${this.baseURL}/authentication/outlook/send_message/`, input, {
      headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() }
    })
    return resp.data
  }

  static async modifyOutlookMessage(messageId: string, change: { isRead?: boolean; categories?: string[]; flag?: string }) {
    const resp = await axios.patch(
      `${this.baseURL}/authentication/outlook/messages/${encodeURIComponent(messageId)}/`,
      change,
      { headers: { 'Content-Type': 'application/json', ...this.withAuthHeaders() } }
    )
    return resp.data
  }

  static async getOutlookAttachment(messageId: string, attachmentId: string) {
    const resp = await axios.get(
      `${this.baseURL}/authentication/outlook/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`,
      { headers: this.withAuthHeaders() }
    )
    return resp.data
  }

  // Unified methods that work with multiple providers
  static async listUnifiedMessages(provider: EmailProvider, params?: { 
    labelIds?: string[]; 
    folder?: string; 
    maxResults?: number; 
    pageToken?: string; 
    q?: string;
    filter?: string;
  }): Promise<UnifiedMessageListResponse> {
    if (provider === 'gmail') {
      const gmailResponse = await this.listMessages({
        labelIds: params?.labelIds,
        maxResults: params?.maxResults,
        pageToken: params?.pageToken,
        q: params?.q
      })

      const unifiedMessages: UnifiedEmailMessage[] = []
      if (gmailResponse.messages) {
        // Fetch full message details for each message
        for (const msgRef of gmailResponse.messages) {
          try {
            const fullMessage = await this.getMessage(msgRef.id)
            unifiedMessages.push(this.convertGmailToUnified(fullMessage))
          } catch (error) {
            console.error(`Failed to fetch Gmail message ${msgRef.id}:`, error)
          }
        }
      }

      return {
        messages: unifiedMessages,
        nextPageToken: gmailResponse.nextPageToken,
        totalCount: gmailResponse.resultSizeEstimate
      }
    } else if (provider === 'outlook') {
      const outlookResponse = await this.listOutlookMessages({
        folder: params?.folder,
        maxResults: params?.maxResults,
        pageToken: params?.pageToken,
        filter: params?.filter
      })

      const unifiedMessages: UnifiedEmailMessage[] = []
      if (outlookResponse.value) {
        // Fetch full message details for each message
        for (const msgRef of outlookResponse.value) {
          try {
            const fullMessage = await this.getOutlookMessage(msgRef.id)
            unifiedMessages.push(this.convertOutlookToUnified(fullMessage))
          } catch (error) {
            console.error(`Failed to fetch Outlook message ${msgRef.id}:`, error)
          }
        }
      }

      return {
        messages: unifiedMessages,
        nextPageToken: outlookResponse['@odata.nextLink'],
        totalCount: outlookResponse['@odata.count']
      }
    } else {
      throw new Error(`Unsupported email provider: ${provider}`)
    }
  }

  static async getUnifiedMessage(provider: EmailProvider, messageId: string): Promise<UnifiedEmailMessage> {
    if (provider === 'gmail') {
      const gmailMessage = await this.getMessage(messageId)
      return this.convertGmailToUnified(gmailMessage)
    } else if (provider === 'outlook') {
      const outlookMessage = await this.getOutlookMessage(messageId)
      return this.convertOutlookToUnified(outlookMessage)
    } else {
      throw new Error(`Unsupported email provider: ${provider}`)
    }
  }

  static async sendUnifiedMessage(provider: EmailProvider, input: { 
    to: string; 
    subject: string; 
    body: string; 
    cc?: string; 
    bcc?: string; 
    isDraft?: boolean; 
    replyTo?: string;
    attachments?: Array<{ filename: string; mimeType?: string; content: string }> 
  }) {
    if (provider === 'gmail') {
      return this.sendMessage({
        to: input.to,
        subject: input.subject,
        body: input.body,
        cc: input.cc,
        bcc: input.bcc,
        isDraft: input.isDraft,
        attachments: input.attachments
      })
    } else if (provider === 'outlook') {
      return this.sendOutlookMessage(input)
    } else {
      throw new Error(`Unsupported email provider: ${provider}`)
    }
  }
}


