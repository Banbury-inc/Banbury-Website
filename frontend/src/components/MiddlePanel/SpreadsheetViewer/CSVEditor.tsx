import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import { textRenderer, registerRenderer, checkboxRenderer } from 'handsontable/renderers';
import 'handsontable/dist/handsontable.full.css';
import { createAiResponseHandler } from './handlers/handle-ai-response';
import { createDataChangeHandler } from './handlers/handle-data-change';
import { createCellStyleHandlers } from './handlers/handle-cell-styles';
import { createAlignmentHandlers } from './handlers/handle-alignment';
import { createBorderHandlers } from './handlers/handle-borders';
import { createFormatHandlers } from './handlers/handle-formats';
import { createFontHandlers } from './handlers/handle-font';
import { createKeyboardHandler } from './handlers/handle-keyboard';
import { createCSVLoadHandler } from './handlers/handle-csv-load';
import { createCopyPasteHandlers } from './handlers/handle-copy-paste';
import { createTableOperationsHandlers } from './handlers/handle-table-operations';
import { handleEditDropdownOptions } from './handlers/handle-edit-dropdown-options';
import { parseCSV, convertToCSV, convertToCSVWithMeta } from './utils/csv-parser';
import CSVEditorToolbar from './components/CSVEditorToolbar';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
// Register all Handsontable modules
registerAllModules();

interface CSVEditorProps {
  src: string;
  fileName?: string;
  srcBlob?: Blob;
  onError?: () => void;
  onLoad?: () => void;
  onSave?: (content: string) => void;
  onSaveXlsx?: (blob: Blob, fileName: string) => void;
  onContentChange?: (data: any[][]) => void;
  onFormattingChange?: (formatting: {
    cellFormats: {[key: string]: {className?: string}};
    cellStyles: {[key: string]: React.CSSProperties};
    cellTypeMeta: {[key: string]: { type: 'dropdown' | 'checkbox' | 'numeric' | 'date' | 'text'; source?: string[]; numericFormat?: { pattern?: string; culture?: string }; dateFormat?: string }};
    columnWidths: {[key: string]: number};
  }) => void;
  onSaveDocument?: () => void;
  onDownloadDocument?: () => void;
  saving?: boolean;
  canSave?: boolean;
}

const CSVEditor: React.FC<CSVEditorProps> = ({
  src,
  fileName,
  srcBlob,
  onError,
  onLoad,
  onSave,
  onContentChange,
  onFormattingChange,
  onSaveDocument,
  onDownloadDocument,
  saving = false,
  canSave = false,
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
  const [containerHeight, setContainerHeight] = useState(600);
  const [fontSize, setFontSize] = useState<number>(12);
  const hotTableRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSelectionRef = useRef<[number, number, number, number] | null>(null);
  const [cellFormats, setCellFormats] = useState<{[key: string]: {className?: string}}>({});
  const [cellStyles, setCellStyles] = useState<{[key: string]: React.CSSProperties}>({});
  const [borderStyle, setBorderStyle] = useState<'thin' | 'thick' | 'dashed'>('thin');
  const [customBordersDefs, setCustomBordersDefs] = useState<any[]>([]);
  const [cellTypeMeta, setCellTypeMeta] = useState<{[key: string]: { type: 'dropdown' | 'checkbox' | 'numeric' | 'date' | 'text'; source?: string[]; numericFormat?: { pattern?: string; culture?: string }; dateFormat?: string }} >({});
  const [columnWidths, setColumnWidths] = useState<{[key: string]: number}>({});

  const pendingCellMetaRef = useRef<Record<string, { 
    type: 'dropdown' | 'checkbox' | 'numeric' | 'date' | 'text'; 
    source?: string[]; 
    numericFormat?: { pattern?: string; culture?: string };
    dateFormat?: string;
  }> | null>(null);



  const parseCSVWithMeta = (content: string) => {
    const parsed = parseCSV(content);
    
    let metaObj: any = {};
    if (content.startsWith('##BANBURY_META=')) {
      const lines = content.split('\n');
      const metaLine = lines[0];
      
      try {
        const encoded = metaLine.replace('##BANBURY_META=', '');
        const decoded = atob(encoded);
        metaObj = JSON.parse(decoded);
        if (metaObj && metaObj.cells && typeof metaObj.cells === 'object') {
          // Store cell type metadata
          const cellTypeMeta: any = {};
          const cellFormats: any = {};
          const cellStyles: any = {};
          
          Object.entries(metaObj.cells).forEach(([key, cellMeta]: [string, any]) => {
            // Extract type metadata
            if (cellMeta.type) {
              const typeMeta: any = { type: cellMeta.type };
              if (cellMeta.source) typeMeta.source = cellMeta.source;
              if (cellMeta.numericFormat) typeMeta.numericFormat = cellMeta.numericFormat;
              if (cellMeta.dateFormat) typeMeta.dateFormat = cellMeta.dateFormat;
              cellTypeMeta[key] = typeMeta;
            }
            
            // Extract formatting metadata
            if (cellMeta.className) {
              cellFormats[key] = { className: cellMeta.className };
            }
            
            if (cellMeta.styles) {
              cellStyles[key] = cellMeta.styles;
            }
          });
          
          // Extract column widths if present
          if (metaObj.columnWidths && typeof metaObj.columnWidths === 'object') {
            setColumnWidths(metaObj.columnWidths);
          }
          
          // Store for Handsontable meta application
          pendingCellMetaRef.current = cellTypeMeta;
          
          // Apply formatting immediately (only if there's actual data)
          if (Object.keys(cellFormats).length > 0) {
            setCellFormats(prev => {
              // Only update if different to prevent unnecessary re-renders
              if (JSON.stringify(prev) !== JSON.stringify(cellFormats)) {
                return cellFormats;
              }
              return prev;
            });
          }
          if (Object.keys(cellStyles).length > 0) {
            setCellStyles(prev => {
              // Only update if different to prevent unnecessary re-renders
              if (JSON.stringify(prev) !== JSON.stringify(cellStyles)) {
                return cellStyles;
              }
              return prev;
            });
          }
          if (Object.keys(cellTypeMeta).length > 0) {
            setCellTypeMeta(prev => {
              // Only update if different to prevent unnecessary re-renders
              if (JSON.stringify(prev) !== JSON.stringify(cellTypeMeta)) {
                return cellTypeMeta;
              }
              return prev;
            });
          }
        }
      } catch {
        // Invalid metadata, ignore
      }
    }
    
    return { parsed, metaObj };
  };



  // Calculate container height to use full viewport
  useEffect(() => {
    const calculateHeight = () => {
      // Use viewport height minus toolbar height and some padding
      const viewportHeight = window.innerHeight;
      const toolbarHeight = 40; // Height of the toolbar
      const padding = 20; // Some padding for margins
      const calculatedHeight = Math.max(600, viewportHeight - toolbarHeight - padding);
      setContainerHeight(calculatedHeight);
    };

    // Initial calculation
    calculateHeight();

    // Recalculate on window resize
    const handleResize = () => {
      calculateHeight();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
    const pending = pendingCellMetaRef.current;
    if (!pending) return;
    try {
      const entries = Object.entries(pending);
      for (const [key, meta] of entries) {
        const [rs, cs] = key.split('-');
        const r = parseInt(rs, 10);
        const c = parseInt(cs, 10);
        if (Number.isNaN(r) || Number.isNaN(c)) continue;
        hotInstance.setCellMeta(r, c, 'type', meta.type);
        if (meta.type === 'dropdown' && Array.isArray((meta as any).source)) {
          hotInstance.setCellMeta(r, c, 'source', meta.source);
          hotInstance.setCellMeta(r, c, 'strict', false); // Allow typing custom values
        }
        if (meta.type === 'numeric' && (meta as any).numericFormat) {
          hotInstance.setCellMeta(r, c, 'numericFormat', (meta as any).numericFormat);
        }
        if (meta.type === 'date' && (meta as any).dateFormat) {
          hotInstance.setCellMeta(r, c, 'dateFormat', (meta as any).dateFormat);
        }
        // Clean numeric/date format if switching from them
        if (meta.type === 'dropdown' || meta.type === 'checkbox') {
          hotInstance.removeCellMeta(r, c, 'numericFormat');
          hotInstance.removeCellMeta(r, c, 'dateFormat');
        }
      }
      hotInstance.render();
      // Mirror to our local state so it persists on subsequent renders and edits
      const mirrored: {[key:string]: any} = {};
      Object.entries(pending).forEach(([k, m]) => { mirrored[k] = m as any; });
      setCellTypeMeta((prev) => ({ ...prev, ...mirrored }));
    } catch {}
    pendingCellMetaRef.current = null;
  }, [data]); // Run when data changes

  // Restore column widths when they change
  useEffect(() => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance || Object.keys(columnWidths).length === 0) return;

    try {
      const manualColumnResize = hotInstance.getPlugin('manualColumnResize');
      if (manualColumnResize && manualColumnResize.setManualSize) {
        Object.entries(columnWidths).forEach(([colIndex, width]) => {
          const col = parseInt(colIndex, 10);
          if (!isNaN(col) && width > 0) {
            manualColumnResize.setManualSize(col, width);
          }
        });
        hotInstance.render();
      }
    } catch (error) {
      console.warn('Failed to restore column widths:', error);
    }
  }, [columnWidths]);

  // Use ref to capture latest onContentChange to avoid dependency issues
  const onContentChangeRef = useRef(onContentChange);
  onContentChangeRef.current = onContentChange;

  // Listen for AI spreadsheet responses and apply to table
  useEffect(() => {
    const handler = createAiResponseHandler({
      hotTableRef,
      setData,
      onContentChange: (data: any[][]) => onContentChangeRef.current?.(data),
      setHasChanges
    });

    window.addEventListener('sheet-ai-response', handler as EventListener);
    return () => window.removeEventListener('sheet-ai-response', handler as EventListener);
  }, []); // Empty dependency array since we use refs for dynamic values

  // Configure plugins after table initialization
  useEffect(() => {
    if (hotTableRef.current?.hotInstance) {
      const hotInstance = hotTableRef.current.hotInstance;
      
      // Enable plugins if they exist
      try {
        if (hotInstance.getPlugin) {
          const undoRedo = hotInstance.getPlugin('undoRedo');
          if (undoRedo && !undoRedo.isEnabled()) {
            undoRedo.enablePlugin();
          }
          
          const copyPaste = hotInstance.getPlugin('copyPaste');
          if (copyPaste && !copyPaste.isEnabled()) {
            copyPaste.enablePlugin();
          }
          
          const search = hotInstance.getPlugin('search');
          if (search && !search.isEnabled()) {
            search.enablePlugin();
          }
          
          const columnSorting = hotInstance.getPlugin('columnSorting');
          if (columnSorting && !columnSorting.isEnabled()) {
            columnSorting.enablePlugin();
          }
        }
      } catch (error) {
        // Silently handle plugin initialization errors
      }
    }
  }, []); // Remove data dependency to prevent infinite re-renders

  const handleDataChange = useCallback(
    createDataChangeHandler({
      hotTableRef,
      setData,
      onContentChange,
      setHasChanges,
      cellTypeMeta,
      setCellTypeMeta
    }),
    []
  );

  const handleUndo = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance && hotInstance.isUndoAvailable && hotInstance.isUndoAvailable()) {
      hotInstance.undo();
    }
  };

  const handleRedo = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance && hotInstance.isRedoAvailable && hotInstance.isRedoAvailable()) {
      hotInstance.redo();
    }
  };

  const handleToggleFilters = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance?.getPlugin) {
      const filters = hotInstance.getPlugin('filters');
      if (filters) {
        if (filters.isEnabled()) {
          filters.disablePlugin();
        } else {
          filters.enablePlugin();
        }
        hotInstance.render();
      }
    }
  };

  const handleMergeCells = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance?.getPlugin) {
      const mergeCells = hotInstance.getPlugin('mergeCells');
      if (mergeCells && mergeCells.isEnabled()) {
        const selected = hotInstance.getSelected();
        if (selected && selected.length > 0) {
          const [startRow, startCol, endRow, endCol] = selected[0];
          if (startRow !== endRow || startCol !== endCol) {
            mergeCells.merge(startRow, startCol, endRow, endCol);
            setHasChanges(true);
          }
        }
      }
    }
  };


  const { applyCellStyle, removeCellStyle } = useMemo(() => 
    createCellStyleHandlers({
      hotTableRef,
      setCellStyles,
      setHasChanges,
      lastSelectionRef
    }), [setCellStyles, setHasChanges]
  );

  const { handleAlignLeft, handleAlignCenter, handleAlignRight } = useMemo(() => 
    createAlignmentHandlers({
      hotTableRef,
      cellFormats,
      setCellFormats,
      setHasChanges
    }), [cellFormats, setCellFormats, setHasChanges]
  );

  const { applyBordersOption } = useMemo(() => 
    createBorderHandlers({
      hotTableRef,
      cellStyles,
      setCellStyles,
      setHasChanges,
      lastSelectionRef,
      borderStyle,
      setCustomBordersDefs,
      onContentChange
    }), [cellStyles, setCellStyles, setHasChanges, borderStyle, setCustomBordersDefs, onContentChange]
  );

  const { handleCurrencyFormat, handleDateFormat, handlePercentageFormat, handleNumberFormat, handleTextFormat, handleDropdownFormat } = useMemo(() => 
    createFormatHandlers({
      hotTableRef,
      cellTypeMeta,
      setCellTypeMeta,
      setHasChanges,
      onContentChange
    }), [cellTypeMeta, setCellTypeMeta, setHasChanges, onContentChange]
  );

  const { handleFontSize, handleFontSizeChange, handleFontSizeIncrement, handleFontSizeDecrement } = useMemo(() => 
    createFontHandlers({
      fontSize,
      setFontSize,
      applyCellStyle
    }), [fontSize, setFontSize, applyCellStyle]
  );

  const { handleCopy, handlePaste, handleCut, handleSelectAll } = useMemo(() => 
    createCopyPasteHandlers({
      hotTableRef,
      setHasChanges
    }), [setHasChanges]
  );

  const { handleSearch, handleAddRow, handleAddColumn, handleClear } = useMemo(() => 
    createTableOperationsHandlers({
      hotTableRef,
      setHasChanges
    }), [setHasChanges]
  );

  const toggleCellFormat = (className: string) => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (hotInstance) {
      const selected = hotInstance.getSelected();
      if (selected && selected.length > 0) {
        const [startRow, startCol, endRow, endCol] = selected[0];
        const newCellFormats = { ...cellFormats };
        
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            const cellKey = `${row}-${col}`;
            const currentFormat = newCellFormats[cellKey] || {};
            const currentClassName = currentFormat.className || '';
            const classNames = currentClassName.split(' ').filter((c: string) => c.trim() !== '');
            
            // Check if the class is already applied
            const classIndex = classNames.indexOf(className);
            
            if (classIndex > -1) {
              // Remove the class (toggle off)
              classNames.splice(classIndex, 1);
            } else {
              // Add the class (toggle on)
              classNames.push(className);
            }
            
            // Update the cell format
            newCellFormats[cellKey] = {
              ...currentFormat,
              className: classNames.join(' ').trim()
            };
          }
        }
        setCellFormats(newCellFormats);
        hotInstance.render();
        setHasChanges(true);
        try {
          const current = hotInstance.getData && hotInstance.getData();
          if (current) onContentChange?.(current);
        } catch {}
      }
    }
  };

  const handleBold = () => {
    toggleCellFormat('ht-bold');
  };

  const handleItalic = () => {
    toggleCellFormat('ht-italic');
  };

  const handleUnderline = () => {
    toggleCellFormat('ht-underline');
  };

  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(true);

  // Load CSV/XLSX content (only when src changes)
  useEffect(() => {
    if (!src && !srcBlob) {
      setLoading(false);
      return;
    }

    const loadCSVContent = createCSVLoadHandler({
      src,
      srcBlob,
      fileName,
      onLoad,
      onError,
      setLoading,
      setError,
      setData,
      setCellFormats,
      setCellStyles,
      pendingCellMetaRef,
      parseCSVWithMeta
    });

    loadCSVContent();
  }, []);

  useEffect(() => {
    try {
      registerRenderer('banburyStyledRenderer', (instance: any, td: HTMLTableCellElement, ...rest: any[]) => {
        // Use default text renderer first
        // @ts-ignore
        textRenderer(instance, td, ...rest);
        const [row, col] = rest;
        const meta = instance.getCellMeta(row, col) || {};
        if (meta.className) td.className = meta.className;
        if (meta.style) {
          try { Object.assign(td.style, meta.style); } catch {}
        }
        return td;
      });
    } catch {}
  }, []);



  // Display helper: format dates as MM/DD/YYYY by default when cell type is 'date'
  const formatDateDisplay = (value: any): string => {
    if (value == null || value === '') return '';
    try {
      if (value instanceof Date) {
        return value.toLocaleDateString('en-US');
      }
      if (typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) return date.toLocaleDateString('en-US');
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) return trimmed;
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) return parsed.toLocaleDateString('en-US');
      }
    } catch {}
    return String(value);
  };


  // Handsontable context menu configuration with custom items
  const contextMenuConfig = useMemo(() => ({
    items: {
      row_above: {},
      row_below: {},
      col_left: {},
      col_right: {},
      remove_row: {},
      remove_col: {},
      undo: {},
      redo: {},
      clear_column: {},
    }
  }), []);







  // Add custom CSS styles for cell formatting
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .handsontable .ht-bold {
        font-weight: bold !important;
      }
      .handsontable .ht-italic {
        font-style: italic !important;
      }
      .handsontable .ht-underline {
        text-decoration: underline !important;
      }
      .handsontable .ht-align-left {
        text-align: left !important;
      }
      .handsontable .ht-align-center {
        text-align: center !important;
      }
      .handsontable .ht-align-right {
        text-align: right !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);


  // Listen for workspace outside clicks to deselect cells and lose focus
  useEffect(() => {
    const handleWorkspaceOutsideClick = () => {
      const hotInstance = hotTableRef.current?.hotInstance;
      if (hotInstance && hotInstance.deselectCell) {
        hotInstance.deselectCell();
      }
      // Disable editor focus when clicking outside
      setIsEditorFocused(false);
    };

    window.addEventListener('workspace-outside-click', handleWorkspaceOutsideClick);
    
    return () => {
      window.removeEventListener('workspace-outside-click', handleWorkspaceOutsideClick);
    };
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const keyboardHandler = createKeyboardHandler({
      isEditorFocused,
      handleBold,
      handleItalic,
      handleUnderline,
      handleRedo,
      handleUndo,
      handleCopy,
      handlePaste,
      handleCut,
      handleSelectAll,
      handleSearch,
      handleToggleFilters,
      handleAddRow,
      handleAddColumn,
      handleClear,
      setHelpDialogOpen
    });

    document.addEventListener('keydown', keyboardHandler);
    
    return () => {
      document.removeEventListener('keydown', keyboardHandler);
    };
  }, [
    isEditorFocused,
    handleBold,
    handleItalic,
    handleUnderline,
    handleRedo,
    handleUndo,
    handleCopy,
    handlePaste,
    handleCut,
    handleSelectAll,
    handleSearch,
    handleToggleFilters,
    handleAddRow,
    handleAddColumn,
    handleClear,
    setHelpDialogOpen
  ]);

  // Notify parent component when formatting changes (with debounce and deep comparison to prevent infinite loops)
  const prevFormattingRef = useRef<{
    cellFormats: {[key: string]: {className?: string}};
    cellStyles: {[key: string]: React.CSSProperties};
    cellTypeMeta: {[key: string]: any};
    columnWidths: {[key: string]: number};
  } | null>(null);
  const formattingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentFormatting = {
      cellFormats,
      cellStyles,
      cellTypeMeta,
      columnWidths
    };

    // Only call onFormattingChange if the formatting has actually changed
    const hasChanged = !prevFormattingRef.current || 
      JSON.stringify(prevFormattingRef.current.cellFormats) !== JSON.stringify(cellFormats) ||
      JSON.stringify(prevFormattingRef.current.cellStyles) !== JSON.stringify(cellStyles) ||
      JSON.stringify(prevFormattingRef.current.cellTypeMeta) !== JSON.stringify(cellTypeMeta) ||
      JSON.stringify(prevFormattingRef.current.columnWidths) !== JSON.stringify(columnWidths);

    if (hasChanged && onFormattingChange) {
      // Clear any existing timeout
      if (formattingTimeoutRef.current) {
        clearTimeout(formattingTimeoutRef.current);
      }
      
      // Debounce the callback to prevent excessive calls
      formattingTimeoutRef.current = setTimeout(() => {
        onFormattingChange(currentFormatting);
        prevFormattingRef.current = currentFormatting;
      }, 100); // 100ms debounce
    }
  }, [cellFormats, cellStyles, cellTypeMeta, columnWidths]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (formattingTimeoutRef.current) {
        clearTimeout(formattingTimeoutRef.current);
      }
    };
  }, []);



  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading spreadsheet...</Typography>
      </Box>
    );
  }

  return (
    <Box 
      className="csv-editor-container"
      sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        // Check if click is outside the table area but not on toolbar
        const target = e.target as HTMLElement;
        const isTableClick = target.closest('.handsontable-container-full') || target.closest('.ht_master');
        const isMenuClick = target.closest('[role="menu"]') || target.closest('[role="dialog"]');
        
        // If click is outside table and menus, deselect cells
        if (!isTableClick && !isMenuClick) {
          const hotInstance = hotTableRef.current?.hotInstance;
          if (hotInstance && hotInstance.deselectCell) {
            hotInstance.deselectCell();
          }
        }
        
        // Re-enable focus when clicking within the CSV editor
        if (!isEditorFocused) {
          setIsEditorFocused(true);
        }
      }}
    >

      {error && (
        <Alert severity="warning" sx={{ m: 1 }}>
          {error}
        </Alert>
      )}

      <CSVEditorToolbar
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleCurrencyFormat={handleCurrencyFormat}
        handleDateFormat={handleDateFormat}
        handlePercentageFormat={handlePercentageFormat}
        handleNumberFormat={handleNumberFormat}
        handleTextFormat={handleTextFormat}
        handleDropdownFormat={handleDropdownFormat}
        handleBold={handleBold}
        handleItalic={handleItalic}
        handleUnderline={handleUnderline}
        handleAlignLeft={handleAlignLeft}
        handleAlignCenter={handleAlignCenter}
        handleAlignRight={handleAlignRight}
        handleMergeCells={handleMergeCells}
        handleToggleFilters={handleToggleFilters}
        fontSize={fontSize}
        handleFontSizeChange={handleFontSizeChange}
        handleFontSizeIncrement={handleFontSizeIncrement}
        handleFontSizeDecrement={handleFontSizeDecrement}
        applyCellStyle={applyCellStyle}
        removeCellStyle={removeCellStyle}
        applyBordersOption={applyBordersOption}
        borderStyle={borderStyle}
        setBorderStyle={setBorderStyle}
        onSaveDocument={onSaveDocument}
        onDownloadDocument={onDownloadDocument}
        saving={saving}
        canSave={canSave}
        setHelpDialogOpen={setHelpDialogOpen}
      />


      {/* Spreadsheet component stretching to full height */}
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1,
          position: 'relative',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          minHeight: 0 // Allow flex item to shrink below content size
        }}
      >
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}
          className="handsontable-container-full"
        >
          <HotTable
            ref={hotTableRef}
            data={data}
            colHeaders={true}
            rowHeaders={true}
            dropdownMenu={true}
            contextMenu={contextMenuConfig as any}
            height={containerHeight}
            width="100%"
            licenseKey="non-commercial-and-evaluation"
            manualRowResize={true}
            manualColumnResize={true}
            outsideClickDeselects={false}
            selectionMode="multiple"
            afterChange={handleDataChange}
            afterSelectionEnd={(r: number, c: number, r2: number, c2: number) => { lastSelectionRef.current = [r,c,r2,c2]; }}
            afterColumnResize={(currentColumn: number, newSize: number) => {
              setColumnWidths(prev => ({
                ...prev,
                [currentColumn]: newSize
              }));
              setHasChanges(true);
            }}
            stretchH="all"
            customBorders={customBordersDefs.length ? customBordersDefs : undefined}
            minRows={Math.max(1000, data.length)}
            rowHeights={26}
            autoWrapRow={false}
            viewportRowRenderingOffset={50}
            viewportColumnRenderingOffset={50}
            cells={(row: number, col: number) => {
              const cellKey = `${row}-${col}`;
              const persisted = cellTypeMeta[cellKey];
              
              // Configure cell properties based on persisted metadata
              const cellConfig: any = {
                renderer: (instance: any, td: HTMLTableCellElement, r: number, c: number, prop: any, value: any, cellProperties: any) => {
                  const cellKey = `${r}-${c}`;
                  
                  // Delegate to appropriate base renderer based on meta.type
                  try {
                    const meta = instance.getCellMeta(r, c) || {};
                    // Re-apply persisted type meta if Handsontable meta was lost (similar to class/style persistence)
                    const persisted = cellTypeMeta[cellKey];
                    if (persisted && (!meta || meta.type !== persisted.type)) {
                      try {
                        instance.setCellMeta(r, c, 'type', persisted.type);
                        if (persisted.type === 'dropdown' && Array.isArray(persisted.source)) {
                          instance.setCellMeta(r, c, 'source', persisted.source);
                          instance.setCellMeta(r, c, 'strict', false); // Allow typing custom values
                        }
                        if (persisted.type === 'numeric' && persisted.numericFormat) {
                          instance.setCellMeta(r, c, 'numericFormat', persisted.numericFormat);
                        }
                        if (persisted.type === 'date' && persisted.dateFormat) {
                          instance.setCellMeta(r, c, 'dateFormat', persisted.dateFormat);
                        }
                      } catch {}
                    }
                    const effectiveType = (persisted && persisted.type) ? persisted.type : meta.type;
                    
                    if (effectiveType === 'checkbox') {
                      checkboxRenderer(instance, td, r, c, prop, value, cellProperties);
                    } else {
                      textRenderer(instance, td, r, c, prop, value, cellProperties);
                      // If this is a date cell, display only the date portion
                      if (effectiveType === 'date') {
                        try {
                          const display = formatDateDisplay(value);
                          td.textContent = display;
                        } catch {}
                      }
                    }
                  } catch {
                    textRenderer(instance, td, r, c, prop, value, cellProperties);
                  }
                  
                  const fmt = cellFormats[cellKey];
                  const sty = cellStyles[cellKey];
                  
                  if (fmt?.className) {
                    td.className = '';
                    const classes = fmt.className.split(' ').filter(cls => cls.trim());
                    if (classes.length > 0) {
                      td.className = classes.join(' ');
                    }
                  }
                  
                  if (sty && Object.keys(sty).length > 0) {
                    const styleEntries = Object.entries(sty);
                    for (const [prop, val] of styleEntries) {
                      if (val != null) {
                        try {
                          td.style.setProperty(prop, String(val));
                        } catch {}
                      }
                    }
                  }
                  
                  return td;
                }
              };
              
              // Set cell type and properties if we have persisted metadata
              if (persisted) {
                cellConfig.type = persisted.type;
                if (persisted.type === 'dropdown' && persisted.source) {
                  cellConfig.source = persisted.source;
                  cellConfig.strict = false;
                }
                if (persisted.type === 'numeric' && persisted.numericFormat) {
                  cellConfig.numericFormat = persisted.numericFormat;
                }
                if (persisted.type === 'date' && persisted.dateFormat) {
                  cellConfig.dateFormat = persisted.dateFormat;
                }
              }
              
              return cellConfig;
            }}
            key="hot-table"
          />

        </div>
      </Box>


    </Box>
  );
};

export default CSVEditor;

