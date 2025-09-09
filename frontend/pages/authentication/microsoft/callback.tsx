import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { ApiService } from '../../../src/services/apiService';
import { ScopeService } from '../../../src/services/scopeService';

const MicrosoftAuthCallback = (): JSX.Element => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const handledRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;

    const code = router.query.code as string | undefined;
    const scope = router.query.scope as string | undefined;
    const urlError = router.query.error as string | undefined;

    // Guard: prevent double-calls in React Strict Mode or route re-mounts
    if (handledRef.current) return;
    if (!code && !urlError) return; // wait until params are present

    // Also guard by code value in sessionStorage (avoid reusing same code)
    const lastCode = typeof window !== 'undefined' ? sessionStorage.getItem('lastMicrosoftOAuthCode') : null;
    if (code && lastCode === code) return;

    handledRef.current = true;

    const handleCallback = async () => {
      if (urlError) {
        setStatus('error');
        setError(`Microsoft authentication failed: ${urlError}`);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received from Microsoft');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        // Persist code to avoid reuse
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastMicrosoftOAuthCode', code);
        }

        const result = await ApiService.handleOAuthCallback(code, scope, 'microsoft');

        if (result.success) {
          // Check if this was a scope activation callback
          const requestedFeatures = ScopeService.getRequestedFeatures();
          const requestedProvider = ScopeService.getRequestedProvider();
          
          if (requestedFeatures.length > 0 && requestedProvider === 'microsoft') {
            setStatus('success');
            ScopeService.clearRequestedFeatures();
            ScopeService.clearRequestedProvider();
            setTimeout(() => {
              router.replace('/dashboard?scopeActivated=true&provider=microsoft');
            }, 2000);
          } else {
            setStatus('success');
            router.replace('/dashboard');
          }
        } else {
          setStatus('error');
          setError('Microsoft OAuth callback succeeded but result was not successful');
          router.replace('/login');
        }
      } catch (err) {
        setStatus('error');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Microsoft OAuth callback failed: ${errorMessage}`);
        router.replace('/login');
      }
    };

    handleCallback();
  }, [router.isReady, router.query.code, router.query.error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Processing Microsoft Authentication</h2>
              <p className="text-gray-400">Please wait while we complete your Microsoft login...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Microsoft Authentication Successful</h2>
              <p className="text-gray-400">Redirecting you to the dashboard...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <p className="text-sm text-gray-500">You will be redirected to the login page shortly...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrosoftAuthCallback;