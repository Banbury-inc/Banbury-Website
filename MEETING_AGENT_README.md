# Meeting Agent - AI-Powered Meeting Assistant

## Overview

The Meeting Agent is a comprehensive AI-powered system that can join meetings across multiple platforms (Zoom, Teams, Google Meet, etc.), record conversations, generate transcriptions, and provide intelligent summaries with action items.

## Features

### ✅ Implemented Features

1. **Multi-Platform Support**
   - Zoom meetings
   - Microsoft Teams
   - Google Meet
   - Cisco Webex (coming soon)

2. **Meeting Management**
   - Join meetings via URL
   - Real-time status monitoring
   - Automatic recording
   - Smart meeting detection and parsing

3. **Recording & Transcription**
   - High-quality audio/video recording
   - Real-time transcription with speaker identification
   - Multiple language support
   - Confidence scoring for transcription accuracy

4. **AI-Powered Analysis**
   - Automatic meeting summaries
   - Key points extraction
   - Decision tracking
   - Action item identification with assignees and priorities

5. **User Interface**
   - Modern, responsive React interface
   - Real-time meeting status updates
   - Easy meeting joining workflow
   - Comprehensive settings management
   - Meeting history and analytics

6. **Backend API**
   - RESTful API with Django REST Framework
   - Real-time WebSocket support
   - Secure authentication and authorization
   - Comprehensive data models

## Architecture

### Frontend Components

```
src/pages/MeetingAgent/
├── MeetingAgent.tsx              # Main dashboard
├── components/
│   ├── MeetingJoinDialog.tsx     # Join meeting interface
│   ├── MeetingSessionCard.tsx    # Individual meeting display
│   ├── AgentStatusCard.tsx       # System status display
│   └── MeetingAgentSettings.tsx  # Configuration interface
├── types/
│   └── meeting-types.ts          # TypeScript definitions
└── services/
    └── meetingAgentService.ts    # API service layer
```

### Backend Structure

```
apps/meeting_agent/
├── models.py          # Data models
├── views.py           # API endpoints
├── serializers.py     # Data serialization
├── services.py        # Business logic
├── urls.py           # URL routing
├── admin.py          # Django admin interface
└── management/
    └── commands/
        └── setup_meeting_platforms.py
```

### Database Schema

- **MeetingPlatform**: Supported platforms (Zoom, Teams, etc.)
- **MeetingSession**: Individual meeting instances
- **MeetingParticipant**: Meeting attendees
- **TranscriptionSegment**: Timestamped speech segments
- **MeetingSummary**: AI-generated summaries
- **ActionItem**: Extracted tasks and follow-ups
- **MeetingAgentConfig**: User configuration
- **MeetingAgentStatus**: System health monitoring

## API Endpoints

### Platform Management
- `GET /meeting-agent/platforms/` - List supported platforms
- `POST /meeting-agent/platforms/{id}/test-auth/` - Test platform authentication

### Session Management
- `GET /meeting-agent/sessions/` - List user's meetings
- `POST /meeting-agent/sessions/join/` - Join a new meeting
- `POST /meeting-agent/sessions/{id}/leave/` - Leave a meeting
- `GET /meeting-agent/sessions/{id}/transcription/` - Get transcription
- `GET /meeting-agent/sessions/{id}/summary/` - Get meeting summary
- `POST /meeting-agent/sessions/{id}/summary/generate/` - Generate summary
- `GET /meeting-agent/sessions/{id}/recording/` - Download recording

### Configuration
- `GET /meeting-agent/config/` - Get user configuration
- `PUT /meeting-agent/config/` - Update configuration

### System Status
- `GET /meeting-agent/status/` - Get agent status

## Setup Instructions

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install clsx tailwind-merge
   npm install @radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-select @radix-ui/react-progress
   ```

2. **Add Route**
   The route `/meeting-agent` has been added to your React Router configuration.

3. **Navigation**
   Add a link to the meeting agent in your navigation:
   ```tsx
   <Link to="/meeting-agent">Meeting Agent</Link>
   ```

### Backend Setup

1. **Database Migration**
   ```bash
   cd banbury-cloud-backend
   python manage.py makemigrations meeting_agent
   python manage.py migrate
   ```

2. **Setup Platforms**
   ```bash
   python manage.py setup_meeting_platforms
   ```

3. **Admin Access**
   The meeting agent models are registered in Django admin for easy management.

## Usage

### Joining a Meeting

1. Navigate to `/meeting-agent`
2. Click "Join Meeting"
3. Enter the meeting URL (Zoom, Teams, Google Meet, etc.)
4. Configure recording and transcription settings
5. Click "Join Meeting"

The AI agent will:
- Parse the meeting URL
- Join the meeting automatically
- Start recording (if enabled)
- Monitor the meeting duration
- Generate transcription in real-time
- Leave automatically when the meeting ends

### Viewing Results

After a meeting:
- View transcription with speaker identification
- Download recording files
- Generate AI summaries with key points
- Extract action items with assignees
- Export data in various formats

### Configuration

Users can configure:
- Default recording quality
- Transcription language
- AI features (summaries, action items)
- Notification preferences
- Automation settings (auto-join, auto-leave)

## Technical Implementation Details

### Meeting URL Parsing

The system can parse and validate URLs from:
- Zoom: `zoom.us/j/123456789`
- Teams: `teams.microsoft.com/...`
- Google Meet: `meet.google.com/abc-defg-hij`
- Webex: `*.webex.com/...`

### Recording Technology

The system uses:
- Browser automation (Playwright/Selenium) for meeting joining
- Screen and audio capture APIs
- Cloud storage for recordings (S3 compatible)
- Real-time transcription services

### AI Integration

- **Transcription**: Whisper API or similar services
- **Summarization**: GPT-4 or Claude for meeting analysis
- **Action Item Extraction**: NLP models for task identification
- **Speaker Diarization**: Audio analysis for speaker identification

## Security & Privacy

- All recordings are encrypted at rest
- User authentication required for all operations
- Meeting URLs are validated before joining
- Configurable data retention policies
- GDPR compliance features

## Monitoring & Analytics

- Real-time system health monitoring
- Meeting success/failure tracking
- Usage analytics and reporting
- Performance metrics and alerts

## Future Enhancements

1. **Advanced AI Features**
   - Sentiment analysis
   - Topic modeling
   - Meeting insights and recommendations

2. **Integration Expansion**
   - Calendar integration
   - CRM system connections
   - Slack/Teams bot integration

3. **Enhanced Automation**
   - Scheduled meeting joining
   - Smart meeting detection
   - Automated follow-up actions

4. **Collaboration Features**
   - Team meeting dashboards
   - Shared meeting libraries
   - Collaborative note-taking

## Troubleshooting

### Common Issues

1. **Meeting Join Failures**
   - Check platform authentication
   - Verify meeting URL format
   - Ensure meeting is active

2. **Recording Issues**
   - Check browser permissions
   - Verify storage space
   - Review quality settings

3. **Transcription Problems**
   - Check audio quality
   - Verify language settings
   - Review API quotas

### Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

## License

This project is licensed under the same terms as the main Banbury Website project.
