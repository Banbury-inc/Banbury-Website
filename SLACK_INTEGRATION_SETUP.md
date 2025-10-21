# Slack Integration Setup for Banbury

This document provides comprehensive instructions for setting up Slack integration with Banbury workspaces, enabling AI agent interaction through Slack similar to Cursor and Devin AI.

## Overview

The Slack integration allows users to:
- Connect their Slack workspace to Banbury
- Interact with an AI agent via Slack messages
- Mention @banbury in channels or send direct messages
- Receive AI-powered responses and assistance

## Frontend Implementation ✅

The frontend UI has been implemented with:

1. **SlackConnection Component** (`/frontend/src/components/modals/settings-tabs/SlackConnection.tsx`)
   - OAuth connection flow
   - Connection status display
   - Workspace information
   - Test connection functionality
   - Disconnect option

2. **Slack API Handlers** (`/frontend/src/components/handlers/slack-api-connection.ts`)
   - `checkSlackConnectionStatus()` - Check if workspace is connected
   - `initiateSlackOAuth()` - Start OAuth flow
   - `disconnectSlackWorkspace()` - Remove workspace connection
   - `getSlackChannels()` - List available channels
   - `testSlackConnection()` - Test the connection

3. **UI Integration**
   - Added to Settings page connections tab
   - Added to Settings modal connections tab
   - OAuth callback handling for success/failure

## Backend Implementation Requirements

### 1. Slack App Configuration

Create a new Slack app at https://api.slack.com/apps:

```yaml
App Name: Banbury AI Assistant
Description: AI-powered assistant for Banbury workspaces

OAuth & Permissions:
  Bot Token Scopes:
    - app_mentions:read      # Read messages that mention the bot
    - channels:history       # View messages in public channels
    - channels:read         # View basic channel info
    - chat:write           # Send messages
    - groups:history       # View messages in private channels
    - groups:read          # View basic private channel info
    - im:history           # View direct messages
    - im:read              # View basic DM info
    - im:write             # Send direct messages
    - users:read           # View user info
    - users:read.email     # View user email addresses

  User Token Scopes (optional):
    - channels:read
    - groups:read
    - im:read
    - users:read

Event Subscriptions:
  Request URL: https://api.dev.banbury.io/slack/events/
  Subscribe to Bot Events:
    - app_mention          # When someone mentions @banbury
    - message.channels     # Messages in public channels
    - message.groups       # Messages in private channels
    - message.im          # Direct messages
    - member_joined_channel # When bot joins a channel

Interactivity & Shortcuts:
  Request URL: https://api.dev.banbury.io/slack/interactive/
  
Slash Commands (optional):
  /banbury - Interact with Banbury AI
  Request URL: https://api.dev.banbury.io/slack/commands/
```

### 2. Environment Variables

Add to backend `.env`:

```bash
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_REDIRECT_URI=https://api.dev.banbury.io/slack/oauth/callback/
```

### 3. Database Schema

```sql
-- Slack workspace connections
CREATE TABLE slack_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id VARCHAR(255) NOT NULL,
    team_name VARCHAR(255),
    bot_user_id VARCHAR(255) NOT NULL,
    bot_access_token TEXT NOT NULL,
    user_access_token TEXT,
    scope TEXT,
    authed_user JSONB,
    incoming_webhook JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, team_id)
);

-- Slack conversation threads
CREATE TABLE slack_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slack_connection_id UUID REFERENCES slack_connections(id) ON DELETE CASCADE,
    channel_id VARCHAR(255) NOT NULL,
    thread_ts VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    conversation_history JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_channel_thread (channel_id, thread_ts)
);
```

### 4. API Endpoints

```python
# Django/Flask example endpoints

# OAuth endpoints
POST   /slack/initiate-oauth/      # Start OAuth flow
GET    /slack/oauth/callback/      # OAuth callback handler

# Connection management
GET    /slack/connection-status/   # Check connection status
POST   /slack/disconnect/          # Disconnect workspace
POST   /slack/test-connection/     # Test the connection
GET    /slack/channels/            # List channels

# Event handling
POST   /slack/events/             # Slack Events API webhook
POST   /slack/interactive/       # Interactive components
POST   /slack/commands/           # Slash commands
```

### 5. OAuth Flow Implementation

```python
from slack_sdk import WebClient
from slack_sdk.oauth import AuthorizeUrlGenerator, RedirectUriPageRenderer
from slack_sdk.oauth.state_store import FileOAuthStateStore
import os

class SlackOAuthHandler:
    def __init__(self):
        self.client_id = os.environ["SLACK_CLIENT_ID"]
        self.client_secret = os.environ["SLACK_CLIENT_SECRET"]
        self.redirect_uri = os.environ["SLACK_REDIRECT_URI"]
        self.scopes = ["app_mentions:read", "channels:history", "chat:write", ...]
        
    def initiate_oauth(self, user_id):
        state_store = FileOAuthStateStore(expiration_seconds=600)
        state = state_store.issue()
        
        authorize_url_generator = AuthorizeUrlGenerator(
            client_id=self.client_id,
            scopes=self.scopes,
            redirect_uri=self.redirect_uri,
        )
        
        auth_url = authorize_url_generator.generate(state)
        
        # Store state with user_id for callback
        cache.set(f"slack_oauth_state:{state}", user_id, timeout=600)
        
        return {"auth_url": auth_url}
    
    def handle_callback(self, code, state):
        # Verify state and get user_id
        user_id = cache.get(f"slack_oauth_state:{state}")
        if not user_id:
            raise ValueError("Invalid OAuth state")
        
        # Exchange code for token
        client = WebClient()
        response = client.oauth_v2_access(
            client_id=self.client_id,
            client_secret=self.client_secret,
            code=code,
            redirect_uri=self.redirect_uri
        )
        
        # Save connection to database
        slack_connection = SlackConnection.objects.create(
            user_id=user_id,
            team_id=response["team"]["id"],
            team_name=response["team"]["name"],
            bot_user_id=response["bot_user_id"],
            bot_access_token=response["access_token"],
            scope=response["scope"],
            authed_user=response.get("authed_user", {})
        )
        
        # Redirect to frontend with success
        return redirect(f"{FRONTEND_URL}/settings?slack_connected=true")
```

### 6. Event Handling & AI Integration

```python
from slack_sdk import WebClient
from slack_sdk.signature import SignatureVerifier
import json

class SlackEventHandler:
    def __init__(self):
        self.signature_verifier = SignatureVerifier(
            signing_secret=os.environ["SLACK_SIGNING_SECRET"]
        )
        
    def verify_request(self, request):
        return self.signature_verifier.is_valid_request(
            request.body,
            request.headers
        )
    
    async def handle_event(self, request):
        if not self.verify_request(request):
            return {"error": "Invalid request signature"}, 401
        
        body = json.loads(request.body)
        
        # Handle URL verification challenge
        if body.get("type") == "url_verification":
            return {"challenge": body["challenge"]}
        
        # Handle events
        event = body.get("event", {})
        event_type = event.get("type")
        
        if event_type == "app_mention":
            await self.handle_mention(event)
        elif event_type == "message":
            await self.handle_message(event)
            
        return {"ok": True}
    
    async def handle_mention(self, event):
        """Handle @banbury mentions"""
        team_id = event["team"]
        channel_id = event["channel"]
        user_id = event["user"]
        text = event["text"]
        thread_ts = event.get("thread_ts", event["ts"])
        
        # Get Slack connection
        connection = SlackConnection.objects.get(team_id=team_id)
        client = WebClient(token=connection.bot_access_token)
        
        # Remove bot mention from text
        cleaned_text = text.replace(f"<@{connection.bot_user_id}>", "").strip()
        
        # Check if this is a task creation request
        if self.should_create_task(cleaned_text):
            # Create a task in TaskStudio
            task = await self.create_task_from_message(
                message=cleaned_text,
                connection=connection,
                channel_id=channel_id,
                user_id=user_id,
                thread_ts=thread_ts
            )
            
            if task:
                response_text = f"✅ Task created: *{task['title']}*\n" \
                              f"Scheduled for: {task['scheduledDate']}\n" \
                              f"Status: {task['status']}\n" \
                              f"View in TaskStudio: {FRONTEND_URL}/task-studio"
            else:
                response_text = "❌ Failed to create task. Please try again."
        else:
            # Get AI response
            ai_response = await self.get_ai_response(
                user_query=cleaned_text,
                connection=connection,
                channel_id=channel_id,
                user_id=user_id
            )
            response_text = ai_response
        
        # Send response to Slack
        client.chat_postMessage(
            channel=channel_id,
            text=response_text,
            thread_ts=thread_ts
        )
    
    async def get_ai_response(self, user_query, connection, channel_id, user_id):
        """Integrate with your AI agent"""
        # Get or create conversation context
        conversation = SlackConversation.objects.get_or_create(
            slack_connection=connection,
            channel_id=channel_id,
            user_id=user_id
        )
        
        # Get conversation history
        history = conversation.conversation_history or []
        
        # Call your AI service (similar to how you handle chat in the app)
        # This should integrate with your existing LangGraph/AI infrastructure
        ai_service = YourAIService()
        response = await ai_service.get_response(
            query=user_query,
            context=history,
            user_id=connection.user_id
        )
        
        # Update conversation history
        history.append({"role": "user", "content": user_query})
        history.append({"role": "assistant", "content": response})
        conversation.conversation_history = history
        conversation.save()
        
        return response
    
    def should_create_task(self, message):
        """Determine if a message should create a task"""
        # Keywords that indicate task creation
        task_keywords = [
            'create task', 'new task', 'add task', 'make task',
            'schedule task', 'todo', 'to do', 'to-do',
            'remind me', 'reminder', 'schedule this',
            'task:', '/task'
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in task_keywords)
    
    async def create_task_from_message(self, message, connection, channel_id, user_id, thread_ts):
        """Create a task in TaskStudio from a Slack message"""
        try:
            # Parse task details from message
            task_data = self.parse_task_from_message(message)
            
            # Get Slack user info for better task attribution
            slack_client = WebClient(token=connection.bot_access_token)
            user_info = slack_client.users_info(user=user_id)
            slack_username = user_info['user']['real_name'] or user_info['user']['name']
            
            # Add metadata about Slack origin
            task_data['tags'] = task_data.get('tags', [])
            task_data['tags'].extend(['slack', f'channel:{channel_id}'])
            task_data['assignedTo'] = slack_username
            
            # Add Slack context to description
            slack_context = f"\n\n---\nCreated from Slack by {slack_username}"
            if thread_ts != event.get("ts"):
                slack_context += f" in thread"
            task_data['description'] = task_data.get('description', '') + slack_context
            
            # Create task via TaskStudio API
            headers = {
                'Authorization': f'Bearer {self.get_user_token(connection.user_id)}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/tasks/taskstudio/create/",
                json=task_data,
                headers=headers
            )
            
            if response.status_code == 200:
                return response.json().get('task')
            else:
                logger.error(f"Failed to create task: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating task from Slack: {e}")
            return None
    
    def parse_task_from_message(self, message):
        """Parse task details from a Slack message"""
        import re
        from datetime import datetime, timedelta
        
        # Default task data
        task_data = {
            'title': '',
            'description': message,
            'priority': 'medium',
            'scheduledDate': datetime.now().isoformat(),
            'estimatedDuration': 60,  # Default 60 minutes
            'tags': []
        }
        
        # Extract title - look for quotes or use first line
        title_match = re.search(r'"([^"]+)"', message)
        if title_match:
            task_data['title'] = title_match.group(1)
            task_data['description'] = message.replace(f'"{title_match.group(1)}"', '').strip()
        else:
            # Use first line as title, rest as description
            lines = message.strip().split('\n')
            task_data['title'] = lines[0].replace('create task', '').replace('new task', '').strip()[:100]
            if len(lines) > 1:
                task_data['description'] = '\n'.join(lines[1:])
        
        # Extract priority
        if any(word in message.lower() for word in ['urgent', 'asap', 'immediately']):
            task_data['priority'] = 'urgent'
        elif any(word in message.lower() for word in ['high priority', 'important']):
            task_data['priority'] = 'high'
        elif any(word in message.lower() for word in ['low priority', 'whenever']):
            task_data['priority'] = 'low'
        
        # Extract scheduled date
        scheduled_date = datetime.now()
        
        # Look for specific date patterns
        tomorrow_match = re.search(r'\b(tomorrow)\b', message.lower())
        if tomorrow_match:
            scheduled_date = datetime.now() + timedelta(days=1)
        
        next_week_match = re.search(r'\b(next week)\b', message.lower())
        if next_week_match:
            scheduled_date = datetime.now() + timedelta(days=7)
        
        # Look for relative days
        days_match = re.search(r'in (\d+) days?', message.lower())
        if days_match:
            days = int(days_match.group(1))
            scheduled_date = datetime.now() + timedelta(days=days)
        
        # Look for specific times
        time_match = re.search(r'at (\d{1,2}):?(\d{2})?\s*(am|pm)?', message.lower())
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2) or 0)
            am_pm = time_match.group(3)
            
            if am_pm == 'pm' and hour < 12:
                hour += 12
            elif am_pm == 'am' and hour == 12:
                hour = 0
            
            scheduled_date = scheduled_date.replace(hour=hour, minute=minute)
        
        task_data['scheduledDate'] = scheduled_date.isoformat()
        
        # Extract duration
        duration_match = re.search(r'(\d+)\s*(hours?|hrs?|minutes?|mins?)', message.lower())
        if duration_match:
            amount = int(duration_match.group(1))
            unit = duration_match.group(2)
            if 'hour' in unit or 'hr' in unit:
                task_data['estimatedDuration'] = amount * 60
            else:
                task_data['estimatedDuration'] = amount
        
        # Extract tags
        tag_matches = re.findall(r'#(\w+)', message)
        if tag_matches:
            task_data['tags'].extend(tag_matches)
        
        # Ensure we have a title
        if not task_data['title']:
            task_data['title'] = f"Task from Slack - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        return task_data
```

### 7. Security Considerations

1. **Request Verification**: Always verify Slack requests using signing secret
2. **Token Storage**: Encrypt bot tokens in database
3. **Scope Limitations**: Request only necessary OAuth scopes
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Error Handling**: Don't expose internal errors to Slack

### 8. Testing

1. **Local Development**: Use ngrok for local webhook testing
   ```bash
   ngrok http 8080
   # Update Slack app URLs with ngrok URL
   ```

2. **Test Cases**:
   - OAuth flow completion
   - Mention handling in channels
   - Direct message conversations
   - Thread continuity
   - Multi-workspace support
   - Error scenarios

## Deployment Checklist

- [ ] Create Slack app and configure OAuth & permissions
- [ ] Set up environment variables on backend
- [ ] Create database tables for Slack connections
- [ ] Implement OAuth flow endpoints
- [ ] Implement event handling endpoints
- [ ] Connect to AI agent service
- [ ] Test with a development Slack workspace
- [ ] Update production URLs in Slack app config
- [ ] Deploy to production

## TaskStudio Integration

The Slack integration automatically creates tasks in TaskStudio when users request it. This allows teams to manage their workflows directly from Slack conversations.

### How Task Creation Works

1. **Task Detection**: Messages containing keywords like "create task", "new task", "todo", etc. trigger task creation
2. **Automatic Parsing**: The system extracts task details from the message:
   - Title (from quotes or first line)
   - Description (full message content)
   - Priority (urgent, high, medium, low)
   - Scheduled date (tomorrow, next week, in X days)
   - Duration (X hours/minutes)
   - Tags (from #hashtags)

### Example Slack Commands

```
@banbury create task "Review Q4 reports" tomorrow at 2pm #finance #urgent
@banbury new task: Update customer database
Description: Need to clean up duplicate entries
Priority: high
Due: in 3 days

@banbury todo "Team standup preparation" at 9am #daily #meeting

@banbury remind me to "Send invoice to client" next week
```

### Task Creation Response

When a task is created, Banbury responds with:
- ✅ Confirmation message
- Task title and scheduled date
- Direct link to TaskStudio
- Task status

### Backend Implementation for Task Creation

```python
# Add this to your Slack event handler

def get_user_token(self, user_id):
    """Get the user's auth token for API calls"""
    # Retrieve the user's Banbury auth token from your database
    # This should be linked when they connect Slack
    user = User.objects.get(id=user_id)
    return user.auth_token

# Database extension for user tokens
ALTER TABLE slack_connections ADD COLUMN user_auth_token TEXT;
```

### Slack Command Examples

You can also add slash commands for quick task creation:

```python
@app.route('/slack/commands/', methods=['POST'])
def handle_slash_command():
    command = request.form.get('command')
    text = request.form.get('text')
    user_id = request.form.get('user_id')
    channel_id = request.form.get('channel_id')
    user_name = request.form.get('user_name')
    
    if command == '/task':
        # Quick task creation
        task_data = {
            'title': text.split('\n')[0][:100],
            'description': text,
            'priority': 'medium',
            'scheduledDate': datetime.now().isoformat(),
            'estimatedDuration': 60,
            'tags': ['slack', 'quick-task', f'channel:{channel_id}'],
            'assignedTo': user_name
        }
        
        try:
            # Get user's auth token
            connection = SlackConnection.objects.get(
                team_id=request.form.get('team_id')
            )
            
            # Create task via API
            headers = {
                'Authorization': f'Bearer {connection.user_auth_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/tasks/taskstudio/create/",
                json=task_data,
                headers=headers
            )
            
            if response.status_code == 200:
                task = response.json()['task']
                return jsonify({
                    'response_type': 'in_channel',
                    'text': f'✅ Task created: *{task["title"]}*\n'
                           f'View in TaskStudio: {FRONTEND_URL}/task-studio'
                })
            else:
                raise Exception(f"API error: {response.text}")
                
        except Exception as e:
            logger.error(f"Failed to create task: {e}")
            return jsonify({
                'response_type': 'ephemeral',
                'text': '❌ Failed to create task. Please try again.'
            })
```

### Interactive Task Creation

Add interactive components for better UX:

```python
def send_task_creation_dialog(trigger_id, client):
    """Open an interactive dialog for task creation"""
    client.views_open(
        trigger_id=trigger_id,
        view={
            "type": "modal",
            "callback_id": "create_task_modal",
            "title": {
                "type": "plain_text",
                "text": "Create New Task"
            },
            "submit": {
                "type": "plain_text",
                "text": "Create Task"
            },
            "blocks": [
                {
                    "type": "input",
                    "block_id": "title_block",
                    "label": {
                        "type": "plain_text",
                        "text": "Task Title"
                    },
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "title_input",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Enter task title"
                        }
                    }
                },
                {
                    "type": "input",
                    "block_id": "description_block",
                    "label": {
                        "type": "plain_text",
                        "text": "Description"
                    },
                    "element": {
                        "type": "plain_text_input",
                        "multiline": True,
                        "action_id": "description_input"
                    },
                    "optional": True
                },
                {
                    "type": "input",
                    "block_id": "priority_block",
                    "label": {
                        "type": "plain_text",
                        "text": "Priority"
                    },
                    "element": {
                        "type": "static_select",
                        "action_id": "priority_select",
                        "initial_option": {
                            "text": {
                                "type": "plain_text",
                                "text": "Medium"
                            },
                            "value": "medium"
                        },
                        "options": [
                            {
                                "text": {"type": "plain_text", "text": "Low"},
                                "value": "low"
                            },
                            {
                                "text": {"type": "plain_text", "text": "Medium"},
                                "value": "medium"
                            },
                            {
                                "text": {"type": "plain_text", "text": "High"},
                                "value": "high"
                            },
                            {
                                "text": {"type": "plain_text", "text": "Urgent"},
                                "value": "urgent"
                            }
                        ]
                    }
                }
            ]
        }
    )
```

## Future Enhancements

1. **Channel Selection**: Allow users to select specific channels for bot access
2. **Slash Commands**: Add custom commands like `/banbury help`
3. **Interactive Messages**: Add buttons and menus to responses
4. **File Handling**: Process files shared in Slack
5. **Notification Settings**: Configure when/how bot responds
6. **Multi-workspace**: Support multiple Slack workspaces per user
7. **Analytics**: Track usage and conversation metrics
8. **Task Templates**: Pre-defined task templates for common workflows
9. **Task Assignment**: Assign tasks to specific team members via @mentions
10. **Task Updates**: Update task status from Slack (e.g., "mark task X as complete")

## Implementation Summary

### Frontend Files Created/Updated:
1. **SlackConnection Component**: `/frontend/src/components/modals/settings-tabs/SlackConnection.tsx`
   - UI for connecting/disconnecting Slack workspaces
   - Connection status display
   - Test connection functionality

2. **Slack API Handlers**: `/frontend/src/components/handlers/slack-api-connection.ts`
   - Client-side API calls for Slack integration
   - Connection status checking
   - OAuth flow initiation

3. **Task Integration Handler**: `/frontend/src/components/handlers/slack-task-integration.ts`
   - Parse Slack messages to create tasks
   - Format responses for Slack
   - Date/time parsing from natural language

4. **Slack Events API Route**: `/frontend/pages/api/slack/events.ts`
   - Example Next.js API route for handling Slack webhooks
   - Signature verification
   - Event processing

### Key Features:
- **OAuth Integration**: Connect Slack workspaces securely
- **Task Creation**: Create TaskStudio tasks from Slack messages
- **Natural Language Processing**: Parse dates, priorities, and durations
- **Real-time Responses**: Immediate feedback in Slack
- **Thread Support**: Maintain conversation context

### Task Creation Flow:
1. User mentions @banbury with task keywords
2. System detects task creation intent
3. Message is parsed for task details
4. Task is created via TaskStudio API
5. Confirmation sent back to Slack with link

## Support

For questions about implementation:
- Frontend: Check `/frontend/src/components/modals/settings-tabs/SlackConnection.tsx`
- Backend: Follow this guide and Slack API documentation
- Slack API Docs: https://api.slack.com/
- TaskStudio Integration: See `/frontend/src/components/handlers/slack-task-integration.ts`