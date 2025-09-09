import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckIcon, ArrowRightIcon, PaintbrushIcon } from 'lucide-react';

interface TldrawAIToolProps {
  args: {
    action: string;
    canvasName?: string;
    operations?: Array<{
      type: string;
      [key: string]: any;
    }>;
    canvasData?: any;
    note?: string;
  };
}

export function TldrawAITool({ args }: TldrawAIToolProps) {
  const [applied, setApplied] = useState(false);

  // Auto-apply changes when component mounts
  useEffect(() => {
    const applyChanges = () => {
      // Dispatch a custom event to apply the tldraw operations
      const event = new CustomEvent('tldraw-ai-response', {
        detail: {
          action: args.action,
          canvasName: args.canvasName,
          operations: args.operations,
          canvasData: args.canvasData,
          note: args.note,
        }
      });
      
      window.dispatchEvent(event);
      setApplied(true);
    };

    // Delay the apply to avoid state updates during render
    const timer = setTimeout(applyChanges, 100);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  const handleApplyToCanvas = () => {
    // Dispatch a custom event to apply the tldraw operations
    const event = new CustomEvent('tldraw-ai-response', {
      detail: {
        action: args.action,
        canvasName: args.canvasName,
        operations: args.operations,
        canvasData: args.canvasData,
        note: args.note,
      }
    });
    
    window.dispatchEvent(event);
    setApplied(true);
    
    // Reset applied state after 2 seconds
    setTimeout(() => setApplied(false), 2000);
  };

  const getOperationSummary = () => {
    if (!args.operations || args.operations.length === 0) {
      return 'Canvas operations';
    }
    
    const operationCounts = args.operations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const summaryParts = Object.entries(operationCounts).map(([type, count]) => {
      const operationName = type.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
      return count > 1 ? `${count} ${operationName}s` : `${operationName}`;
    });
    
    return summaryParts.join(', ');
  };

  return (
    <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/20 dark:to-zinc-800/20 border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
          <PaintbrushIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Canvas Operations
            </h3>
            {args.canvasName && (
              <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                {args.canvasName}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {args.action}
          </p>
          
          {args.operations && args.operations.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Operations: {getOperationSummary()}
              </p>
              
              <div className="space-y-1">
                {args.operations.slice(0, 3).map((operation, index) => (
                  <div key={index} className="text-xs bg-white/50 dark:bg-black/20 rounded px-2 py-1">
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      {operation.type}
                    </span>
                    {operation.shapeType && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        ({operation.shapeType})
                      </span>
                    )}
                    {operation.text && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        "{operation.text.length > 30 ? operation.text.substring(0, 30) + '...' : operation.text}"
                      </span>
                    )}
                  </div>
                ))}
                {args.operations.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    +{args.operations.length - 3} more operations
                  </div>
                )}
              </div>
            </div>
          )}
          
          {args.note && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
              {args.note}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
              ${applied 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300'
              }
            `}>
              <CheckIcon className="h-3 w-3" />
              {applied ? 'Applied Automatically' : 'Applying...'}
            </div>
            
            <Button
              onClick={handleApplyToCanvas}
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
            >
              Re-apply
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
