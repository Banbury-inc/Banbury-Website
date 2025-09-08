import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import * as XLSX from 'xlsx';

interface ExcelViewerProps {
  content: string;
  onContentChange?: (content: string) => void;
}

const ExcelViewer: React.FC<ExcelViewerProps> = ({ content, onContentChange: _onContentChange }) => {
  const [data, setData] = useState<any[][]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const createEmptyWorkbook = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return wb;
  };

  const toArrayBuffer = (content: any): ArrayBuffer => {
    if (!content || content === 'EMPTY_XLSX_PLACEHOLDER') {
      return new ArrayBuffer(0);
    }
    
    if (content instanceof ArrayBuffer) return content;
    if (content?.buffer instanceof ArrayBuffer) return content.buffer;

    const decodeBase64ToArrayBuffer = (b64: string) => {
      try {
        const binary = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
      } catch (e) {
        throw new Error('Invalid base64 content');
      }
    };

    if (typeof content === 'string') {
      const s = content.trim();
      if (s.startsWith('data:')) {
        const b64 = s.split(',')[1] || '';
        return decodeBase64ToArrayBuffer(b64);
      }
      return decodeBase64ToArrayBuffer(s);
    }

    if (content?.type === 'Buffer' && Array.isArray(content.data)) {
      return Uint8Array.from(content.data).buffer;
    }

    throw new Error('Unsupported content format for xlsx');
  };

  const safeReadWorkbook = (data: ArrayBuffer) => {
    try {
      if ((data?.byteLength || 0) > 0) {
        return XLSX.read(data, { type: 'array' });
      }
    } catch (e) {
      console.warn('Failed to parse xlsx content, creating empty workbook:', e);
    }
    return createEmptyWorkbook();
  };

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const arrayBuffer = toArrayBuffer(content);
        const workbook = safeReadWorkbook(arrayBuffer);
        
        const sheetName = workbook.SheetNames[0];
        if (sheetName) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          setData(jsonData as any[][]);
        } else {
          setData([['']]);
        }
      } catch (err) {
        console.error('Error loading Excel file:', err);
        setError('Failed to load Excel file. Showing empty spreadsheet.');
        setData([['']]);
      } finally {
        setLoading(false);
      }
    };

    loadExcelData();
  }, [content]);

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography>Loading spreadsheet...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          A new blank spreadsheet has been initialized.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Paper elevation={1} sx={{ overflow: 'auto', maxHeight: '500px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {data.length > 0 ? data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Array.isArray(row) ? row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      minWidth: '100px',
                      backgroundColor: rowIndex === 0 ? '#f5f5f5' : 'white'
                    }}
                  >
                    {String(cell || '')}
                  </td>
                )) : (
                  <td
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      minWidth: '100px',
                      backgroundColor: rowIndex === 0 ? '#f5f5f5' : 'white'
                    }}
                  >
                    {String(row || '')}
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '100px' }}>
                  
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Excel Viewer (Read-only)
      </Typography>
    </Box>
  );
};

export default ExcelViewer;
