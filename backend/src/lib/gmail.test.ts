import { GmailService } from './gmail';

// This is a simple test to verify the Gmail service can be instantiated
// In a real environment, you would need proper credentials to test the actual API calls

describe('GmailService', () => {
  let gmailService: GmailService;

  beforeEach(() => {
    // Mock environment variables for testing
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
    process.env.GOOGLE_PRIVATE_KEY = 'test-key';
    
    gmailService = new GmailService();
  });

  afterEach(() => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;
  });

  it('should be instantiated without errors', () => {
    expect(gmailService).toBeDefined();
  });

  it('should have all required methods', () => {
    expect(typeof gmailService.searchEmails).toBe('function');
    expect(typeof gmailService.getEmailById).toBe('function');
    expect(typeof gmailService.getRecentEmails).toBe('function');
    expect(typeof gmailService.sendEmail).toBe('function');
    expect(typeof gmailService.getUnreadEmails).toBe('function');
    expect(typeof gmailService.getEmailsFromSender).toBe('function');
  });
});
