import { CreateTaskData, TaskPriority } from '../../pages/TaskStudio/types'

export interface SlackTaskRequest {
  message: string
  channel_id: string
  user_id: string
  username: string
  thread_ts?: string
  team_id: string
}

export interface ParsedTaskData extends CreateTaskData {
  source: 'slack'
  slackMetadata: {
    channel_id: string
    user_id: string
    username: string
    thread_ts?: string
    team_id: string
  }
}

export const slackTaskIntegration = {
  /**
   * Check if a message should create a task
   */
  shouldCreateTask(message: string): boolean {
    const taskKeywords = [
      'create task', 'new task', 'add task', 'make task',
      'schedule task', 'todo', 'to do', 'to-do',
      'remind me', 'reminder', 'schedule this',
      'task:', '/task'
    ]
    
    const messageLower = message.toLowerCase()
    return taskKeywords.some(keyword => messageLower.includes(keyword))
  },

  /**
   * Parse task details from a Slack message
   */
  parseTaskFromMessage(request: SlackTaskRequest): ParsedTaskData {
    const { message, channel_id, user_id, username, thread_ts, team_id } = request
    
    // Default task data
    const taskData: ParsedTaskData = {
      title: '',
      description: message,
      priority: 'medium' as TaskPriority,
      scheduledDate: new Date(),
      estimatedDuration: 60, // Default 60 minutes
      tags: ['slack', `channel:${channel_id}`],
      assignedTo: username,
      source: 'slack',
      slackMetadata: {
        channel_id,
        user_id,
        username,
        thread_ts,
        team_id
      }
    }
    
    // Extract title - look for quotes or use first line
    const titleMatch = message.match(/"([^"]+)"/)
    if (titleMatch) {
      taskData.title = titleMatch[1]
      taskData.description = message.replace(`"${titleMatch[1]}"`, '').trim()
    } else {
      // Use first line as title, rest as description
      const lines = message.trim().split('\n')
      const firstLine = lines[0]
        .replace(/create task/i, '')
        .replace(/new task/i, '')
        .replace(/add task/i, '')
        .replace(/todo:/i, '')
        .replace(/task:/i, '')
        .trim()
      
      taskData.title = firstLine.substring(0, 100)
      if (lines.length > 1) {
        taskData.description = lines.slice(1).join('\n')
      }
    }
    
    // Extract priority
    if (/\b(urgent|asap|immediately)\b/i.test(message)) {
      taskData.priority = 'urgent'
    } else if (/\b(high priority|important)\b/i.test(message)) {
      taskData.priority = 'high'
    } else if (/\b(low priority|whenever)\b/i.test(message)) {
      taskData.priority = 'low'
    }
    
    // Extract scheduled date
    const scheduledDate = this.parseDateFromMessage(message)
    taskData.scheduledDate = scheduledDate
    
    // Extract duration
    const durationMatch = message.match(/(\d+)\s*(hours?|hrs?|minutes?|mins?)/i)
    if (durationMatch) {
      const amount = parseInt(durationMatch[1])
      const unit = durationMatch[2].toLowerCase()
      if (unit.includes('hour') || unit.includes('hr')) {
        taskData.estimatedDuration = amount * 60
      } else {
        taskData.estimatedDuration = amount
      }
    }
    
    // Extract tags from hashtags
    const tagMatches = message.match(/#(\w+)/g)
    if (tagMatches) {
      const hashtags = tagMatches.map(tag => tag.substring(1))
      taskData.tags = [...taskData.tags || [], ...hashtags]
    }
    
    // Ensure we have a title
    if (!taskData.title) {
      taskData.title = `Task from Slack - ${new Date().toLocaleDateString()}`
    }
    
    // Add Slack context to description
    const slackContext = `\n\n---\nCreated from Slack by ${username}`
    if (thread_ts) {
      taskData.description += ` in thread`
    }
    taskData.description += slackContext
    
    return taskData
  },

  /**
   * Parse date from message text
   */
  parseDateFromMessage(message: string): Date {
    const now = new Date()
    let scheduledDate = new Date(now)
    
    // Tomorrow
    if (/\btomorrow\b/i.test(message)) {
      scheduledDate.setDate(scheduledDate.getDate() + 1)
    }
    // Next week
    else if (/\bnext week\b/i.test(message)) {
      scheduledDate.setDate(scheduledDate.getDate() + 7)
    }
    // In X days
    else {
      const daysMatch = message.match(/in (\d+) days?/i)
      if (daysMatch) {
        const days = parseInt(daysMatch[1])
        scheduledDate.setDate(scheduledDate.getDate() + days)
      }
    }
    
    // Extract specific time
    const timeMatch = message.match(/at (\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      const minute = parseInt(timeMatch[2] || '0')
      const amPm = timeMatch[3]?.toLowerCase()
      
      if (amPm === 'pm' && hour < 12) {
        hour += 12
      } else if (amPm === 'am' && hour === 12) {
        hour = 0
      }
      
      scheduledDate.setHours(hour, minute, 0, 0)
    }
    
    return scheduledDate
  },

  /**
   * Format task creation response for Slack
   */
  formatTaskResponse(task: any): string {
    const scheduledDate = new Date(task.scheduledDate)
    const dateStr = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
    
    return `✅ Task created successfully!\n\n` +
           `*Title:* ${task.title}\n` +
           `*Scheduled:* ${dateStr}\n` +
           `*Priority:* ${task.priority}\n` +
           `*Status:* ${task.status}\n\n` +
           `View in TaskStudio: ${window.location.origin}/task-studio`
  },

  /**
   * Format error response for Slack
   */
  formatErrorResponse(error: any): string {
    return `❌ Failed to create task\n\n` +
           `Error: ${error.message || 'Unknown error occurred'}\n\n` +
           `Please try again or contact support if the issue persists.`
  }
}