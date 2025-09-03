import { Box, Typography, Paper } from '@mui/material';
const calendarDemo = require('../../../assets/images/calendar_demo.mp4');
const fantasyDraftDemo = require('../../../assets/images/fantasy_draft_demo.mp4');
const spreadsheetDemo = require('../../../assets/images/spreadsheet_demo.mp4');
const browserAutomationDemo = require('../../../assets/images/browser-automation-demo.mp4');
const emailSchedulingDemo = require('../../../assets/images/email-calendar-scheduling-demo.mp4');

export default function FeaturesTab() {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: '1.75rem', md: '2rem' },
          fontWeight: 600,
          mb: 3,
          color: '#ffffff',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Banbury's Features
      </Typography>
      <Typography
        sx={{
          fontSize: '1rem',
          color: '#a1a1aa',
          mb: 4,
          lineHeight: 1.7,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Banbury is an Enterprise AI Analyst that works as a remote artificial employee within organizations. This guide highlights two important aspects of Banbury's interaction with your data:
      </Typography>

      {/* What can Banbury see? */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            mb: 3,
            color: '#ffffff',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          1. <strong>What can Banbury see?</strong>
        </Typography>
        <Typography
          sx={{
            fontSize: '1rem',
            color: '#a1a1aa',
            mb: 4,
            lineHeight: 1.7,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Banbury has visibility into different asset types, allowing it to understand and interpret a wide array of data. For example, Banbury can read documents and spreadsheets, view the contents of folders, and even browse the web to gather information.
        </Typography>
      </Box>

      {/* What can Banbury do? */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            mb: 3,
            color: '#ffffff',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          2. <strong>What can Banbury do?</strong>
        </Typography>
        <Typography
          sx={{
            fontSize: '1rem',
            color: '#a1a1aa',
            mb: 4,
            lineHeight: 1.7,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Beyond just viewing, Banbury can perform a multitude of actions on top of your assets to manage your workspace efficiently. It can create and edit documents & spreadsheets and share assets with others, among other capabilities.
        </Typography>
      </Box>

      {/* Docs Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            mb: 3,
            color: '#ffffff',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <strong>Docs</strong>
        </Typography>
        
        {/* Visibility */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Visibility:</strong>
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#a1a1aa',
              mb: 2,
              lineHeight: 1.6,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              pl: 2,
            }}
          >
            • Banbury can read what's inside a document and look at every single page.
          </Typography>
        </Box>

        {/* Actions */}
        <Box>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Actions - Banbury can:</strong>
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Create a new document.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Edit the contents of a document.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 0,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Rename a document.
            </Typography>
          </Box>
        </Box>
                  <Box sx={{
                    p: 3,
                    mt: 4,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      flex: 1,
                      minHeight: '300px'
                    }}>
                      <video 
                        src={browserAutomationDemo} 
                        controls 
                        muted 
                        playsInline 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '12px',
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  </Box>
      </Box>
      {/* Spreadsheets Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            mb: 3,
            color: '#ffffff',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <strong>Spreadsheets</strong>
        </Typography>
        
        {/* Visibility */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Visibility:</strong>
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#a1a1aa',
              mb: 2,
              lineHeight: 1.6,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              pl: 2,
            }}
          >
            • Banbury can read what's inside a spreadsheet and look at every single cell.
          </Typography>
        </Box>

        {/* Actions */}
        <Box>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Actions - Banbury can:</strong>
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Create a new spreadsheet.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Edit the contents of a spreadsheet.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 0,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Rename a spreadsheet.
            </Typography>
          </Box>
        </Box>

                  <Box sx={{
                    p: 3,
                    mt: 4,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      flex: 1,
                      minHeight: '300px'
                    }}>
                      <video 
                        src={spreadsheetDemo} 
                        controls 
                        muted 
                        playsInline 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '12px',
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  </Box>
      </Box>

      {/* Folders Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            mb: 3,
            color: '#ffffff',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <strong>Folders</strong>
        </Typography>
        
        {/* Visibility */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Visibility:</strong>
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#a1a1aa',
              mb: 2,
              lineHeight: 1.6,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              pl: 2,
            }}
          >
            • Banbury can read what's inside a folder and help to understand it better.
          </Typography>
        </Box>

        {/* Actions */}
        <Box>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Actions - Banbury can:</strong>
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Create a new folder.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Move things into and out of a folder.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Perform an in depth analysis of a folder.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 0,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Rename a folder.
            </Typography>
          </Box>
        </Box>

                  <Box sx={{
                    p: 3,
                    mt: 4,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      flex: 1,
                      minHeight: '300px'
                    }}>
                      <video 
                        src={browserAutomationDemo} 
                        controls 
                        muted 
                        playsInline 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '12px',
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  </Box>
      </Box>
      {/* Web Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            mb: 3,
            color: '#ffffff',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <strong>Browse</strong>
        </Typography>
        
        {/* Visibility */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Visibility:</strong>
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#a1a1aa',
              mb: 2,
              lineHeight: 1.6,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              pl: 2,
            }}
          >
            • Banbury can browse the web to gather and read information.
          </Typography>
        </Box>

        {/* Actions */}
        <Box>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Actions - Banbury can:</strong>
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Create a new browser session.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Read the output of a website.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Fill out forms on a website.
            </Typography>
          </Box>
        </Box>
                  <Box sx={{
                    p: 3,
                    mt: 4,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      flex: 1,
                      minHeight: '300px'
                    }}>
                      <video 
                        src={browserAutomationDemo} 
                        controls 
                        muted 
                        playsInline 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '12px',
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  </Box>
      </Box>

      {/* Calendar Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            mb: 3,
            color: '#ffffff',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <strong>Calendar</strong>
        </Typography>
        
        {/* Visibility */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Visibility:</strong>
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#a1a1aa',
              mb: 2,
              lineHeight: 1.6,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              pl: 2,
            }}
          >
            • Banbury can read the contents of a calendar and help to understand it better.
          </Typography>
        </Box>

        {/* Actions */}
        <Box>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              mb: 2,
              color: '#ffffff',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            • <strong>Actions - Banbury can:</strong>
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Create a new event.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Read and find events in a calendar.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a1a1aa',
                mb: 1,
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              • Edit an event.
            </Typography>
          </Box>
        </Box>
                  <Box sx={{
                    p: 3,
                    mt: 4,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      flex: 1,
                      minHeight: '300px'
                    }}>
                      <video 
                        src={calendarDemo} 
                        controls 
                        muted 
                        playsInline 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '12px',
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  </Box>
      </Box>
    </Box>
  );
};