import { Box, Typography, Paper } from '@mui/material';
import Image from 'next/image';
import { useEffect } from 'react';

export default function UsingBanburyTab() {
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
        Using Banbury
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
        This guide will walk you through Banbury—covering everything from basic functionalities to unlocking its full potential. 
        With step-by-step instructions and practical tips, learn how to leverage Banbury to simplify tasks and enhance productivity.
      </Typography>
      <Typography
        sx={{
          fontSize: '1.25rem',
          color: '#ffffff',
          mb: 4,
          lineHeight: 1.7,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Using Chat
      </Typography>

      {/* Visual Step Component with Content */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          gap: 4,
          alignItems: 'flex-start'
        }}>
          {/* Left Side - Visual Steps */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            position: 'relative',
            minWidth: '120px'
          }}>
            {/* Step 1 Circle */}
            <Box sx={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              zIndex: 2
            }}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                1
              </Typography>
            </Box>
            
            {/* Connecting Line */}
            <Box sx={{
              width: '2px',
              height: '315px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              mb: 2
            }} />
            
            {/* Step 2 Circle */}
            <Box sx={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              zIndex: 2
            }}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                2
              </Typography>
            </Box>
          </Box>

          {/* Right Side - Step Content */}
          <Box sx={{ flex: 1 }}>
            {/* Step 1 Content */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  mb: 2,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Web Research
              </Typography>
              
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#a1a1aa',
                  mb: 3,
                  lineHeight: 1.5,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                In the Chat window, type the following prompt and press Enter.
              </Typography>
              
              {/* Prompt Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#a1a1aa',
                    mb: 1,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Prompt
                </Typography>
                <Box sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#ffffff',
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    Search the web for latest NFL news.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '1px'
                      }} />
                    </Box>
                    <Box sx={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '50%'
                      }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Chat Input Field */}
              <Box sx={{ mb: 3 }}>
                <Image 
                  src="/Chatbox.png" 
                  alt="Chat Input Field - Step 1" 
                  width={400}
                  height={200}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '10px',
                    maxWidth: '400px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }} 
                  onLoad={() => console.log('Chatbox image loaded successfully')}
                  onError={(e) => {
                    console.error('Failed to load Chatbox image:', e);
                    console.log('Trying to load from:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback text if image fails */}
                <Box sx={{ 
                  display: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  p: 2,
                  mt: 2
                }}>
                  <Typography sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                    [Chat Interface Image - Step 1]
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Step 2 Content */}
            <Box>
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  mb: 2,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Draft a report
              </Typography>
              
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#a1a1aa',
                  mb: 3,
                  lineHeight: 1.5,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Type the following prompt and press Enter.
              </Typography>
              
              {/* Prompt Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#a1a1aa',
                    mb: 1,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Prompt
                </Typography>
                <Box sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#ffffff',
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    Create a new document with a summary of your results.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '1px'
                      }} />
                    </Box>
                    <Box sx={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '50%'
                      }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Image 
                  src="/Chatbox2.png" 
                  alt="Chat Input Field - Step 2" 
                  width={400}
                  height={200}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '10px',
                    maxWidth: '400px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }} 
                  onLoad={() => console.log('Chatbox2 image loaded successfully')}
                  onError={(e) => {
                    console.error('Failed to load Chatbox2 image:', e);
                    console.log('Trying to load from:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback text if image fails */}
                <Box sx={{ 
                  display: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  p: 2,
                  mt: 2
                }}>
                  <Typography sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                    [Chat Interface Image - Step 2]
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};