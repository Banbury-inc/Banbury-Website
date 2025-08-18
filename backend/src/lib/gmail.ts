import { google } from 'googleapis';

// Gmail API setup
const gmail = google.gmail('v1');

// Initialize Gmail API with service account credentials
const getGmailClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
  });

  return google.gmail({ version: 'v1', auth });
};

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  body?: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export class GmailService {
  private gmailClient;

  constructor() {
    this.gmailClient = getGmailClient();
  }

  // Search emails
  async searchEmails(query: string, maxResults: number = 10): Promise<EmailMessage[]> {
    try {
      const response = await this.gmailClient.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];
      const emailMessages: EmailMessage[] = [];

      for (const message of messages) {
        const email = await this.getEmailById(message.id!);
        if (email) {
          emailMessages.push(email);
        }
      }

      return emailMessages;
    } catch (error) {
      console.error('Error searching emails:', error);
      throw new Error('Failed to search emails');
    }
  }

  // Get email by ID
  async getEmailById(messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await this.gmailClient.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const message = response.data;
      const headers = message.payload?.headers || [];
      
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      let body = '';
      if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      } else if (message.payload?.parts) {
        const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      return {
        id: message.id!,
        subject,
        from,
        to,
        date,
        snippet: message.snippet || '',
        body,
      };
    } catch (error) {
      console.error('Error getting email:', error);
      return null;
    }
  }

  // Get recent emails
  async getRecentEmails(maxResults: number = 10): Promise<EmailMessage[]> {
    try {
      const response = await this.gmailClient.users.messages.list({
        userId: 'me',
        maxResults,
      });

      const messages = response.data.messages || [];
      const emailMessages: EmailMessage[] = [];

      for (const message of messages) {
        const email = await this.getEmailById(message.id!);
        if (email) {
          emailMessages.push(email);
        }
      }

      return emailMessages;
    } catch (error) {
      console.error('Error getting recent emails:', error);
      throw new Error('Failed to get recent emails');
    }
  }

  // Send email
  async sendEmail(request: SendEmailRequest): Promise<{ success: boolean; messageId?: string }> {
    try {
      const fromEmail = request.from || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      
      const emailContent = [
        `From: ${fromEmail}`,
        `To: ${request.to}`,
        `Subject: ${request.subject}`,
        '',
        request.body,
      ].join('\n');

      const encodedEmail = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      const response = await this.gmailClient.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      });

      return {
        success: true,
        messageId: response.data.id || undefined,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Get unread emails
  async getUnreadEmails(maxResults: number = 10): Promise<EmailMessage[]> {
    return this.searchEmails('is:unread', maxResults);
  }

  // Get emails from specific sender
  async getEmailsFromSender(sender: string, maxResults: number = 10): Promise<EmailMessage[]> {
    return this.searchEmails(`from:${sender}`, maxResults);
  }
}
