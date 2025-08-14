export interface EmailContent {
  html?: string
  text?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  id: string
  filename: string
  mimeType: string
  size: number
  data?: string
}

/**
 * Extract full email content from Gmail message payload
 */
export function extractEmailContent(payload: any): EmailContent {
  const content: EmailContent = {
    html: undefined,
    text: undefined,
    attachments: []
  }

  if (!payload) return content

  // Recursively process payload parts
  const processPart = (part: any) => {
    if (!part) return

    // Check if this part has attachments
    if (part.filename && part.body?.attachmentId) {
      content.attachments?.push({
        id: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size || 0
      })
    }

    // Extract text content
    if (part.mimeType === 'text/plain' && part.body?.data) {
      try {
        content.text = decodeBase64Url(part.body.data)
      } catch (e) {
        console.error('Failed to decode text content:', e)
      }
    }

    // Extract HTML content
    if (part.mimeType === 'text/html' && part.body?.data) {
      try {
        content.html = decodeBase64Url(part.body.data)
      } catch (e) {
        console.error('Failed to decode HTML content:', e)
      }
    }

    // Process nested parts
    if (part.parts) {
      part.parts.forEach(processPart)
    }
  }

  // Start processing from the root payload
  processPart(payload)

  return content
}

/**
 * Decode base64url encoded data with proper character encoding
 */
function decodeBase64Url(data: string): string {
  try {
    // Replace URL-safe characters and add padding if needed
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    
    // Decode base64 to binary string
    const binaryString = atob(padded)
    
    // Convert binary string to UTF-8 encoded string
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Decode as UTF-8
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(bytes)
  } catch (e) {
    console.error('Failed to decode base64url:', e)
    return ''
  }
}

/**
 * Get the best available content (HTML preferred, fallback to text)
 */
export function getBestContent(content: EmailContent): string {
  if (content.html) {
    return content.html
  }
  if (content.text) {
    return content.text
  }
  return 'No content available'
}

/**
 * Clean up HTML content to fix common encoding issues
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return html
  
  return html
    // Fix common HTML entity issues
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Fix common encoding issues
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"|â€"/g, '–')
    .replace(/â€¦/g, '…')
}

/**
 * Check if email has attachments
 */
export function hasAttachments(content: EmailContent): boolean {
  return content.attachments && content.attachments.length > 0
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
