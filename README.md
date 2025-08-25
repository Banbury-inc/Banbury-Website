# Banbury Website

# How to run the project

```bash
npm install
npm run start
```

# Integrations

- Gmail
- Google Calendar

# Features

- Web search
- Cloud based file storage
- Document Editor
- Spreadsheet Editor
- Read/Write Emails
- AI Memory
- AI Document editing
- AI Spreadsheet editing

# Agent Tools

The AI agent has access to a comprehensive set of tools for various tasks:

## Web & Information Tools

### Web Search
- **web_search**: Search the web and read page content for summaries
  - Uses Tavily API for high-quality results with fallback to DuckDuckGo
  - Enriches results by fetching and parsing page content
  - Returns structured results with titles, URLs, and snippets

### Date & Time
- **get_current_datetime**: Get current date and time information
  - Returns formatted date/time strings, timestamps, and individual components
  - Useful for scheduling, planning, and time-sensitive tasks

## Document & Content Tools

### Document Editor Integration
- **tiptap_ai**: Deliver AI-generated content to the Tiptap document editor
  - Supports actions: rewrite, correct, expand, translate, summarize, outline, insert
  - Formats responses for direct integration with the editor
  - Handles text selection and modification tracking

### Spreadsheet Editor Integration
- **sheet_ai**: Apply AI-driven spreadsheet operations
  - Cell operations: set individual cells or ranges
  - Row/column management: insert, delete rows and columns
  - Data transformations: cleaning, normalization, formula application
  - Full CSV content replacement option

## File Management Tools

### File Creation & Upload
- **create_file**: Create new files in the user's cloud workspace
  - Supports multiple file types: HTML, Markdown, CSV, JSON, plain text
  - Automatic content type detection and formatting
  - Markdown to HTML conversion with full formatting support
  - File path management with parent directory structure

### File Download
- **download_from_url**: Download files from URLs to cloud workspace
  - Automatic file type detection from MIME types
  - Custom file naming and path options
  - Integration with S3 storage backend

### File Search
- **search_files**: Search for files in cloud storage
  - Case-insensitive search by file name
  - Returns file metadata and location information

## Memory Management Tools

### Memory Storage
- **store_memory**: Store important information in user's memory
  - Integrated with Zep Cloud and Mem0 for persistent storage
  - Supports different data types and overflow strategies
  - Session-based memory organization

### Memory Search
- **search_memory**: Search through user's stored memories
  - Semantic search across previous conversations and interactions
  - Multiple search scopes: nodes (entities/concepts) and edges (relationships/facts)
  - Advanced reranking options for better relevance

## Email Tools (Gmail Integration)

### Email Reading
- **gmail_get_recent**: Get recent Gmail messages from inbox
  - Returns message metadata, content, and attachments
  - Automatic content truncation to prevent token limits
  - Configurable label filtering

- **gmail_search**: Search Gmail using Gmail search syntax
  - Supports queries like 'from:john@example.com', 'subject:meeting', 'is:unread'
  - Time-based filtering with 'after:' and 'before:' operators

- **gmail_get_message**: Get specific Gmail message by ID
  - Full message content retrieval
  - Thread context and attachment information

### Email Sending
- **gmail_send_message**: Send emails or create drafts
  - Support for CC and BCC recipients
  - HTML body content support
  - Draft creation option for review before sending

## Calendar Tools (Google Calendar Integration)

### Calendar Reading
- **calendar_list_events**: List calendar events with filtering
  - Time range filtering with RFC3339 timestamps
  - Query-based search within events
  - Pagination support for large result sets
  - Recurring event expansion options

- **calendar_get_event**: Get specific calendar event by ID
  - Full event details including attendees, location, and description

### Calendar Management
- **calendar_create_event**: Create new calendar events
  - Full Google Calendar API event payload support
  - Multi-calendar support with calendar ID specification

- **calendar_update_event**: Update existing calendar events
  - Partial event updates with flexible payload structure

- **calendar_delete_event**: Delete calendar events
  - Event removal with optional calendar specification

## Tool Preferences

The agent respects user tool preferences that can be configured to enable/disable specific integrations:
- Gmail access can be disabled via `toolPreferences.gmail`
- Calendar access can be disabled via `toolPreferences.calendar`

## Technical Features

- **LangGraph Integration**: Uses LangGraph for sophisticated multi-step reasoning
- **React Agent Pattern**: Implements React-style agent for tool-calling loops
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Token Management**: Automatic content truncation to prevent token limit issues
- **Authentication**: Secure token-based authentication for all API calls
- **Rate Limiting**: Built-in protection against API rate limits






