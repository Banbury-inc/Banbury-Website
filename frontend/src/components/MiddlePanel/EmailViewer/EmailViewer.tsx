import { ArrowLeft, Reply, Forward, Trash2, Archive, Star, Clock, User, Mail, Paperclip, Download, Send, X } from "lucide-react"
import { useEffect, useMemo, useState, useCallback } from "react"

import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { EmailService } from "../../../services/emailService"
import { extractEmailContent, hasAttachments, formatFileSize, cleanHtmlContent } from "../../../utils/emailUtils"
import { useToast } from "../../ui/use-toast"

interface EmailViewerProps {
  email: any
  onBack?: () => void
  onReply?: (email: any) => void
  onForward?: (email: any) => void
  onArchive?: (email: any) => void
  onDelete?: (email: any) => void
  onStarToggled?: (email: any, isStarred: boolean) => void
  onRefresh?: () => void
}

export function EmailViewer({ email, onBack, onReply, onForward, onArchive, onDelete, onStarToggled, onRefresh }: EmailViewerProps) {

  const getHeader = (name: string) => {
    return email?.payload?.headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || 'Unknown'
  }

  const formatDate = (internalDate: string) => {
    if (!internalDate) return 'Unknown'
    try {
      const date = new Date(parseInt(internalDate))
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      }
    } catch {
      return 'Unknown'
    }
  }

  // Generate avatar for email sender
  const generateAvatar = (name: string, email: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    // Generate a consistent color based on the email
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    const colorIndex = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    
    return (
      <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-medium text-sm`}>
        {initials}
      </div>
    )
  }

  // Extract sender name from email header
  const extractSenderName = (fromHeader: string) => {
    const match = fromHeader.match(/^(.+?)\s*<(.+)>$/)
    if (match) {
      return match[1].replace(/"/g, '').trim()
    }
    return fromHeader.split('@')[0]
  }

  const [labels, setLabels] = useState<string[]>(email?.labelIds || [])
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [threadLoading, setThreadLoading] = useState<boolean>(false)
  const [threadMessages, setThreadMessages] = useState<any[]>([])
  const [showReplyComposer, setShowReplyComposer] = useState<boolean>(false)
  const [replyForm, setReplyForm] = useState({
    to: '',
    subject: '',
    body: ''
  })
  const [sendingReply, setSendingReply] = useState<boolean>(false)

  const isStarred = useMemo(() => labels.includes('STARRED'), [labels])
  const { toast } = useToast()

  // Auto-scroll to reply composer when it appears
  useEffect(() => {
    if (showReplyComposer) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        const replyComposer = document.querySelector('[data-reply-composer]')
        if (replyComposer) {
          replyComposer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 100)
    }
  }, [showReplyComposer])

  useEffect(() => {
    setLabels(email?.labelIds || [])
  }, [email])

  // Extract full email content (handle no email gracefully)
  const emailContent = email ? extractEmailContent(email.payload) : { text: '', html: '', attachments: [] as any[] }
  const hasAttachmentsFlag = hasAttachments(emailContent)

  const handleDownloadAttachment = async (attachmentId: string, filename: string, messageId?: string) => {
    try {
      const response = await EmailService.getAttachment(messageId || email.id, attachmentId)
      if (response.data) {
        // Decode base64url data
        const base64 = response.data.replace(/-/g, '+').replace(/_/g, '/')
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        // Create and download file
        const blob = new Blob([bytes])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Failed to download attachment')
    }
  }

  // Initialize reply form when email changes
  useEffect(() => {
    if (email) {
      const fromHeader = getHeader('From')
      const subjectHeader = getHeader('Subject')
      setReplyForm({
        to: fromHeader,
        subject: subjectHeader.startsWith('Re: ') ? subjectHeader : `Re: ${subjectHeader}`,
        body: ''
      })
    }
  }, [email])

  const handleReply = () => {
    setShowReplyComposer(true)
  }

  const handleCancelReply = () => {
    setShowReplyComposer(false)
    setReplyForm(prev => ({ ...prev, body: '' }))
  }

  const handleSendReply = useCallback(async () => {
    if (!replyForm.to || !replyForm.subject || !replyForm.body.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (To, Subject, and Message).",
        variant: "destructive",
      })
      return
    }

    setSendingReply(true)
    try {
      await EmailService.sendReply({
        original_message_id: email.id,
        to: replyForm.to,
        subject: replyForm.subject,
        body: replyForm.body,
        attachments: []
      })

      toast({
        title: "Reply sent successfully",
        description: "",
        variant: "default",
      })

      setShowReplyComposer(false)
      setReplyForm(prev => ({ ...prev, body: '' }))
      
      // Refresh the thread to show the new reply
      if (onRefresh) onRefresh()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('email-refresh'))
      }
    } catch (error) {
      toast({
        title: "Failed to send reply",
        description: "There was an error sending your reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingReply(false)
    }
  }, [replyForm, email.id, toast, onRefresh])

  const handleForward = () => {
    if (onForward) {
      onForward(email)
    }
  }

  const handleArchive = async () => {
    try {
      setActionLoading(true)
      await EmailService.modifyMessage(email.id, { removeLabelIds: ['INBOX'] })
      setLabels((prev) => prev.filter((l) => l !== 'INBOX'))
      if (onArchive) onArchive(email)
      if (onRefresh) onRefresh()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('email-refresh'))
      }
    } catch (error) {
      alert('Failed to archive email')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStar = async () => {
    const currentlyStarred = labels.includes('STARRED')
    try {
      setActionLoading(true)
      if (currentlyStarred) {
        await EmailService.modifyMessage(email.id, { removeLabelIds: ['STARRED'] })
        setLabels((prev) => prev.filter((l) => l !== 'STARRED'))
        if (onStarToggled) onStarToggled(email, false)
        if (onRefresh) onRefresh()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('email-refresh'))
        }
      } else {
        await EmailService.modifyMessage(email.id, { addLabelIds: ['STARRED'] })
        setLabels((prev) => (prev.includes('STARRED') ? prev : [...prev, 'STARRED']))
        if (onStarToggled) onStarToggled(email, true)
        if (onRefresh) onRefresh()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('email-refresh'))
        }
      }
    } catch (error) {
      alert('Failed to toggle star')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setActionLoading(true)
      await EmailService.modifyMessage(email.id, { addLabelIds: ['TRASH'] })
      setLabels((prev) => (prev.includes('TRASH') ? prev : [...prev, 'TRASH']))
      if (onDelete) onDelete(email)
      if (onRefresh) onRefresh()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('email-refresh'))
      }
      if (onBack) onBack()
    } catch (error) {
      alert('Failed to delete email')
    } finally {
      setActionLoading(false)
    }
  }

  // Load full thread messages when a new email is selected
  useEffect(() => {
    const loadThread = async () => {
      if (!email) {
        setThreadMessages([])
        return
      }

      console.log('EmailViewer: Loading email:', {
        id: email.id,
        threadId: email.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From')
      })

      // If no threadId, try to find related messages by subject or just show single email
      if (!email.threadId) {
        console.log('No threadId found, attempting to find related emails by subject')
        
        // Try to find related emails by subject
        try {
          const subject = getHeader('Subject')
          if (subject && subject !== 'Unknown') {
            // Remove "Re:" prefix for search
            const cleanSubject = subject.replace(/^Re:\s*/i, '')
            console.log('Searching for related emails with subject:', cleanSubject)
            
            const searchResult = await EmailService.listMessages({
              q: `subject:"${cleanSubject}"`,
              maxResults: 10
            })
            
            if (searchResult.messages && searchResult.messages.length > 1) {
              console.log('Found related emails by subject:', searchResult.messages.length)
              // Load full messages for the related emails
              const messageIds = searchResult.messages.map(m => m.id)
              const batch = await EmailService.getMessagesBatch(messageIds)
              const fullMessages: any[] = messageIds
                .map((id) => batch?.messages?.[id])
                .filter((m) => m && !m.error)
                .sort((a: any, b: any) => Number(a.internalDate || 0) - Number(b.internalDate || 0))
              
              if (fullMessages.length > 1) {
                console.log('Loaded related emails:', fullMessages.length)
                setThreadMessages(fullMessages)
                return
              }
            }
          }
        } catch (error) {
          console.error('Error searching for related emails:', error)
        }
        
        console.log('No related emails found, showing single email')
        setThreadMessages([email])
        return
      }
      
      try {
        setThreadLoading(true)
        console.log('Loading thread for threadId:', email.threadId)
        
        // Get thread metadata (ids in the thread)
        const thread: any = await EmailService.getThread(email.threadId)
        console.log('Thread response:', thread)
        
        const ids: string[] = (thread?.messages || thread?.thread?.messages || [])
          .map((m: any) => (m.id ? m.id : m.messageId ? m.messageId : m))
          .filter(Boolean)

        console.log('Found message IDs in thread:', ids)

        if (ids && ids.length > 1) {
          // Fetch full messages in batch for rendering contents
          const batch = await EmailService.getMessagesBatch(ids)
          console.log('Batch response:', batch)
          
          const fullMessages: any[] = ids
            .map((id) => batch?.messages?.[id])
            .filter((m) => m && !m.error)
            // Sort by internalDate ascending (oldest first)
            .sort((a: any, b: any) => Number(a.internalDate || 0) - Number(b.internalDate || 0))
          
          console.log('Full messages loaded:', fullMessages.length)
          setThreadMessages(fullMessages.length > 0 ? fullMessages : [email])
        } else {
          console.log('Single message in thread or no message IDs found, showing single email')
          setThreadMessages([email])
        }
      } catch (e) {
        console.error('Error loading thread via threadId, falling back to subject search:', e)
        
        // Fallback: Try to find related emails by subject when thread API fails
        try {
          const subject = getHeader('Subject')
          if (subject && subject !== 'Unknown') {
            // Remove "Re:" prefix for search
            const cleanSubject = subject.replace(/^Re:\s*/i, '')
            console.log('Fallback: Searching for related emails with subject:', cleanSubject)
            
            const searchResult = await EmailService.listMessages({
              q: `subject:"${cleanSubject}"`,
              maxResults: 10
            })
            
            if (searchResult.messages && searchResult.messages.length > 1) {
              console.log('Fallback: Found related emails by subject:', searchResult.messages.length)
              // Load full messages for the related emails
              const messageIds = searchResult.messages.map(m => m.id)
              const batch = await EmailService.getMessagesBatch(messageIds)
              const fullMessages: any[] = messageIds
                .map((id) => batch?.messages?.[id])
                .filter((m) => m && !m.error)
                .sort((a: any, b: any) => Number(a.internalDate || 0) - Number(b.internalDate || 0))
              
              if (fullMessages.length > 1) {
                console.log('Fallback: Loaded related emails:', fullMessages.length)
                setThreadMessages(fullMessages)
                return
              }
            }
          }
        } catch (fallbackError) {
          console.error('Fallback search also failed:', fallbackError)
        }
        
        console.log('All thread loading methods failed, showing single email')
        setThreadMessages([email])
      } finally {
        setThreadLoading(false)
      }
    }
    loadThread()
  }, [email])

  return (
    <div className="h-full flex flex-col bg-zinc-800">
      {/* Compact Header */}
      {!email ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <p>Select an email to view</p>
        </div>
      ) : (
        <>
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 p-1 h-8 w-8 rounded-md transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-white text-lg font-semibold truncate">
              {getHeader('Subject') || '(No Subject)'}
            </h1>
          </div>
        </div>
        
        {/* Compact Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 p-1 h-8 w-8 rounded-md transition-colors duration-200" onClick={handleReply} disabled={actionLoading}>
            <Reply className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 p-1 h-8 w-8 rounded-md transition-colors duration-200" onClick={handleForward} disabled={actionLoading}>
            <Forward className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 p-1 h-8 w-8 rounded-md transition-colors duration-200" onClick={handleArchive} disabled={actionLoading}>
            <Archive className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={isStarred ? "text-yellow-500 hover:bg-yellow-50 p-1 h-8 w-8 rounded-md transition-colors duration-200" : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 p-1 h-8 w-8 rounded-md transition-colors duration-200"}
            onClick={handleToggleStar}
            disabled={actionLoading}
          >
            <Star className="h-3 w-3" fill={isStarred ? 'currentColor' : 'none'} />
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 p-1 h-8 w-8 rounded-md transition-colors duration-200" onClick={handleDelete} disabled={actionLoading}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-zinc-100 hover:scrollbar-thumb-zinc-500">
        <div className="w-full">
          {/* Threaded conversation header */}
          <div className="px-6 py-4 border-b border-zinc-800/30 bg-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-300 font-medium">
                  {threadMessages.length > 1 ? `Conversation (${threadMessages.length} messages)` : 'Email'}
                </span>
                {threadMessages.length === 1 && email.threadId && (
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                    Thread API unavailable
                  </span>
                )}
              </div>
              {threadMessages.length > 1 && (
                <div className="text-xs text-zinc-500">
                  Thread ID: {email.threadId}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-400 w-12">From:</span>
                <span className="text-zinc-400 font-medium truncate">{getHeader('From')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-400 w-12">To:</span>
                <span className="text-zinc-400 font-medium truncate">{getHeader('To')}</span>
              </div>
            </div>
          </div>

          <div className="w-full">
            {threadLoading && (
              <div className="p-6 text-sm text-zinc-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-400"></div>
                Loading email thread...
              </div>
            )}
            {!threadLoading && (threadMessages.length > 0 ? (
              <div className="bg-white">
                {threadMessages.map((msg, index) => {
                  const content = extractEmailContent(msg?.payload)
                  const header = (n: string) => msg?.payload?.headers?.find((h: any) => h.name.toLowerCase() === n.toLowerCase())?.value || 'Unknown'
                  const msgHasAttachments = hasAttachments(content)
                  const fromHeader = header('From')
                  const senderName = extractSenderName(fromHeader)
                  const senderEmail = fromHeader.includes('<') ? fromHeader.match(/<(.+)>/)?.[1] || fromHeader : fromHeader
                  
                  return (
                    <div key={msg.id} className={`border-b border-gray-200 ${index === threadMessages.length - 1 ? 'border-b-2' : ''} ${index > 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      {/* Email Header */}
                      <div className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {generateAvatar(senderName, senderEmail)}
                          </div>
                          
                          {/* Email Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{senderName}</span>
                                <span className="text-xs text-gray-500">to me</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{formatDate(msg.internalDate)}</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-yellow-500 p-1 h-6 w-6 rounded-md transition-colors duration-200"
                                    title="Star email"
                                  >
                                    <Star className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-gray-600 p-1 h-6 w-6 rounded-md transition-colors duration-200"
                                    title="Reply"
                                    onClick={() => {
                                      setReplyForm({
                                        to: fromHeader,
                                        subject: header('Subject').startsWith('Re: ') ? header('Subject') : `Re: ${header('Subject')}`,
                                        body: ''
                                      })
                                      setShowReplyComposer(true)
                                    }}
                                  >
                                    <Reply className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-gray-600 p-1 h-6 w-6 rounded-md transition-colors duration-200"
                                    title="More options"
                                  >
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Email Content */}
                      <div className="px-6 pb-4">
                        <div className="ml-13">
                          {content?.html ? (
                            <div className="text-gray-900 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtmlContent(content.html) }} />
                          ) : (
                            <div className="text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
                              {content?.text || msg?.snippet || 'No content available'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Attachments */}
                      {msgHasAttachments && content.attachments && (
                        <div className="px-6 pb-4">
                          <div className="ml-13">
                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Paperclip className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Attachments</span>
                                <span className="text-xs text-slate-500">({content.attachments.length})</span>
                              </div>
                              <div className="space-y-2">
                                {content.attachments.map((attachment: any) => (
                                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <Paperclip className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-900 truncate">{attachment.filename}</p>
                                        <p className="text-xs text-slate-600">{attachment.mimeType} • {formatFileSize(attachment.size)}</p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 p-1 h-8 w-8 flex-shrink-0 rounded-md transition-colors duration-200"
                                      title="Download attachment"
                                      onClick={() => handleDownloadAttachment(attachment.id, attachment.filename, msg.id)}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">No messages in this thread</div>
            ))}
          </div>

          {/* Inline Reply Composer */}
          {showReplyComposer && (
            <div className="bg-white border-t border-gray-200 shadow-lg w-full" data-reply-composer>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {/* Profile Picture */}
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                    M
                  </div>
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">to</span>
                    <span className="text-sm font-medium text-gray-900">{extractSenderName(getHeader('From'))}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReply}
                  className="text-gray-400 hover:text-gray-600 p-1 h-8 w-8 rounded-md transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>


              {/* Message Body */}
              <div className="px-4 py-4">
                <textarea
                  value={replyForm.body}
                  onChange={(e) => setReplyForm(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full min-h-32 border-0 shadow-none text-gray-900 resize-none focus:ring-0 focus:outline-none focus:border-0 p-0"
                  placeholder="Compose email..."
                  disabled={sendingReply}
                />
              </div>

              {/* Footer with Actions */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  {/* Formatting Options */}
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-2 h-8 w-8">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-2 h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-2 h-8 w-8">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-2 h-8 w-8">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelReply}
                    className="text-gray-500 hover:text-gray-700 p-2 h-8 w-8"
                    disabled={sendingReply}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyForm.body.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors duration-200 disabled:bg-gray-300 disabled:text-gray-500 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendingReply ? 'Sending...' : 'Send'}
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}

