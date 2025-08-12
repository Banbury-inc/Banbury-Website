import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';
import { Box, Typography, Alert, CircularProgress, Button, Toolbar, IconButton } from '@mui/material';
import {
  Save,
  Add,
  ViewColumn,
  Undo,
  Redo,
  ContentCut,
  ContentCopy,
  ContentPaste,
  Delete,
} from '@mui/icons-material';

// Register all Handsontable modules
registerAllModules();

interface CSVEditorProps {
  src: string;
  fileName?: string;
  onError?: () => void;
  onLoad?: () => void;
  onSave?: (content: string) => void;
  onContentChange?: (data: any[][]) => void;
}

const CSVEditor: React.FC<CSVEditorProps> = ({
  src,
  fileName,
  onError,
  onLoad,
  onSave,
  onContentChange,
}) => {
  const [data, setData] = useState<any[][]>([
    ['Name', 'Email', 'Phone', 'Department'],
    ['John Doe', 'john@example.com', '555-0101', 'Engineering'],
    ['Jane Smith', 'jane@example.com', '555-0102', 'Marketing'],
    ['', '', '', '']
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const hotTableRef = useRef<any>(null);

  // Helper function to parse CSV content
  const parseCSV = (csvContent: string): any[][] => {
    if (!csvContent.trim()) {
      return [
        ['Name', 'Email', 'Phone', 'Department'],
        ['John Doe', 'john@example.com', '555-0101', 'Engineering'],
        ['Jane Smith', 'jane@example.com', '555-0102', 'Marketing'],
        ['', '', '', '']
      ];
    }
    
    const lines = csvContent.split('\n');
    const parsed = lines.map(line => 
      line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')) // Remove quotes
    ).filter(row => row.some(cell => cell !== '')); // Remove empty rows
    
    // Ensure we have at least some data
    if (parsed.length === 0) {
      return [
        ['Name', 'Email', 'Phone', 'Department'],
        ['', '', '', '']
      ];
    }
    
    return parsed;
  };

  // Helper function to convert data back to CSV
  const convertToCSV = (data: any[][]): string => {
    return data.map(row => 
      row.map(cell => {
        const value = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ).join('\n');
  };

  // Load CSV content
  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    const loadCSVContent = async () => {
      try {
        setLoading(true);
        setError(null);

        let filePath = src;
        
        // Remove file:// protocol if present
        if (filePath.startsWith('file://')) {
          filePath = filePath.replace('file://', '');
        }
        
        // Fetch the CSV content
        if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) {
          const response = await fetch(filePath);
          const blob = await response.blob();
          const text = await blob.text();
          
          const parsedData = parseCSV(text);
          setData(parsedData);
        } else {
          // For local files (if needed)
          const response = await fetch(filePath);
          const text = await response.text();
          const parsedData = parseCSV(text);
          setData(parsedData);
        }
        
        onLoad?.();
      } catch (err) {
        const errorMessage = `Failed to load CSV: ${err instanceof Error ? err.message : 'Unable to parse CSV file'}`;
        setError(errorMessage);
        // Keep default data on error
        onError?.();
      } finally {
        setLoading(false);
      }
    };

    loadCSVContent();
  }, [src, onLoad, onError]);

  const handleDataChange = useCallback((changes: any, source: string) => {
    // Ignore programmatic changes to prevent infinite loops
    if (source === 'loadData' || source === 'updateData' || !changes) return;
    
    console.log('Data changed:', changes, source);
    setHasChanges(true);
    
    // Only update our state for user-initiated changes
    if (source === 'edit' || source === 'paste' || source === 'autofill' || source === 'cut') {
      // Get current data from Handsontable
      if (hotTableRef.current?.hotInstance) {
        const currentData = hotTableRef.current.hotInstance.getData();
        // Use a timeout to avoid immediate re-render conflicts
        setTimeout(() => {
          setData(currentData);
          onContentChange?.(currentData);
        }, 0);
      }
    }
  }, [onContentChange]);

  const handleSave = useCallback(() => {
    console.log('Saving data:', data);
    const csvContent = convertToCSV(data);
    onSave?.(csvContent);
    setHasChanges(false);
  }, [data, onSave]);

  // Spreadsheet actions
  const handleAddRow = () => {
    console.log('Adding row');
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance?.alter) {
      hotInstance.alter('insert_row_below');
      setHasChanges(true);
    }
  };

  const handleAddColumn = () => {
    console.log('Adding column');
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance?.alter) {
      hotInstance.alter('insert_col_end');
      setHasChanges(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading spreadsheet...</Typography>
      </Box>
    );
  }

  console.log('Rendering CSVEditor with data:', data);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with file info and save button */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h6" component="h2">
          {fileName || 'Spreadsheet'}
        </Typography>
        
        <Button
          variant="contained"
          size="small"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save {hasChanges ? '(Modified)' : ''}
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ m: 1 }}>
          {error}
        </Alert>
      )}

      {/* Simplified toolbar */}
      <Toolbar sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        gap: 1,
        px: 2
      }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={handleAddRow}
        >
          Add Row
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ViewColumn />}
          onClick={handleAddColumn}
        >
          Add Column
        </Button>
      </Toolbar>

      {/* Debug info */}
      <Box sx={{ p: 1, backgroundColor: '#f5f5f5', fontSize: '12px' }}>
        Data rows: {data.length}, Columns: {data[0]?.length || 0}, Has changes: {hasChanges.toString()}
      </Box>

      {/* Spreadsheet component with fixed height */}
      <Box sx={{ 
        flex: 1,
        minHeight: '400px', // Ensure minimum height
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '2px solid red' // Debug border to see the container
      }}>
        <div style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px',
          position: 'relative',
          border: '2px solid blue' // Debug border for the div
        }}>
          <HotTable
            ref={hotTableRef}
            data={data}
            colHeaders={true}
            rowHeaders={true}
            height={400} // Fixed height instead of percentage
            width="100%"
            licenseKey="non-commercial-and-evaluation"
            contextMenu={true}
            manualRowResize={true}
            manualColumnResize={true}
            afterChange={handleDataChange}
          />
        </div>
      </Box>
    </Box>
  );
};

export default CSVEditor;
