import { Box, Typography, Paper } from '@mui/material';
import { IntegrationInstructions, Repeat, AccountTree } from '@mui/icons-material';

export default function WhatIsBanburyTab() {
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
                  What Is Banbury?
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
                  Banbury is an Enterprise AI Analyst that works as a remote artificial employee within organizations.
                  It is an entry-level, autonomous AI colleague capable of editing documents and spreadsheets, handling complex tasks,
                   and collaborating seamlessly with people across various platforms.
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    background: 'primary.main',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
              <Box>
                <img 
                  src="/Workspaces.png" 
                  alt="Chat Input Field - Step 1" 
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '10px',
                    maxWidth: '100%',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }} 
                  onLoad={() => console.log('Chatbox image loaded successfully')}
                  onError={(e) => {
                    console.error('Failed to load Chatbox image:', e);
                    console.log('Trying to load from:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Box>
              </Paper>
              <Typography
                sx={{
                    fontSize: '1rem',
                    color: '#a1a1aa',
                    mt: 2,
                    mb: 4,
                    lineHeight: 1.7,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Banbury transforms workflows, offering a powerful tool to enhance productivity, streamline operations, and drive innovation.
              </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: '1.75rem', md: '1.75rem' },
                    fontWeight: 600,
                    mt: 2,
                    mb: 3,
                    color: '#ffffff',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Why choose Banbury?
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IntegrationInstructions 
                    sx={{ 
                      color: '#a1a1aa', 
                      mr: 1.5, 
                      fontSize: '1.5rem' 
                    }} 
                  />
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#a1a1aa',
                      lineHeight: 1.7,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                      Data Integration
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    color: '#a1a1aa',
                    mb: 2,
                    lineHeight: 1.7,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Banbury is a great way to get started with AI in your organization.
                  Athena seamlessly integrates with popular enterprise data sources such as Snowflake/Salesforce,
                   Outlook/Gmail, etc. allowing for a unified data experience across platforms and enhancing productivity.
                </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Repeat 
                    sx={{ 
                      color: '#a1a1aa', 
                      mr: 1.5, 
                      fontSize: '1.5rem' 
                    }} 
                  />
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#a1a1aa',
                      lineHeight: 1.7,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                      Repeatability
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    color: '#a1a1aa',
                    mb: 2,
                    lineHeight: 1.7,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                   Banbury excels in automating manual processes and repeating workflows across multiple scenarios, saving time and reducing errors. This capability allows enterprises to scale operations efficiently by standardizing routine tasks.
                </Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 2,
                    mb: 4,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountTree 
                    sx={{ 
                      color: '#a1a1aa', 
                      mr: 1.5, 
                      fontSize: '1.5rem' 
                    }} 
                  />
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#a1a1aa',
                      lineHeight: 1.7,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                      Tailored Workflows
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    color: '#a1a1aa',
                    mb: 2,
                    lineHeight: 1.7,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                   Banbury offers bespoke workflows tailored to your industry needs, providing customizable solutions that align with your enterprise's unique processes and objectives.
                </Typography>
                </Paper>
                <Typography
                  sx={{
                    fontSize: { xs: '1.75rem', md: '1.75rem' },
                    fontWeight: 600,
                    mb: 3,
                    color: '#ffffff',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Who is Banbury made for?
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    color: '#a1a1aa',
                    mb: 2,
                    lineHeight: 1.7,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Banbury is made for organizations looking to harness the power of advanced AI to enhance productivity,
                   drive innovation, and gain a competitive edge in today's fast-paced environment. Whether you're
                    a student in college, a Fortune 500 executive, or anywhere in between, Banbury is your next hire to help
                     you achieve your goals more efficiently and effectively.
                </Typography>
              </Box>
  );
};