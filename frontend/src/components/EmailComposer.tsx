import { useState, useCallback } from 'react'
import { 
  Send, 
  X, 
  Paperclip, 
  Save,
  ArrowLeft
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { EmailService } from '../services/emailService'
import { useToast } from './ui/use-toast'

interface EmailComposerProps {
  onBack?: () => void
  onSendComplete?: () => void
  replyTo?: {
    to: string
    subject: string
    body: string
    messageId?: string
  }
}

export function EmailComposer({ onBack, onSendComplete, replyTo }: EmailComposerProps) {
  const [form, setForm] = useState({
    to: replyTo?.to || '',
    subject: replyTo?.subject ? `Re: ${replyTo.subject}` : '',
    body: replyTo?.body ? `\n\n${replyTo.body}` : ''
  })
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const { toast } = useToast()

  const handleSend = useCallback(async () => {
    if (!form.to || !form.subject || !form.body.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (To, Subject, and Message).",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      // Use sendReply if this is a reply to an existing message
      if (replyTo?.messageId) {
        await EmailService.sendReply({
          original_message_id: replyTo.messageId,
          to: form.to,
          subject: form.subject,
          body: form.body
        })
      } else {
        // Use regular sendMessage for new emails
        await EmailService.sendMessage({
          to: form.to,
          subject: form.subject,
          body: form.body
        })
      }

      toast({
        title: "Email sent successfully",
        description: "Your email has been sent.",
        variant: "success",
      })

      onSendComplete?.()
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "There was an error sending your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }, [form, onSendComplete, toast])

  const handleSaveDraft = useCallback(async () => {
    if (!form.to && !form.subject && !form.body.trim()) {
      toast({
        title: "No content to save",
        description: "Please add some content before saving as draft.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a draft message using Gmail API
      await EmailService.sendMessage({
        to: form.to,
        subject: form.subject,
        body: form.body,
        isDraft: true
      })

      toast({
        title: "Draft saved",
        description: "Your draft has been saved.",
        variant: "success",
      })

      // Optionally close the composer or stay open for further editing
      // onSendComplete?.()
    } catch (error) {
      toast({
        title: "Failed to save draft",
        description: "There was an error saving your draft. Please try again.",
        variant: "destructive",
      })
    }
  }, [form, toast])

  const handleAttachmentChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-black p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-black text-lg font-semibold">
            {replyTo ? 'Reply' : 'New Message'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveDraft}
            className="text-gray-600 hover:text-black"
            disabled={sending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !form.to || !form.subject || !form.body.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>

      {/* Email Form */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
        <div className="w-full">
          {/* Recipients */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-2 block">To</label>
                <Input
                  value={form.to}
                  onChange={(e) => setForm(prev => ({ ...prev, to: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>
              
              <div>
                <label className="text-gray-700 text-sm font-medium mb-2 block">Subject</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  placeholder="Subject"
                />
              </div>
            </div>
          </div>

                    {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-6 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Attachments</span>
                <span className="text-xs text-gray-500">({attachments.length})</span>
              </div>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Paperclip className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate">{file.name}</span>
                      <span className="text-xs text-gray-600">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-gray-600 hover:text-red-500 p-1 h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Body */}
          <div className="w-full">
            <div className="bg-white overflow-hidden">
              <textarea
                value={form.body}
                onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
                className="w-full h-96 p-6 text-gray-900 leading-relaxed resize-none border-0 focus:outline-none focus:ring-0"
                placeholder="Write your message here..."
              />
            </div>
          </div>

          {/* Attachment Button */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('attachment-input')?.click()}
                className="bg-zinc-100 border-zinc-300 hover:bg-zinc-200 hover:border-zinc-400 hover:text-zinc-900 text-zinc-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
                disabled={sending}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
              <input
                id="attachment-input"
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
              />
              <span className="text-xs text-gray-500">
                {attachments.length > 0 && `${attachments.length} file(s) attached`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
