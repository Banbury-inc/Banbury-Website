import { Table, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SheetOperationSetCell { type: 'setCell'; row: number; col: number; value: string | number }
interface SheetOperationSetRange { type: 'setRange'; range: { startRow: number; startCol: number; endRow: number; endCol: number }; values: (string | number)[][] }
interface SheetOperationInsertRows { type: 'insertRows'; index: number; count?: number }
interface SheetOperationDeleteRows { type: 'deleteRows'; index: number; count?: number }
interface SheetOperationInsertCols { type: 'insertCols'; index: number; count?: number }
interface SheetOperationDeleteCols { type: 'deleteCols'; index: number; count?: number }

type SheetOperation =
  | SheetOperationSetCell
  | SheetOperationSetRange
  | SheetOperationInsertRows
  | SheetOperationDeleteRows
  | SheetOperationInsertCols
  | SheetOperationDeleteCols;

interface SheetAIToolProps {
  args?: {
    action: string;
    sheetName?: string;
    operations?: SheetOperation[];
    csvContent?: string;
    note?: string;
  };
  action?: string;
  sheetName?: string;
  operations?: SheetOperation[];
  csvContent?: string;
  note?: string;
}

export const SheetAITool: React.FC<SheetAIToolProps> = (props) => {
  const { action, sheetName, operations, csvContent, note } = props.args || props;
  const [applied, setApplied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const opSummary = useMemo(() => {
    const ops = operations || [];
    const counts: Record<string, number> = {};
    for (const op of ops) {
      counts[op.type] = (counts[op.type] || 0) + 1;
    }
    return counts;
  }, [operations]);

  const handleApply = () => {
    const payload = { action: action || 'Spreadsheet edits', sheetName, operations: operations || [], csvContent, note };
    window.dispatchEvent(new CustomEvent('sheet-ai-response', { detail: payload }));
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const hasContent = (csvContent && csvContent.trim().length > 0) || (operations && operations.length > 0);

  if (!hasContent) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>No spreadsheet changes to apply</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <CardTitle className="text-base">AI Spreadsheet Suggestion</CardTitle>
            <Badge variant="default">{action || 'Edits'}</Badge>
            {sheetName && <Badge variant="outline">Sheet: {sheetName}</Badge>}
          </div>
          {applied && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Applied!</span>
            </div>
          )}
        </div>
        <CardDescription>
          {note ? note : 'Review the suggested spreadsheet changes and apply them to the open sheet.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {operations && operations.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Operations: {operations.length}
            <div className="mt-1 flex flex-wrap gap-2">
              {Object.entries(opSummary).map(([k, v]) => (
                <Badge key={k} variant="secondary">{k}: {v}</Badge>
              ))}
            </div>
          </div>
        )}

        {csvContent && (
          <div className="text-xs text-muted-foreground">
            CSV replacement provided ({csvContent.length.toLocaleString()} chars)
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleApply} disabled={applied} className="flex items-center gap-2">
            {applied ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Applied
              </>
            ) : (
              <>
                <Table className="h-4 w-4" />
                Apply to Spreadsheet
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide' : 'Preview'}
          </Button>
        </div>

        {showPreview && (
          <div className="mt-2 space-y-2">
            {operations && operations.length > 0 && (
              <div className="p-3 bg-muted rounded text-xs">
                {operations.slice(0, 10).map((op, idx) => (
                  <div key={idx} className="break-words">{JSON.stringify(op)}</div>
                ))}
                {operations.length > 10 && <div className="opacity-70">…{operations.length - 10} more</div>}
              </div>
            )}
            {csvContent && (
              <div className="p-3 bg-muted rounded text-xs max-h-40 overflow-auto">
                <code className="whitespace-pre-wrap break-all">{csvContent.slice(0, 2000)}{csvContent.length > 2000 ? '…' : ''}</code>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SheetAITool;


