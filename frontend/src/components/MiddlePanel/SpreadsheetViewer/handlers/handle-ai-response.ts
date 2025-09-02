import { parseCSV } from '../utils/csv-parser';

interface AiResponseHandlerParams {
  hotTableRef: React.RefObject<any>;
  setData: (data: any[][]) => void;
  onContentChange?: (data: any[][]) => void;
  setHasChanges: (hasChanges: boolean) => void;
}

interface AiOperation {
  type: 'setCell' | 'setRange' | 'insertRows' | 'deleteRows' | 'insertCols' | 'deleteCols';
  row?: number;
  col?: number;
  value?: string | number;
  range?: { startRow: number; startCol: number; endRow: number; endCol: number };
  values?: (string | number)[][];
  index?: number;
  count?: number;
}

interface AiResponseDetail {
  operations?: AiOperation[];
  csvContent?: string;
}

function createAiResponseHandler({
  hotTableRef,
  setData,
  onContentChange,
  setHasChanges
}: AiResponseHandlerParams) {
  return (event: any) => {
    const detail = event?.detail || {} as AiResponseDetail;
    const { operations, csvContent } = detail;

    const hot = hotTableRef.current?.hotInstance;
    if (!hot) return;

    try {
      if (csvContent && csvContent.trim().length > 0) {
        // Replace entire data with provided CSV
        const parsed = parseCSV(csvContent);
        hot.loadData(parsed);
        setData(parsed);
        onContentChange?.(parsed);
        setHasChanges(true);
        return;
      }

      if (operations && operations.length > 0) {
        // Get current data and apply operations to it
        let currentData = hot.getData();
        
        // Apply operations to the data array directly
        operations.forEach((op) => {
          switch (op.type) {
            case 'setCell': {
              const { row, col, value } = op;
              if (row !== undefined && col !== undefined && row >= 0 && col >= 0) {
                // Ensure the data array is large enough
                while (currentData.length <= row) {
                  currentData.push([]);
                }
                while (currentData[row].length <= col) {
                  currentData[row].push('');
                }
                currentData[row][col] = value;
              }
              break;
            }
            case 'setRange': {
              const { range, values } = op;
              if (range && values) {
                const { startRow, startCol, endRow, endCol } = range;
                let r = 0;
                for (let i = startRow; i <= endRow; i++) {
                  let c = 0;
                  for (let j = startCol; j <= endCol; j++) {
                    const v = values?.[r]?.[c];
                    if (v !== undefined) {
                      // Ensure the data array is large enough
                      while (currentData.length <= i) {
                        currentData.push([]);
                      }
                      while (currentData[i].length <= j) {
                        currentData[i].push('');
                      }
                      currentData[i][j] = v;
                    }
                    c++;
                  }
                  r++;
                }
              }
              break;
            }
            case 'insertRows': {
              const { index, count = 1 } = op;
              if (index !== undefined) {
                for (let i = 0; i < count; i++) {
                  currentData.splice(index, 0, []);
                }
              }
              break;
            }
            case 'deleteRows': {
              const { index, count = 1 } = op;
              if (index !== undefined) {
                currentData.splice(index, count);
              }
              break;
            }
            case 'insertCols': {
              const { index, count = 1 } = op;
              if (index !== undefined) {
                currentData.forEach(row => {
                  for (let i = 0; i < count; i++) {
                    row.splice(index, 0, '');
                  }
                });
              }
              break;
            }
            case 'deleteCols': {
              const { index, count = 1 } = op;
              if (index !== undefined) {
                currentData.forEach(row => {
                  row.splice(index, count);
                });
              }
              break;
            }
            default:
              break;
          }
        });

        // Use loadData to avoid triggering afterChange with 'edit' source
        hot.loadData(currentData);
        setData(currentData);
        onContentChange?.(currentData);
        setHasChanges(true);
      }
    } catch {
      // Fail silently to avoid breaking user session
    }
  };
}

export { createAiResponseHandler };
export type { AiResponseHandlerParams, AiOperation, AiResponseDetail };
