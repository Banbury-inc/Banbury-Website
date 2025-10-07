import { diffWords } from 'diff'

/**
 * Custom HTML diff implementation without relying on paid Tiptap features
 * Creates a diff between two HTML strings and returns HTML with track changes markup
 * @param oldHtml The original HTML content
 * @param newHtml The new HTML content
 * @returns HTML string with <span class="diff-insertion"> for additions and <span class="diff-deletion"> for deletions
 */
export function createHtmlDiff(oldHtml: string, newHtml: string): string {
  const oldText = stripHtmlTags(oldHtml)
  const newText = stripHtmlTags(newHtml)
  
  const diff = diffWords(oldText, newText, { ignoreCase: false })
  
  let result = ''
  
  for (const part of diff) {
    const content = escapeHtml(part.value)
    
    if (part.added) {
      result += `<span class="diff-insertion" data-diff="insertion">${content}</span>`
    } else if (part.removed) {
      result += `<span class="diff-deletion" data-diff="deletion">${content}</span>`
    } else {
      result += content
    }
  }
  
  return wrapInParagraphs(result)
}

/**
 * Creates a more sophisticated diff that preserves HTML structure
 * Custom implementation without paid Tiptap features
 * @param oldHtml The original HTML content
 * @param newHtml The new HTML content  
 * @returns HTML string with track changes using custom classes
 */
export function createStructuredHtmlDiff(oldHtml: string, newHtml: string): string {
  const oldCleaned = cleanHtml(oldHtml)
  const newCleaned = cleanHtml(newHtml)
  
  // Try to preserve paragraph structure from the new content
  const newParagraphs = extractParagraphs(newCleaned)
  const oldParagraphs = extractParagraphs(oldCleaned)
  
  // If similar structure, do paragraph-by-paragraph diff
  if (Math.abs(newParagraphs.length - oldParagraphs.length) <= 2) {
    return createParagraphLevelDiff(oldParagraphs, newParagraphs)
  }
  
  // Otherwise, do simple inline diff
  return createInlineDiff(oldCleaned, newCleaned)
}

function extractParagraphs(html: string): string[] {
  const div = document.createElement('div')
  div.innerHTML = html
  const paragraphs: string[] = []
  
  // Extract p, h1-h6, li elements
  const elements = div.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li')
  elements.forEach(el => {
    const text = el.textContent?.trim() || ''
    if (text) paragraphs.push(text)
  })
  
  // If no structured elements found, split by double newlines
  if (paragraphs.length === 0) {
    const text = stripHtmlTags(html)
    return text.split(/\n\n+/).filter(p => p.trim().length > 0)
  }
  
  return paragraphs
}

function createParagraphLevelDiff(oldParagraphs: string[], newParagraphs: string[]): string {
  const maxLength = Math.max(oldParagraphs.length, newParagraphs.length)
  let result = ''
  
  for (let i = 0; i < maxLength; i++) {
    const oldPara = oldParagraphs[i] || ''
    const newPara = newParagraphs[i] || ''
    
    if (!oldPara && newPara) {
      // New paragraph added
      result += `<p><span class="diff-insertion" data-diff="insertion">${escapeHtml(newPara)}</span></p>`
    } else if (oldPara && !newPara) {
      // Paragraph deleted
      result += `<p><span class="diff-deletion" data-diff="deletion">${escapeHtml(oldPara)}</span></p>`
    } else if (oldPara !== newPara) {
      // Paragraph modified - show word-level diff
      const diff = diffWords(oldPara, newPara)
      let paraContent = ''
      
      for (const part of diff) {
        const content = escapeHtml(part.value)
        if (part.added) {
          paraContent += `<span class="diff-insertion" data-diff="insertion">${content}</span>`
        } else if (part.removed) {
          paraContent += `<span class="diff-deletion" data-diff="deletion">${content}</span>`
        } else {
          paraContent += content
        }
      }
      
      result += `<p>${paraContent}</p>`
    } else {
      // Paragraph unchanged
      result += `<p>${escapeHtml(oldPara)}</p>`
    }
  }
  
  return result || '<p></p>'
}

function createInlineDiff(oldHtml: string, newHtml: string): string {
  const oldText = stripHtmlTags(oldHtml)
  const newText = stripHtmlTags(newHtml)
  
  const diff = diffWords(oldText, newText)
  
  let result = '<p>'
  
  for (const part of diff) {
    const content = escapeHtml(part.value)
    
    if (part.added) {
      result += `<span class="diff-insertion" data-diff="insertion">${content}</span>`
    } else if (part.removed) {
      result += `<span class="diff-deletion" data-diff="deletion">${content}</span>`
    } else {
      result += content
    }
  }
  
  result += '</p>'
  return result
}

function stripHtmlTags(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

function cleanHtml(html: string): string {
  // Remove empty paragraphs and extra whitespace
  return html
    .replace(/<p><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .trim()
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function wrapInParagraphs(content: string): string {
  // Split by line breaks and wrap in paragraphs
  const lines = content.split('\n').filter(line => line.trim().length > 0)
  if (lines.length === 0) return '<p></p>'
  if (lines.length === 1) return `<p>${lines[0]}</p>`
  return lines.map(line => `<p>${line}</p>`).join('')
}

