import { Box, Button, Card, CardMedia, Container, Grid, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { determineOS } from '../handlers/determineOS';


interface ProductsProps {
  name: string;
  description: string;
  image: string;
}

const Features = (): JSX.Element => {
  const [products, setProducts] = useState<ProductsProps[]>([]);
  const [downloadText, setDownloadText] = useState<string>('Download');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    determineOS(setDownloadText, setDownloadUrl);
  }, []);

  const fetchProducts = () => {
    axios.get<ProductsProps[]>('http://127.0.0.1:8000/products', {
      headers: {
        Accept: 'application/json',
      },
    }).then((response) => {
      setProducts(response.data);
    }).catch((error) => {
      // Handle error silently
    });
  };






  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Box sx={{ overflow: 'visible', background: '#000000' }}>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, sm: 4, md: 8 },
          background: '#000000',
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            opacity: 0.4,
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ mb: 6, position: 'relative', zIndex: 2 }}>
          <Typography
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 600,
              color: '#ffffff',
              mb: 4,
              letterSpacing: '-0.02em',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            AI-Powered Document <br />
            <Box component="span" sx={{ color: '#a1a1aa', fontWeight: 500 }}>
              Workflows & Intelligence
            </Box>
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: '#a1a1aa',
              mb: 3,
              fontWeight: 500,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Create, Edit, and Enhance Documents with Intelligent AI Assistance
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: '#a1a1aa',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            From ChatGPT-style conversations to intelligent document creation, Banbury transforms how you work with files. 
            Our AI searches the internet, analyzes content, and seamlessly integrates findings into your documents.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '0 auto',
            alignItems: 'center',
            width: '90%',
            maxWidth: '1200px',
            background: 'rgba(255,255,255,0.02)',
            padding: '48px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            mb: 8,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 0,
              paddingBottom: '56.25%', // 16:9 aspect ratio
              borderRadius: '12px',
              overflow: 'hidden',
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.3))',
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/Ci8Wu93UIMU"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '12px',
              }}
            />
          </Box>
        </Box>


        <Box
          sx={{
            textAlign: 'center',
            my: 12,
            position: 'relative',
            zIndex: 2
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 600,
              color: '#ffffff',
              mb: 4,
              letterSpacing: '-0.02em',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Intelligent Internet Search & Document Integration
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.05rem', md: '1.125rem' },
              color: '#a1a1aa',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Ask Banbury to search the internet for latest information and automatically integrate findings into your documents. 
            Our AI ensures comprehensive research by visiting multiple sources until it has sufficient information to fulfill your request.
          </Typography>
        </Box>

        {/* Key Features Section */}
        <Container sx={{ my: 12 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 600,
                color: '#ffffff',
                mb: 3,
                letterSpacing: '-0.02em',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Powerful Banbury Features
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.05rem', md: '1.125rem' },
                color: '#a1a1aa',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Discover the workflows that make Banbury your ultimate AI-powered productivity platform
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 12 }}>
            {/* Home ChatGPT Feature */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 6,
                  height: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChatIcon
                    sx={{
                      fontSize: '3rem',
                      color: '#a1a1aa',
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#ffffff',
                    fontSize: '1.25rem',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  ChatGPT-Style Interface
                </Typography>
                <Typography
                  sx={{
                    color: '#a1a1aa',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Start with our intuitive home page - ask quick questions and get intelligent responses, just like ChatGPT but integrated with your workspace.
                </Typography>
              </Box>
            </Grid>

            {/* Workspaces Feature */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 6,
                  height: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderIcon
                    sx={{
                      fontSize: '3rem',
                      color: '#a1a1aa',
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#ffffff',
                    fontSize: '1.25rem',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Smart Workspaces
                </Typography>
                <Typography
                  sx={{
                    color: '#a1a1aa',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  View and manage your files while the AI assistant in the right panel interacts with your documents to perform intelligent workflows.
                </Typography>
              </Box>
            </Grid>

            {/* Document Creation Feature */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 6,
                  height: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddCircleOutlineIcon
                    sx={{
                      fontSize: '3rem',
                      color: '#a1a1aa',
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#ffffff',
                    fontSize: '1.25rem',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Create & Upload
                </Typography>
                <Typography
                  sx={{
                    color: '#a1a1aa',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Create documents, spreadsheets, folders, or upload existing files. Our full word editor gives you complete control over your content.
                </Typography>
              </Box>
            </Grid>

            {/* Internet Search Feature */}
            <Grid item xs={12} md={6}>
        <Box
          sx={{
                  p: 6,
                  height: '100%',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(59, 130, 246, 0.15)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
            display: 'flex',
            alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                                    <SearchIcon
                    sx={{
                      fontSize: '3rem',
                      color: '#60a5fa',
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#ffffff',
                    fontSize: '1.4rem',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Intelligent Internet Research
                </Typography>
                <Typography
                  sx={{
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    fontSize: '1rem',
                    fontWeight: 400,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Simply ask "search the internet for latest NFL news and place a summary in this document" and watch as Banbury 
                  searches multiple sources, analyzes the content, and automatically populates your document with comprehensive findings.
                </Typography>
        </Box>
            </Grid>

            {/* Beta Signup Feature */}
            <Grid item xs={12} md={6}>
        <Box
          sx={{
                  p: 6,
                  height: '100%',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    background: 'rgba(34, 197, 94, 0.15)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.3), transparent)',
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
            display: 'flex',
            alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RocketLaunchIcon
                    sx={{
                      fontSize: '3rem',
                      color: '#4ade80',
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#ffffff',
                    fontSize: '1.4rem',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Free Beta Access
                </Typography>
                <Typography
                  sx={{
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    fontSize: '1rem',
                    fontWeight: 400,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Join our beta program today - completely free! Experience the future of AI-powered document workflows 
                  and help us shape the platform with your valuable feedback.
                </Typography>
        </Box>
            </Grid>
          </Grid>
        </Container>

        <Container sx={{ mt: 8 }}>
          <Grid container spacing={4}>
            {products.map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box
                  component={Card}
                  sx={{
                    p: 6,
                    height: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                    },
                  }}
                >
                  <Box display='flex' flexDirection='column'>
                    <Typography
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: '#ffffff',
                        fontSize: '1.25rem',
                        letterSpacing: '-0.01em',
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography 
                      sx={{
                        color: '#a1a1aa',
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                        fontWeight: 400,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                  <Box display='block' width={1} height={1}>
                    <CardMedia
                      title=''
                      image={item.image}
                      sx={{
                        position: 'relative',
                        height: 320,
                        overflow: 'hidden',
                        borderRadius: 2,
                        filter: 'brightness(0.7)',
                        marginTop: 4,
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Features;
