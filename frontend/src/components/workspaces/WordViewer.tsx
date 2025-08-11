import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import mammoth from 'mammoth';
import React, { useState, useEffect } from 'react';

import TiptapWordEditor from './TiptapWordEditor';


interface WordViewerProps {
  src: string;
  fileName?: string;
  onError?: () => void;
  onLoad?: () => void;
  onSave?: (content: string) => void;
  documentActions?: any;
  onDocumentEditorChange?: (editor: any, content: string, fileName: string) => void;
}

const WordViewer: React.FC<WordViewerProps> = ({
  src,
  fileName,
  onError,
  onLoad,
  onSave,
  onDocumentEditorChange,
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load DOCX content using mammoth
  useEffect(() => {
    if (!src) return;

    const loadDocxContent = async () => {
      try {
        setLoading(true);
        setError(null);

        let filePath = src;
        
        // Remove file:// protocol if present
        if (filePath.startsWith('file://')) {
          filePath = filePath.replace('file://', '');
        }
        
        // Fetch the document content
        let htmlContent;
        if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) {
          const response = await fetch(filePath);
          const blob = await response.blob();
          
          // Check the content type and file extension to determine how to parse
          const contentType = blob.type;
          const fileExtension = fileName?.toLowerCase().split('.').pop() || '';
          
          // Check if this is our custom edited DOCX format
          const isEditedDocx = contentType === 'application/vnd.banbury.docx-html';
          
          if (contentType.includes('text/html') || contentType.includes('html') || fileExtension === 'html' || isEditedDocx) {
            // It's an HTML file (including edited DOCX) - read it directly
            const text = await blob.text();
            
            // Check if it has our special meta tags indicating it's an edited DOCX
            const hasOriginalFormatMeta = text.includes('meta name="original-format" content="docx"');
            const hasEditorMeta = text.includes('meta name="editor" content="banbury-editor"');
            
            if (hasOriginalFormatMeta && hasEditorMeta) {
              // This is our edited DOCX format - extract the body content
              const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              htmlContent = bodyMatch ? bodyMatch[1] : text;
            } else {
              // Regular HTML file
              const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              htmlContent = bodyMatch ? bodyMatch[1] : text;
            }
          } else if (fileExtension === 'docx') {
            // Original DOCX file - use mammoth to convert
            try {
              const arrayBuffer = await blob.arrayBuffer();
              const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
              htmlContent = result.value;
            } catch (mammothError) {
              // If mammoth fails on a .docx file, it might be our edited format
              const text = await blob.text();
              if (text.includes('<') && text.includes('>')) {
                const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                htmlContent = bodyMatch ? bodyMatch[1] : text;
              } else {
                throw mammothError; // Re-throw the original error
              }
            }
          } else {
            // Try to parse as DOCX first, if it fails, treat as HTML/text
            try {
              const arrayBuffer = await blob.arrayBuffer();
              const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
              htmlContent = result.value;
            } catch (mammothError) {
              // If mammoth fails, try reading as text/HTML
              const text = await blob.text();
              // Check if it looks like HTML content
              if (text.includes('<') && text.includes('>')) {
                const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                htmlContent = bodyMatch ? bodyMatch[1] : text;
              } else {
                // If it's plain text, wrap it in a paragraph
                htmlContent = `<p>${text}</p>`;
              }
            }
          }
        } else {
          throw new Error('Local file access not supported in web environment');
        }
        
        setContent(htmlContent || '<p>Start editing this document...</p>');
        onLoad?.();
        
      } catch (err) {
        const errorMessage = `Failed to load document: ${err instanceof Error ? err.message : 'Unable to parse DOCX file'}`;
        setError(errorMessage);
        setContent(`
          <div>
            <h2>Document: ${fileName}</h2>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; color: #856404;"><strong>Unable to load DOCX content</strong></p>
              <p style="margin: 8px 0 0 0; color: #856404; font-size: 14px;">
                The document format may not be supported or the file may be corrupted. 
                You can start editing with rich text formatting below.
              </p>
            </div>
            <p>Start typing your content here...</p>
          </div>
        `);
        onError?.();
      } finally {
        setLoading(false);
      }
    };

    loadDocxContent();
  }, [src, fileName]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onSave?.(newContent);
    
    // Mock editor object for backward compatibility
    const mockEditor = {
      getHTML: () => newContent,
      getText: () => newContent.replace(/<[^>]*>/g, ''),
    };
    
    onDocumentEditorChange?.(mockEditor, newContent, fileName || 'Untitled Document');
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading document...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="warning" sx={{ m: 1 }}>
          {error}
        </Alert>
      )}
      <TiptapWordEditor
        initialContent={content}
        onContentChange={handleContentChange}
        placeholder={`Start editing ${fileName || 'your document'}...`}
      />
    </Box>
  );
};

export default WordViewer;
