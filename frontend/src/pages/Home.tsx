import CloudIcon from '@mui/icons-material/Cloud';
import DevicesIcon from '@mui/icons-material/Devices';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import NextLink from 'next/link';
import { useState, useEffect } from 'react';
import AppImage from '../assets/images/app_image.png';
import { determineOS } from '../handlers/determineOS';
import { Button } from '../components/ui/button';

const Home = (): JSX.Element => {
  const theme = useTheme();
  const [downloadText, setDownloadText] = useState<string>('Download');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const stats = [
    { value: '10M+', label: 'Tasks Automated' },
    { value: '99.99%', label: 'Uptime' },
    { value: 'Unlimited', label: 'Cloud Storage' },
    { value: '24/7', label: 'Support' }
  ];

  const features = [
    {
      icon: <CloudIcon sx={{ fontSize: 48, color: '#71717a' }} />,
      title: 'AI-Powered Automation',
      description: 'Intelligent workflows that adapt and optimize themselves, reducing manual work by up to 80%.',
      highlight: 'Save 20+ hours/week'
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 48, color: '#71717a' }} />,
      title: 'Lightning Fast Processing',
      description: 'Process thousands of operations per second with our optimized cloud infrastructure.',
      highlight: '< 100ms response time'
    },
    {
      icon: <FlashOnIcon sx={{ fontSize: 48, color: '#71717a' }} />,
      title: 'Customer-Driven Development',
      description: 'We listen to your feedback and rapidly build the features you need. Your requests shape our roadmap.',
      highlight: 'Feature requests delivered fast'
    }
  ];

  useEffect(() => {
    determineOS(setDownloadText, setDownloadUrl);
  }, []);



  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };


  return (
    <Box sx={{ overflow: 'visible', background: '#000000' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'flex-start',
          position: 'relative',
          overflow: 'visible',
          pt: { xs: 6, md: 8 },
          background: '#000000',
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
        <Container maxWidth={false} sx={{ overflow: 'visible', px: { xs: 2, md: 0 }, width: '80%' }}>
          <Grid 
            container 
            spacing={0} 
            alignItems="center"
            justifyContent="flex-start"
            sx={{ 
              position: 'relative',
              minHeight: '70vh',
              overflow: 'visible',
              width: '100%'
            }}
          >
            {/* Text Content - Left Side */}
            <Grid item xs={12} md={4} sx={{ 
              position: 'relative', 
              zIndex: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: { xs: 'center', md: 'flex-start' },
              pl: { xs: 0, md: 2 }
            }}>
              <Box sx={{ 
                pr: { md: 6 }, 
                mb: { xs: 4, md: 0 }, 
                pt: { xs: 2, md: 4 },
                textAlign: { xs: 'center', md: 'left' },
                maxWidth: { xs: '100%', md: '450px' },
                ml: { xs: 0, md: 0 }
              }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '3rem', md: '4rem' },
                    fontWeight: 600,
                    lineHeight: 1.1,
                    color: '#ffffff',
                    mb: 4,
                    letterSpacing: '-0.02em',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Your AI-Powered <br />
                  <Box component="span" sx={{ 
                    color: '#a1a1aa',
                    fontWeight: 500,
                  }}>
                    Workflow Engine
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    color: '#a1a1aa',
                    lineHeight: 1.6,
                    mb: 5,
                    maxWidth: '600px',
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 400,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Transform your business operations with intelligent automation that learns, adapts, and scales with your needs.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => window.location.href = '/dashboard'}

                  >
                    Get Started for Free
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = '/features'}
                  >
                    Watch Demo
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Image - Right Side */}
            <Grid item xs={12} md={5} sx={{ 
              position: 'relative',
              height: { xs: '400px', md: '500px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: { xs: 0, md: 0 },
              overflow: 'visible',
            }}>
              {/* Gradient backdrop for depth */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xs: '120%', md: '100%' },
                  height: '90%',
                  background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(60px)',
                  zIndex: 0,
                }}
              />
              
              {/* Main image container with enhanced styling */}
              <Box sx={{ 
                position: 'absolute',
                left: { xs: '50%', md: '0%' },
                right: { xs: '-80%', md: '-60%' },
                top: '50%',
                transform: 'translateY(-50%) perspective(1000px) rotateY(-5deg) rotateX(1deg)',
                width: { xs: '180%', md: '150%' },
                height: 'auto',
                zIndex: 2,
                transformOrigin: 'center center',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-50%) perspective(1000px) rotateY(-2deg) rotateX(0.5deg) scale(1.02)',
                }
              }}>
                <Image
                  src={AppImage}
                  alt="AI-powered workflow automation platform interface"
                  width={1600}
                  height={900}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '16px',
                    filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.8)) drop-shadow(0 8px 32px rgba(255, 255, 255, 0.1))',
                    backgroundColor: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  }}
                  priority
                />
                
                {/* Subtle highlight overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                    borderRadius: '16px 16px 0 0',
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Grid>

            {/* Dense Floating Particle System - Surrounding the entire hero area */}
            {/* Left side particles */}
            <Box
              sx={{
                position: 'absolute',
                top: '15%',
                left: '5%',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.3)',
                filter: 'blur(0.5px)',
                animation: 'float 5s ease-in-out infinite',
                zIndex: 1,
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-15px)' },
                },
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '25%',
                left: '3%',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                filter: 'blur(0.8px)',
                animation: 'float 7s ease-in-out infinite 1s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '35%',
                left: '2%',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)',
                filter: 'blur(0.3px)',
                animation: 'float 4s ease-in-out infinite 2s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '4%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                filter: 'blur(1px)',
                animation: 'float 9s ease-in-out infinite reverse',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '65%',
                left: '6%',
                width: '2px',
                height: '2px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.5)',
                filter: 'blur(0.2px)',
                animation: 'float 3s ease-in-out infinite 0.5s',
                zIndex: 1,
              }}
            />

            {/* Right side particles - around and beyond the image */}
            <Box
              sx={{
                position: 'absolute',
                top: '12%',
                right: '2%',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                filter: 'blur(0.7px)',
                animation: 'float 6s ease-in-out infinite reverse 1.5s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '20%',
                right: '4%',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.18)',
                filter: 'blur(0.9px)',
                animation: 'float 8s ease-in-out infinite 2.5s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '35%',
                right: '1%',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.35)',
                filter: 'blur(0.4px)',
                animation: 'float 5s ease-in-out infinite reverse 4s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '55%',
                right: '3%',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                filter: 'blur(1.2px)',
                animation: 'float 10s ease-in-out infinite reverse 2s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '70%',
                right: '5%',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.45)',
                filter: 'blur(0.3px)',
                animation: 'float 4s ease-in-out infinite 1s',
                zIndex: 1,
              }}
            />

            {/* Top area particles */}
            <Box
              sx={{
                position: 'absolute',
                top: '8%',
                left: '20%',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.22)',
                filter: 'blur(0.8px)',
                animation: 'float 7s ease-in-out infinite 3.5s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '5%',
                left: '40%',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.28)',
                filter: 'blur(0.6px)',
                animation: 'float 6s ease-in-out infinite reverse 0.8s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                right: '35%',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.32)',
                filter: 'blur(0.5px)',
                animation: 'float 5s ease-in-out infinite 4.2s',
                zIndex: 1,
              }}
            />

            {/* Bottom area particles */}
            <Box
              sx={{
                position: 'absolute',
                bottom: '15%',
                left: '15%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.16)',
                filter: 'blur(1px)',
                animation: 'float 9s ease-in-out infinite reverse 1.8s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: '10%',
                left: '35%',
                width: '2px',
                height: '2px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.6)',
                filter: 'blur(0.2px)',
                animation: 'float 3s ease-in-out infinite 2.3s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: '8%',
                right: '25%',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.19)',
                filter: 'blur(0.9px)',
                animation: 'float 8s ease-in-out infinite 3.7s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: '12%',
                right: '15%',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.26)',
                filter: 'blur(0.7px)',
                animation: 'float 6s ease-in-out infinite 2.8s',
                zIndex: 1,
              }}
            />

            {/* Micro particles for density */}
            <Box
              sx={{
                position: 'absolute',
                top: '45%',
                left: '8%',
                width: '1px',
                height: '1px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.7)',
                animation: 'float 2s ease-in-out infinite 0.3s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '30%',
                right: '12%',
                width: '1px',
                height: '1px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.8)',
                animation: 'float 2s ease-in-out infinite reverse 1.1s',
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: '25%',
                left: '25%',
                width: '1px',
                height: '1px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                animation: 'float 2s ease-in-out infinite 1.7s',
                zIndex: 1,
              }}
            />
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ 
        py: { xs: 6, md: 8 },
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: { xs: '2.25rem', md: '3rem' },
                      fontWeight: 600,
                      color: '#ffffff',
                      mb: 1,
                      letterSpacing: '-0.025em',
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      color: '#a1a1aa',
                      fontWeight: 400,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: '#000000' }}>
        <Container maxWidth="lg">
          {/* Section Header */}
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
              Why Choose Banbury?
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
              Experience the power of AI-driven automation with features designed for modern businesses
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                      '& .feature-highlight': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
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
                  {/* Icon */}
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>

                  {/* Title */}
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
                    {feature.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    sx={{
                      color: '#a1a1aa',
                      lineHeight: 1.6,
                      mb: 3,
                      fontSize: '0.95rem',
                      fontWeight: 400,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    {feature.description}
                  </Typography>

                  {/* Highlight Badge */}
                  <Box
                    className="feature-highlight"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 3,
                      py: 1,
                      borderRadius: '50px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      opacity: 0.7,
                      transform: 'translateY(10px)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#3b82f6',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {feature.highlight}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          background: '#000000',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 600,
                mb: 4,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Ready to Transform Your Workflow?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                color: '#a1a1aa',
                mb: 6,
                lineHeight: 1.6,
                maxWidth: '600px',
                mx: 'auto',
                fontWeight: 400,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Join Banbury to automate your processes and boost productivity by 300%.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, justifyContent: 'center', mb: 6 }}>
              <Button
                variant="default"
                size="lg"
                onClick={() => window.location.href = '/dashboard'}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  px: 8,
                  py: 3,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                    background: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                Get Started for Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownload}
                sx={{
                  borderRadius: '16px',
                  py: 3,
                  px: 6,
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.05)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Watch Demo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

