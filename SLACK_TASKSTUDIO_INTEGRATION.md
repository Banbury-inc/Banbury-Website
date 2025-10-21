# Slack to TaskStudio Integration

This integration allows users to create TaskStudio tasks directly from Slack messages by mentioning the Banbury bot.

## Quick Start

### For Users

Simply mention @banbury in Slack with task-related keywords:

```
@banbury create task "Review quarterly reports" tomorrow at 2pm #urgent
@banbury todo: Update customer database by next week
@banbury remind me to "Send invoice" in 3 days
```

### Supported Commands

- **Basic task**: `@banbury create task "Task title"`
- **With description**: `@banbury new task: Title \n Description here`
- **With deadline**: `@banbury todo "Task" tomorrow/next week/in X days`
- **With time**: `@banbury task "Meeting prep" at 9:30am`
- **With priority**: `@banbury urgent task "Fix bug"`
- **With tags**: `@banbury create task "Review" #finance #quarterly`

## Task Parsing Features

### Priority Detection
- **Urgent**: "urgent", "asap", "immediately"
- **High**: "high priority", "important"
- **Low**: "low priority", "whenever"
- **Default**: Medium

### Date/Time Parsing
- **Relative dates**: "tomorrow", "next week", "in 5 days"
- **Specific times**: "at 2pm", "at 14:30", "at 9:00am"
- **Default**: Current date/time if not specified

### Automatic Tagging
- Hashtags in message become task tags
- Auto-adds: `#slack`, `#channel:{channel_name}`
- Preserves thread context

## Example Responses

### Success Response
```
✅ Task created successfully!

*Title:* Review quarterly reports
*Scheduled:* Thu, Dec 21 at 2:00 PM
*Priority:* urgent
*Status:* scheduled

View in TaskStudio: https://banbury.io/task-studio
```

### Error Response
```
❌ Failed to create task

Error: Task title is required

Please try again or contact support if the issue persists.
```

## Technical Implementation

### Frontend Components

1. **Task Parser** (`/frontend/src/components/handlers/slack-task-integration.ts`)
   - `shouldCreateTask()`: Detects task creation intent
   - `parseTaskFromMessage()`: Extracts task details
   - `formatTaskResponse()`: Formats success messages
   - `formatErrorResponse()`: Formats error messages

2. **API Integration**
   - Uses existing TaskStudio API endpoints
   - Maintains user authentication context
   - Preserves Slack metadata for traceability

### Backend Requirements

1. **Slack Event Handler**
   ```python
   # Check if message should create task
   if should_create_task(message):
       task_data = parse_task_from_message(message)
       task = create_task_via_api(task_data)
       send_slack_response(format_task_response(task))
   ```

2. **Database Schema**
   - Link Slack users to Banbury accounts
   - Store user auth tokens for API calls
   - Track task origin (Slack metadata)

### Task Data Structure

```typescript
{
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  scheduledDate: Date,
  estimatedDuration: number, // minutes
  tags: string[],
  assignedTo: string, // Slack username
  // Slack metadata
  source: 'slack',
  slackMetadata: {
    channel_id: string,
    user_id: string,
    username: string,
    thread_ts?: string,
    team_id: string
  }
}
```

## Advanced Features

### Slash Commands
```
/task Review documents
/task-urgent Fix production bug
/task-schedule Weekly standup every Monday at 9am
```

### Interactive Dialogs
- Modal forms for detailed task creation
- Dropdown menus for priority/assignee selection
- Date/time pickers for precise scheduling

### Task Updates from Slack
```
@banbury mark task "Review documents" as complete
@banbury update task priority to high for "Fix bug"
@banbury list my tasks for today
```

## Best Practices

1. **Clear Task Titles**: Use quotes for multi-word titles
2. **Specific Deadlines**: Include date and time when possible
3. **Relevant Tags**: Use hashtags for categorization
4. **Thread Context**: Create tasks in relevant threads

## Troubleshooting

### Common Issues

1. **"Failed to create task"**
   - Ensure you're connected to Slack in Settings
   - Check that task has a title
   - Verify date/time format

2. **Task not appearing in TaskStudio**
   - Refresh TaskStudio page
   - Check task filters/status
   - Verify Slack connection status

3. **Wrong date/time**
   - Specify timezone if needed
   - Use explicit formats: "December 21 at 2pm EST"
   - Check workspace timezone settings

## Future Enhancements

1. **Recurring Tasks**: Create daily/weekly/monthly tasks
2. **Task Templates**: Save and reuse common task formats
3. **Bulk Operations**: Create multiple tasks at once
4. **Smart Suggestions**: AI-powered task recommendations
5. **Progress Updates**: Get task status updates in Slack
6. **Team Assignment**: Assign tasks via @mentions
7. **File Attachments**: Add documents from Slack to tasks

## See Also

- [Slack Integration Setup](./SLACK_INTEGRATION_SETUP.md)
- [TaskStudio Documentation](./frontend/src/pages/TaskStudio/README.md)
- [API Documentation](./API_DOCUMENTATION.md)