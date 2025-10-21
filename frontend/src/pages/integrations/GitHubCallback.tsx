import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { GitHubService } from '../../services/githubService'

const GitHubCallback = (): JSX.Element => {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const handledRef = useRef(false)

  useEffect(() => {
    if (!router.isReady) return

    const code = router.query.code as string | undefined
    const state = router.query.state as string | undefined
    const urlError = router.query.error as string | undefined
    const errorDescription = router.query.error_description as string | undefined

    // Guard: prevent double-calls in React Strict Mode or route re-mounts
    if (handledRef.current) return
    if (!code && !urlError) return // wait until params are present

    // Also guard by code value in sessionStorage (avoid reusing same code)
    const lastCode = typeof window !== 'undefined' ? sessionStorage.getItem('lastGitHubOAuthCode') : null
    if (code && lastCode === code) return

    handledRef.current = true

    const handleCallback = async () => {
      if (urlError) {
        setStatus('error')
        setError(`GitHub authentication failed: ${errorDescription || urlError}`)
        setTimeout(() => router.push('/settings?tab=integrations'), 3000)
        return
      }

      if (!code) {
        setStatus('error')
        setError('No authorization code received from GitHub')
        setTimeout(() => router.push('/settings?tab=integrations'), 3000)
        return
      }

      try {
        // Persist code to avoid reuse
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastGitHubOAuthCode', code)
        }

        const result = await GitHubService.handleGitHubCallback(code, state)

        if (result.success) {
          setStatus('success')
          // Check if this was from settings page or workspaces
          const returnTo = state || '/settings?tab=integrations'
          setTimeout(() => {
            router.replace(`${returnTo}${returnTo.includes('?') ? '&' : '?'}githubConnected=true`)
          }, 2000)
        } else {
          setStatus('error')
          setError(result.error || 'GitHub authentication failed')
          setTimeout(() => router.push('/settings?tab=integrations'), 3000)
        }
      } catch (err) {
        setStatus('error')
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(`GitHub OAuth callback failed: ${errorMessage}`)
        setTimeout(() => router.push('/settings?tab=integrations'), 3000)
      }
    }

    handleCallback()
  }, [router.isReady, router.query.code, router.query.error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="text-center max-w-sm">
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h2 className="text-white text-lg mb-1">Connecting to GitHub</h2>
            <p className="text-zinc-400 text-sm">Please wait while we complete the connection...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-2">✓</div>
            <h2 className="text-green-500 text-lg mb-1">GitHub Connected Successfully!</h2>
            <p className="text-zinc-400 text-sm">
              Your GitHub account has been connected. Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-2">✗</div>
            <h2 className="text-red-500 text-lg mb-1">Connection Failed</h2>
            <div className="text-red-400 text-sm mb-2">{error}</div>
            <p className="text-zinc-400 text-sm">Redirecting to settings...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default GitHubCallback