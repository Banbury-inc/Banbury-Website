export function getDocumentContext(): string {
  let documentContext = '';
  
  try {
    documentContext = localStorage.getItem('pendingDocumentContext') || '';
    console.log('[ClaudeRuntimeProvider] DEBUG - Read pendingDocumentContext:', documentContext.slice(0, 200));
    
    if (documentContext) {
      localStorage.removeItem('pendingDocumentContext'); // Clean up after reading
    } else {
      console.log('[ClaudeRuntimeProvider] DEBUG - No pendingDocumentContext found');
    }
  } catch (error) {
    console.error('[ClaudeRuntimeProvider] DEBUG - Error reading pendingDocumentContext:', error);
  }
  
  return documentContext;
}

