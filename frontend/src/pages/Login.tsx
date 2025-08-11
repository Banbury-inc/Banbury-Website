import GoogleIcon from '@mui/icons-material/Google';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { CONFIG } from '../config/config';
import { ApiService } from '../services/apiService';
import { AUTH_CONFIG } from '../services/authConfig';
import { DebugService } from '../services/debugService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Login = (): JSX.Element => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check API connectivity on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Run comprehensive API diagnostics
        const apiInfo = await DebugService.getApiInfo();
        
        if (apiInfo.connectivity.available) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
      }
    };

    checkApiHealth();
  }, []);

  // Check for registration success message
  useEffect(() => {
    if (router.query.registered === 'true') {
      setSuccess('Account created successfully! Please sign in with your credentials.');
    }
  }, [router.query.registered]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await ApiService.login(formData.username, formData.password);
      
      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Check if current domain is allowed for OAuth
      if (!AUTH_CONFIG.isAllowedDomain()) {
        setError(AUTH_CONFIG.getRedirectUriError());
        return;
      }

      const redirectUri = AUTH_CONFIG.getRedirectUri();
      
      const result = await ApiService.initiateGoogleAuth(redirectUri);
      
      if (result.success && result.authUrl) {
        window.location.href = result.authUrl;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-zinc-700 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
          </div>

          {apiStatus === 'offline' && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-sm">
                ⚠️ API Server appears to be offline. Please check your connection or try again later.
              </p>
              <p className="text-amber-400/70 text-xs mt-1">
                Attempting to connect to: {CONFIG.url}
              </p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              {apiStatus === 'offline' && (
                <p className="text-red-400/70 text-xs mt-1">
                  Note: This may be due to server connectivity issues.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-white focus:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-white focus:ring-white/20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => router.push('/register')}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white"
              >
                Sign up for free
              </Button>
              
              <Button
                type="submit"
                disabled={loading || apiStatus === 'offline'}
                className="flex-1 bg-white hover:bg-zinc-100 text-black"
              >
                {loading ? <CircularProgress size={16} className="text-black" /> : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-white hover:text-zinc-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-400 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;