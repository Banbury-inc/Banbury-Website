import { FileSystemItem } from '../utils/fileTreeUtils';
import { ApiService } from '../services/apiService';
import { useState, useEffect } from 'react';
import { AlertCircle, Download, FileText, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import WordViewer from './workspaces/WordViewer';

interface DocumentViewerProps {
  file: FileSystemItem;
  userInfo?: {
    username: string;
    email?: string;
  } | null;
}

export function DocumentViewer({ file, userInfo }: DocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentUrl: string | null = null;
    
    const loadDocument = async () => {
      if (!file.file_id) {
        setError('No file ID available for this document');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Download the document file content
        const result = await ApiService.downloadS3File(file.file_id, file.name);
        if (result.success && result.url) {
          currentUrl = result.url;
          setDocumentUrl(result.url);
        } else {
          setError('Failed to load document content');
        }
      } catch (err) {
        setError('Failed to load document content');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();

    // Cleanup function
    return () => {
      if (currentUrl && currentUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(currentUrl);
      }
    };
  }, [file.file_id, file.name, file.size, file.modified]);

  const handleDownload = async () => {
    if (!file.file_id) return;
    
    try {
      const result = await ApiService.downloadS3File(file.file_id, file.name);
      if (result.success && result.url) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Clean up the blob URL after download
        setTimeout(() => window.URL.revokeObjectURL(result.url), 1000);
      }
    } catch (err) {
      // console.error('Failed to download document:', err);
    }
  };

  const handleOpenInNewTab = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load document</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with file info and actions */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">{file.name}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="icon"
            onClick={handleOpenInNewTab}
            className="h-9 w-9 bg-primary hover:bg-primary/80"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleDownload}
            className="h-9 w-9 bg-primary hover:bg-primary/80"
            title="Download document"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document display area with TiptapWordEditor */}
      <div className="flex-1 overflow-hidden">
        {documentUrl ? (
          <WordViewer
            src={documentUrl}
            fileName={file.name}
            onError={() => setError('Failed to load document in editor')}
            onLoad={() => setError(null)}
            onSave={(content) => {
              // Handle save - could integrate with your save API here
              // Document saved successfully
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">No document to display</div>
          </div>
        )}
      </div>
    </div>
  );
}
