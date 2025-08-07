import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import TiptapWordEditor from './TiptapWordEditor';
import mammoth from 'mammoth';

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
        let result;
        if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) {
          const response = await fetch(filePath);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        } else {
          throw new Error('Local file access not supported in web environment');
        }
        
        setContent(result.value || '<p>Start editing this document...</p>');
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
  }, [src, fileName, onError, onLoad]);

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
