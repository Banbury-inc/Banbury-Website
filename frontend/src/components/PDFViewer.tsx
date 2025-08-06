import { FileSystemItem } from '../utils/fileTreeUtils';
import { ApiService } from '../services/apiService';
import { useState, useEffect } from 'react';
import { AlertCircle, Download, FileText, ExternalLink, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Disable worker to avoid CDN issues - PDF.js will run synchronously
pdfjs.GlobalWorkerOptions.workerSrc = '';

interface PDFViewerProps {
  file: FileSystemItem;
  userInfo?: {
    username: string;
    email?: string;
  } | null;
}

export function PDFViewer({ file, userInfo }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  useEffect(() => {
    let currentUrl: string | null = null;

    const loadPDF = async () => {
      if (!file.file_id) {
        setError('No file ID available for this PDF');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Download the PDF file content
        const result = await ApiService.downloadS3File(file.file_id, file.name);
        if (result.success && result.url) {
          currentUrl = result.url;
          setPdfUrl(result.url);
        } else {
          setError('Failed to load PDF content');
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
        setError('Failed to load PDF content');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();

    // Cleanup function to revoke blob URL
    return () => {
      if (currentUrl && currentUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(currentUrl);
      }
    };
  }, [file.file_id, file.name]);

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
      console.error('Failed to download PDF:', err);
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Failed to load PDF document:', error);
    setError(`Failed to load PDF document: ${error.message}`);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!pdfUrl || loading || error) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          if (pageNumber > 1) {
            goToPrevPage();
            event.preventDefault();
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          if (pageNumber < numPages) {
            goToNextPage();
            event.preventDefault();
          }
          break;
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            zoomIn();
            event.preventDefault();
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            zoomOut();
            event.preventDefault();
          }
          break;
        case '0':
          if (event.ctrlKey || event.metaKey) {
            resetZoom();
            event.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfUrl, loading, error, pageNumber, numPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-gray-300">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load PDF</h3>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header with file info and actions */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-red-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">{file.name}</h2>
            <p className="text-sm text-gray-400">
              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
              {file.modified && ` • Modified ${file.modified.toLocaleDateString()}`}
              {numPages > 0 && ` • ${numPages} pages`}
            </p>
            {pdfUrl && !loading && !error && (
              <p className="text-xs text-gray-500 mt-1">
                Use arrow keys to navigate • Ctrl/Cmd + (plus/minus) to zoom • Ctrl/Cmd + 0 to reset zoom
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Controls */}
      {pdfUrl && !loading && !error && (
        <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-white px-3">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* PDF display area */}
      <div className="flex-1 flex justify-center overflow-auto bg-gray-800 p-4">
        {pdfUrl ? (
          <div className="flex flex-col items-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-white">Failed to load PDF</p>
                  </div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="flex items-center justify-center p-8 bg-white border border-gray-300">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-8 bg-white border border-gray-300">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-gray-600">Failed to load page</p>
                    </div>
                  </div>
                }
                className="shadow-lg"
              />
            </Document>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">PDF URL not available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
