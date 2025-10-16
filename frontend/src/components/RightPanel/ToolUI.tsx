import React from 'react';
import { ToolCallCard } from './ToolCallCard';
import { SheetAITool } from '../SheetAITool';
import { DocxAITool } from '../DocxAITool';
import { WebSearchTool } from './composer/components/web-search-result';
import { TiptapAITool } from './composer/components/TiptapAITool';
import { TldrawAITool } from '../TldrawAITool';
import { DocumentAITool } from './composer/components/DocumentAITool';
import { BrowserTool } from '../MiddlePanel/BrowserViewer/BrowserTool';
import { ToolFallback } from './tool-fallback';

interface ToolUIProps {
  toolName: string;
  args: any;
  result?: any;
}

export const ToolUI: React.FC<ToolUIProps> = ({ toolName, args, result }) => {
  // Map tool names to their respective UI components
  switch (toolName) {
    case 'sheet_ai':
      return <SheetAITool args={args} />;
    
    case 'docx_ai':
      return <DocxAITool args={args} />;
    
    case 'tldraw_ai':
      return <TldrawAITool args={args} />;
    
    case 'web_search':
      return <WebSearchTool args={args} result={result} />;
    
    case 'tiptap_ai':
      return <TiptapAITool args={args} />;
    
    case 'document_ai':
      return <DocumentAITool args={args} />;
    
    case 'stagehand_create_session':
    case 'stagehand_goto':
    case 'stagehand_observe':
    case 'stagehand_act':
    case 'stagehand_extract':
    case 'stagehand_close':
      return <BrowserTool toolName={toolName} args={args} result={result} />;
    
    // Gmail tools
    case 'gmail_get_recent':
    case 'gmail_search':
    case 'gmail_get_message':
    case 'gmail_send_message':
      return (
        <ToolCallCard
          toolName={toolName}
          argsText={JSON.stringify(args)}
          result={result}
          label={getToolLabel(toolName)}
        />
      );
    
    // Calendar tools
    case 'calendar_list_events':
    case 'calendar_get_event':
    case 'calendar_create_event':
    case 'calendar_update_event':
    case 'calendar_delete_event':
      return (
        <ToolCallCard
          toolName={toolName}
          argsText={JSON.stringify(args)}
          result={result}
          label={getToolLabel(toolName)}
        />
      );
    
    // X (Twitter) API tools
    case 'x_api_get_user_info':
    case 'x_api_get_user_tweets':
    case 'x_api_search_tweets':
    case 'x_api_get_trending_topics':
    case 'x_api_post_tweet':
      return (
        <ToolCallCard
          toolName={toolName}
          argsText={JSON.stringify(args)}
          result={result}
          label={getToolLabel(toolName)}
        />
      );
    
    // Memory tools
    case 'store_memory':
    case 'search_memory':
      return (
        <ToolCallCard
          toolName={toolName}
          argsText={JSON.stringify(args)}
          result={result}
          label={getToolLabel(toolName)}
        />
      );
    
    // File tools
    case 'create_file':
    case 'download_from_url':
    case 'search_files':
      return (
        <ToolCallCard
          toolName={toolName}
          argsText={JSON.stringify(args)}
          result={result}
          label={getToolLabel(toolName)}
        />
      );
    
    // Image generation
    case 'generate_image':
      return (
        <ToolCallCard
          toolName={toolName}
          argsText={JSON.stringify(args)}
          result={result}
          label={getToolLabel(toolName)}
        />
      );
    
    // DateTime tool
    case 'get_current_datetime':
      return (
        <ToolCallCard
          toolName={toolName}
          argsText={JSON.stringify(args)}
          result={result}
          label={getToolLabel(toolName)}
        />
      );
    
    default:
      return <ToolFallback toolName={toolName} args={args} result={result} />;
  }
};

function getToolLabel(toolName: string): string {
  const labels: Record<string, string> = {
    'sheet_ai': 'AI Spreadsheet',
    'docx_ai': 'AI Document',
    'tldraw_ai': 'AI Canvas',
    'web_search': 'Web Search',
    'tiptap_ai': 'AI Text Editor',
    'document_ai': 'AI Document',
    'gmail_get_recent': 'Gmail - Get Recent',
    'gmail_search': 'Gmail - Search',
    'gmail_get_message': 'Gmail - Get Message',
    'gmail_send_message': 'Gmail - Send',
    'calendar_list_events': 'Calendar - List Events',
    'calendar_get_event': 'Calendar - Get Event',
    'calendar_create_event': 'Calendar - Create Event',
    'calendar_update_event': 'Calendar - Update Event',
    'calendar_delete_event': 'Calendar - Delete Event',
    'x_api_get_user_info': 'X - Get User Info',
    'x_api_get_user_tweets': 'X - Get Tweets',
    'x_api_search_tweets': 'X - Search Tweets',
    'x_api_get_trending_topics': 'X - Trending Topics',
    'x_api_post_tweet': 'X - Post Tweet',
    'store_memory': 'Store Memory',
    'search_memory': 'Search Memory',
    'create_file': 'Create File',
    'download_from_url': 'Download File',
    'search_files': 'Search Files',
    'generate_image': 'Generate Image',
    'get_current_datetime': 'Get Date/Time',
    'stagehand_create_session': 'Browser - Create Session',
    'stagehand_goto': 'Browser - Navigate',
    'stagehand_observe': 'Browser - Observe',
    'stagehand_act': 'Browser - Act',
    'stagehand_extract': 'Browser - Extract',
    'stagehand_close': 'Browser - Close',
  };

  return labels[toolName] || toolName;
}

export default ToolUI;
