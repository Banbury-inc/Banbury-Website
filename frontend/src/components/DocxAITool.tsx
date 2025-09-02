import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface DocxOperationInsertText { type: 'insertText'; position: number; text: string }
interface DocxOperationReplaceText { type: 'replaceText'; startPosition: number; endPosition: number; text: string }
interface DocxOperationInsertParagraph { type: 'insertParagraph'; position: number; text: string; style?: string }
interface DocxOperationReplaceParagraph { type: 'replaceParagraph'; paragraphIndex: number; text: string; style?: string }
interface DocxOperationInsertHeading { type: 'insertHeading'; position: number; text: string; level: number }
interface DocxOperationReplaceHeading { type: 'replaceHeading'; headingIndex: number; text: string; level?: number }
interface DocxOperationInsertList { type: 'insertList'; position: number; items: string[]; listType: 'bulleted' | 'numbered' }
interface DocxOperationInsertTable { type: 'insertTable'; position: number; rows: string[][]; hasHeaders?: boolean }
interface DocxOperationFormatText { 
  type: 'formatText'; 
  startPosition: number; 
  endPosition: number; 
  formatting: { 
    bold?: boolean; 
    italic?: boolean; 
    underline?: boolean; 
    fontSize?: number; 
    color?: string 
  }
}
interface DocxOperationInsertImage { type: 'insertImage'; position: number; imageUrl: string; alt?: string; width?: number; height?: number }
interface DocxOperationSetPageSettings { 
  type: 'setPageSettings'; 
  margins?: { top: number; bottom: number; left: number; right: number }; 
  orientation?: 'portrait' | 'landscape' 
}

type DocxOperation =
  | DocxOperationInsertText
  | DocxOperationReplaceText
  | DocxOperationInsertParagraph
  | DocxOperationReplaceParagraph
  | DocxOperationInsertHeading
  | DocxOperationReplaceHeading
  | DocxOperationInsertList
  | DocxOperationInsertTable
  | DocxOperationFormatText
  | DocxOperationInsertImage
  | DocxOperationSetPageSettings;

interface DocxAIToolProps {
  args?: {
    action: string;
    documentName?: string;
    operations?: DocxOperation[];
    htmlContent?: string;
    note?: string;
  };
  action?: string;
  documentName?: string;
  operations?: DocxOperation[];
  htmlContent?: string;
  note?: string;
}

export const DocxAITool: React.FC<DocxAIToolProps> = (props) => {
  const { action, documentName, operations, htmlContent, note } = props.args || props;
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

  // Automatically apply changes when component mounts
  useEffect(() => {
    const hasContent = (htmlContent && htmlContent.trim().length > 0) || (operations && operations.length > 0);
    if (hasContent) {
      const payload = { action: action || 'Document edits', documentName, operations: operations || [], htmlContent, note };
      window.dispatchEvent(new CustomEvent('docx-ai-response', { detail: payload }));
      setApplied(true);
    }
  }, [action, documentName, operations, htmlContent, note]);

  const handleApply = () => {
    const payload = { action: action || 'Document edits', documentName, operations: operations || [], htmlContent, note };
    window.dispatchEvent(new CustomEvent('docx-ai-response', { detail: payload }));
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const hasContent = (htmlContent && htmlContent.trim().length > 0) || (operations && operations.length > 0);

  if (!hasContent) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>No document changes to apply</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl bg-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <CardTitle className="text-base">Document Changes</CardTitle>
            {documentName && <Badge variant="outline">Doc: {documentName}</Badge>}
          </div>
        </div>
        <CardDescription>
          {note ? note : 'Review the suggested document changes and apply them to the open document.'}
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

        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1" />
          
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide' : 'Preview'}
          </Button>
          
          {applied && (
            <Button variant="outline" size="sm" onClick={handleApply} className="text-blue-600 hover:text-blue-700">
              Reapply
            </Button>
          )}
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
            {htmlContent && (
              <div className="p-3 bg-muted rounded text-xs max-h-40 overflow-auto">
                <code className="whitespace-pre-wrap break-all">{htmlContent.slice(0, 2000)}{htmlContent.length > 2000 ? '…' : ''}</code>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocxAITool;
