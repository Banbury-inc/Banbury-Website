import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { taskHandlers } from '../../../src/pages/TaskStudio/handlers/taskHandlers'
import { slackTaskIntegration } from '../../../src/components/handlers/slack-task-integration'

// Verify Slack request signature
function verifySlackRequest(req: NextApiRequest): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) return false

  const signature = req.headers['x-slack-signature'] as string
  const timestamp = req.headers['x-slack-request-timestamp'] as string
  const body = JSON.stringify(req.body)

  if (!signature || !timestamp) return false

  // Check if timestamp is within 5 minutes
  const time = Math.floor(new Date().getTime() / 1000)
  if (Math.abs(time - parseInt(timestamp)) > 300) return false

  // Compute signature
  const sigBasestring = `v0:${timestamp}:${body}`
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify Slack signature
  if (!verifySlackRequest(req)) {
    return res.status(401).json({ error: 'Invalid request signature' })
  }

  const { type, challenge, event } = req.body

  // Handle URL verification challenge
  if (type === 'url_verification') {
    return res.status(200).json({ challenge })
  }

  // Handle events
  if (type === 'event_callback' && event) {
    try {
      const { type: eventType, text, user, channel, thread_ts, ts } = event

      // Handle app mentions
      if (eventType === 'app_mention') {
        // Check if this is a task creation request
        if (slackTaskIntegration.shouldCreateTask(text)) {
          // Parse task from message
          const taskData = slackTaskIntegration.parseTaskFromMessage({
            message: text,
            channel_id: channel,
            user_id: user,
            username: event.user_profile?.real_name || user,
            thread_ts: thread_ts || ts,
            team_id: event.team
          })

          try {
            // Create task via TaskStudio API
            // Note: In production, you'd need to get the user's auth token
            // from your database based on the Slack user/team mapping
            const authToken = await getUserAuthToken(event.team, user)
            
            // Set auth token for API call
            const originalToken = globalThis.localStorage?.getItem('authToken')
            if (authToken) {
              globalThis.localStorage?.setItem('authToken', authToken)
            }

            const task = await taskHandlers.createTask(taskData)

            // Restore original token
            if (originalToken) {
              globalThis.localStorage?.setItem('authToken', originalToken)
            }

            // Send success response back to Slack
            await sendSlackMessage(
              channel,
              slackTaskIntegration.formatTaskResponse(task),
              thread_ts || ts
            )
          } catch (error) {
            // Send error response back to Slack
            await sendSlackMessage(
              channel,
              slackTaskIntegration.formatErrorResponse(error),
              thread_ts || ts
            )
          }
        } else {
          // Regular AI conversation - integrate with your AI service
          await handleAIConversation(event)
        }
      }

      return res.status(200).json({ ok: true })
    } catch (error) {
      console.error('Error handling Slack event:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(200).json({ ok: true })
}

// Helper functions (implement these based on your backend)
async function getUserAuthToken(teamId: string, userId: string): Promise<string> {
  // TODO: Implement database lookup to get user's Banbury auth token
  // based on Slack team and user IDs
  return process.env.DEFAULT_AUTH_TOKEN || ''
}

async function sendSlackMessage(channel: string, text: string, threadTs?: string) {
  // TODO: Implement Slack API call to send message
  // You'll need to use the bot token from your Slack connection
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel,
      text,
      thread_ts: threadTs
    })
  })
  
  return response.json()
}

async function handleAIConversation(event: any) {
  // TODO: Integrate with your AI service
  // This would be similar to your existing chat functionality
  const response = "I'll help you with that! (AI response would go here)"
  await sendSlackMessage(event.channel, response, event.thread_ts || event.ts)
}