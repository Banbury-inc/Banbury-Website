
import { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/apiService';

import { AppSidebar } from "../components/app-sidebar";
import { NavSidebar } from "../components/nav-sidebar";
import { TooltipProvider } from "../components/ui/tooltip";
import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { ImageViewer } from '../components/ImageViewer';
import { PDFViewer } from '../components/PDFViewer';
import { FileSystemItem } from '../utils/fileTreeUtils';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { Thread } from '../components/thread';



interface UserInfo {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  picture?: any;
  phone_number?: string;
  auth_method?: string;
}



const Workspaces = (): JSX.Element => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);

  // Helper functions to check file types
  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg']
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    return imageExtensions.includes(extension)
  };

  const isPdfFile = (fileName: string): boolean => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    return extension === '.pdf'
  };

  const isViewableFile = (fileName: string): boolean => {
    return isImageFile(fileName) || isPdfFile(fileName)
  };

  // Handle file selection from sidebar
  const handleFileSelect = (file: FileSystemItem) => {
    setSelectedFile(file);
  };

  const runtime = useLocalRuntime({
    async run({ messages }) {
      const lastMessage = messages[messages.length - 1];
      const userContent = lastMessage?.content?.[0]?.type === 'text' 
        ? lastMessage.content[0].text 
        : 'Hello';
      
      return {
        content: [
          {
            type: "text" as const,
            text: `You said: "${userContent}". This is a local runtime response!`,
          },
        ],
      };
    },
  });



  useEffect(() => {
    // Ensure dark mode is enabled
    window.localStorage.setItem('themeMode', 'dark');
    
    const checkAuthAndFetchUser = async () => {
      try {
        setLoading(true);
        
        // Validate token first using ApiService
        const isValidToken = await ApiService.validateToken();

        if (!isValidToken) {
          // Token is invalid, redirect to login
          navigate('/login');
          return;
        }

        // Token is valid, create user info from stored data
        const username = localStorage.getItem('authUsername') || localStorage.getItem('username');
        const basicUserInfo: UserInfo = {
          username: username || 'User',
          email: localStorage.getItem('userEmail') || username || '',
          first_name: '',
          last_name: '',
          picture: null
        };
        setUserInfo(basicUserInfo);
      } catch (err) {
        console.error('Auth check error:', err);
        // Still try to show basic info if we have some stored data
        const username = localStorage.getItem('authUsername') || localStorage.getItem('username');
        if (username) {
          const basicUserInfo: UserInfo = {
            username: username,
            email: localStorage.getItem('userEmail') || username,
            first_name: '',
            last_name: '',
            picture: null
          };
          setUserInfo(basicUserInfo);
        } else {
          navigate('/login');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchUser();
  }, [navigate]);

  const handleLogout = () => {
    // Clear all authentication data using ApiService
    ApiService.clearAuthToken();
    
    // Clear any additional session data
    localStorage.removeItem('deviceId');
    localStorage.removeItem('googleOAuthSession');
    localStorage.removeItem('userData');
    
    // Redirect to home page
    navigate('/');
  };



  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f5f5f5'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }



  return (
    <TooltipProvider>
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="flex h-screen bg-black">
          {/* Navigation Sidebar - Fixed */}
          <NavSidebar />
          
          {/* Main Content Area with Resizable Panels */}
          <div className="flex flex-1 ml-16">
            <Allotment>
              {/* File Sidebar Panel */}
              <Allotment.Pane minSize={200} preferredSize={280} maxSize={400}>
                <AppSidebar 
                  currentView="workspaces"
                  onLogout={handleLogout}
                  userInfo={userInfo}
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                />
              </Allotment.Pane>
              
              {/* Main Content Panel */}
              <Allotment.Pane minSize={300}>
                <main className="h-full bg-black">
                  {selectedFile && isImageFile(selectedFile.name) ? (
                    <ImageViewer file={selectedFile} userInfo={userInfo} />
                  ) : selectedFile && isPdfFile(selectedFile.name) ? (
                    <PDFViewer file={selectedFile} userInfo={userInfo} />
                  ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-md">
                          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Workspaces</h1>
                          <p className="text-gray-300 text-lg mb-6">
                            Your collaborative workspace environment is ready. Create, organize, and manage your projects with ease.
                          </p>
                          <p className="text-gray-400 text-sm">
                            {selectedFile && !isViewableFile(selectedFile.name) 
                              ? `Selected: ${selectedFile.name} (Preview not available for this file type)`
                              : 'Select an image or PDF file from the sidebar to view it here. The AI assistant is available in the right panel to help you with your work.'
                            }
                          </p>
                        </div>
                      </div>
                  )}
                </main>
              </Allotment.Pane>
              
              {/* Assistant Panel */}
              <Allotment.Pane minSize={250} preferredSize={350} maxSize={500}>
                <div className="h-full bg-black border-l border-gray-800">
                  <Thread />
                </div>
              </Allotment.Pane>
            </Allotment>
          </div>
        </div>
      </AssistantRuntimeProvider>
    </TooltipProvider>
  );
};
export default Workspaces;