import { extractEmailContent } from "../../../../utils/emailUtils"

interface HandleSendParams {
  composer: any
  onSend?: () => void
}

export function handleSend({ composer, onSend }: HandleSendParams) {
  // Prefer the hidden textarea value, which tiptap keeps in sync (preserves newlines)
  const input = document.querySelector('textarea[aria-label="Message input"]') as HTMLTextAreaElement | null
  let text = input?.value ?? ''
  let proseMirrorElement: Element | null = null

  // Fallback: Get the text directly from the Tiptap editor DOM if the textarea is empty
  if (!text.trim()) {
    const proseMirrorElements = document.querySelectorAll('.ProseMirror')

    for (const element of Array.from(proseMirrorElements)) {
      const isInChatComposer = element.closest('.bg-zinc-800') || element.closest('.min-h-16')

      if (isInChatComposer) {
        proseMirrorElement = element
        // Extract paragraphs to preserve line breaks when possible
        const paragraphs = Array.from(element.querySelectorAll('p'))
        if (paragraphs.length > 0) {
          text = paragraphs.map((p) => (p.textContent || '').trimEnd()).join('\n\n')
        } else {
          text = element.textContent || ''
        }
        break
      }
    }

    // Keep reference for later clearing if we fell back to DOM
    if (!proseMirrorElement && proseMirrorElements.length > 0) {
      proseMirrorElement = proseMirrorElements[0]
    }
  }
  
  // CRITICAL: Set document context with email content BEFORE any composer.send() call
  try {
    // Get existing document content (docx, etc)
    const documentContent = ''
    try {
      const documentEditors = Array.from(document.querySelectorAll('.ProseMirror[contenteditable="true"]'))
      for (const element of documentEditors) {
        // Skip if it's the current chat editor
        const isInChatComposer = element.closest('.bg-zinc-800') || element.closest('.min-h-16')
        if (isInChatComposer) continue
        
        // Check various document editor indicators
        const hasSimpleTiptapClass = element.classList.contains('simple-tiptap-editor') || 
                                     element.closest('.simple-tiptap-editor')
        const isInAITiptap = element.closest('.min-h-\\[600px\\]') || 
                            element.closest('.bg-card')
        const isInWordViewer = element.closest('[class*="MuiBox"]') || 
                              element.closest('.h-full.border-0.rounded-none')
        
        if (hasSimpleTiptapClass || isInAITiptap || isInWordViewer) {
          const content = element.textContent || ''
          if (content.trim() && content.length > 20) {
            break // Found document content
          }
        }
      }
    } catch {}
    
    // Get and merge email content
    const emailsRaw = localStorage.getItem('pendingEmailAttachments')
    const emails = emailsRaw ? JSON.parse(emailsRaw) : []
    const emailSections: string[] = []
    if (Array.isArray(emails)) {
      emails.forEach((e: any) => {
        const subject = e?.subject || 'No Subject'
        const from = e?.from || ''
        const dateStr = e?.date || ''
        let body = ''
        try {
          if (e?.payload) {
            const content = extractEmailContent(e.payload)
            const raw = (content?.text || content?.html || e?.snippet || '').toString()
            body = raw.length > 20000 ? raw.slice(0, 20000) + '\n...[truncated]...' : raw
          } else {
            const raw = (e?.preview || e?.snippet || '').toString()
            body = raw.length > 20000 ? raw.slice(0, 20000) + '\n...[truncated]...' : raw
          }
        } catch {}
        emailSections.push([
          `Subject: ${subject}`,
          from ? `From: ${from}` : '',
          dateStr ? `Date: ${dateStr}` : '',
          'Body:',
          body
        ].filter(Boolean).join('\n'))
      })
    }

    const emailDocBlock = emailSections.length > 0
      ? ['Current email content:', ...emailSections].join('\n\n---\n\n')
      : ''

    const combinedContext = [documentContent, emailDocBlock].filter(Boolean).join('\n\n')
    if (combinedContext) {
      localStorage.setItem('pendingDocumentContext', combinedContext)
      console.log('[Composer.tsx] DEBUG - BEFORE SEND - SET pendingDocumentContext to:', combinedContext.slice(0, 200))
    } else {
      localStorage.removeItem('pendingDocumentContext')
      console.log('[Composer.tsx] DEBUG - BEFORE SEND - REMOVED pendingDocumentContext')
    }
  } catch (error) {
    console.error('[Composer.tsx] DEBUG - Error in email merge:', error)
  }
    
  if (text.trim().length > 0) {
    const input = document.querySelector('textarea[aria-label="Message input"]') as HTMLTextAreaElement
    if (input) {
      // Set the input value and trigger all possible events
      input.value = text // Keep only the user's message visible
      input.focus()
      
      // Trigger all possible events to ensure detection
      const eventTypes: string[] = ['input', 'change', 'keyup', 'keydown', 'focus', 'blur']
      eventTypes.forEach((eventType) => {
        input.dispatchEvent(new Event(eventType, { bubbles: true }))
      })
      
      // Use the composer's setText method with just the chat text (hidden context is provided separately)
      try {
        if (composer && typeof composer.setText === 'function') {
          composer.setText(text)
        }
      } catch (e) {
        console.error('Error setting composer text:', e)
      }
      
      // Wait and then send
      setTimeout(() => {
        composer.send()
        
        // Call the onSend callback if provided
        if (onSend) {
          onSend()
        }
        
        // Clear after sending
        setTimeout(() => {
          input.value = ''
          input.dispatchEvent(new Event('input', { bubbles: true }))
          if (proseMirrorElement) {
            proseMirrorElement.innerHTML = '<p></p>'
          }
        }, 100)
      }, 50) // Reduced delay since context is already set
    }
  }
}

