import { FileSystemItem } from '../utils/fileTreeUtils';
import { ApiService } from '../services/apiService';
import { useState, useEffect } from 'react';
import { AlertCircle, Download, Eye } from 'lucide-react';

interface ImageViewerProps {
  file: FileSystemItem;
  userInfo?: {
    username: string;
    email?: string;
  } | null;
}

export function ImageViewer({ file, userInfo }: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentUrl: string | null = null;

    const loadImage = async () => {
      if (!file.file_id) {
        setError('No file ID available for this image');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Download the image file content
        const result = await ApiService.downloadS3File(file.file_id, file.name);
        if (result.success && result.url) {
          currentUrl = result.url;
          setImageUrl(result.url);
        } else {
          setError('Failed to load image content');
        }
      } catch (err) {
        console.error('Failed to load image:', err);
        setError('Failed to load image content');
      } finally {
        setLoading(false);
      }
    };

    loadImage();

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
      console.error('Failed to download image:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-gray-300">Loading image...</p>
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
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load image</h3>
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
          <Eye className="h-5 w-5 text-blue-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">{file.name}</h2>
            <p className="text-sm text-gray-400">
              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
              {file.modified && ` • Modified ${file.modified.toLocaleDateString()}`}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {/* Image display area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        ) : (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">Image URL not available</p>
          </div>
        )}
      </div>
    </div>
  );
}
