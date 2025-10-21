import { useState, useEffect } from 'react'
import { GitHubService, GitHubConnectionStatus, GitHubUser } from '../../../services/githubService'
import { Button } from '../../ui/button'
import { Github, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'

export function GitHubConnection() {
  const [connectionStatus, setConnectionStatus] = useState<GitHubConnectionStatus | null>(null)
  const [userProfile, setUserProfile] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const status = await GitHubService.getConnectionStatus()
      setConnectionStatus(status)
      
      if (status.connected) {
        const profile = await GitHubService.getUserProfile()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error)
      setError('Failed to check GitHub connection status')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const result = await GitHubService.initiateGitHubAuth()
      if (result.success && result.authUrl) {
        // Store return path for callback
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('githubAuthReturnPath', '/settings?tab=connections')
        }
        window.location.href = result.authUrl
      } else {
        setError(result.error || 'Failed to initiate GitHub authentication')
      }
    } catch (error) {
      console.error('Error connecting to GitHub:', error)
      setError('Failed to connect to GitHub')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account?')) {
      return
    }

    setActionLoading(true)
    setError(null)
    try {
      const result = await GitHubService.disconnectGitHub()
      if (result.success) {
        setConnectionStatus({ connected: false })
        setUserProfile(null)
      } else {
        setError(result.error || 'Failed to disconnect GitHub')
      }
    } catch (error) {
      console.error('Error disconnecting GitHub:', error)
      setError('Failed to disconnect GitHub')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {connectionStatus?.connected && userProfile ? (
        <div>
          {/* Connected State */}
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-400">GitHub account connected</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* User Profile */}
            <div className="flex items-start space-x-4 p-4 bg-zinc-800 rounded-lg">
              <img
                src={userProfile.avatar_url}
                alt={userProfile.login}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  {userProfile.name || userProfile.login}
                </h3>
                <p className="text-zinc-400 text-sm">@{userProfile.login}</p>
                {userProfile.bio && (
                  <p className="text-zinc-300 text-sm mt-1">{userProfile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                  <span>{userProfile.public_repos} repositories</span>
                  <span>{userProfile.followers} followers</span>
                  <span>{userProfile.following} following</span>
                </div>
              </div>
              <a
                href={`https://github.com/${userProfile.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Permissions */}
            {connectionStatus.scopes && connectionStatus.scopes.length > 0 && (
              <div className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {connectionStatus.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-md text-sm"
                    >
                      {scope.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end">
              <Button
                onClick={handleDisconnect}
                variant="outline"
                disabled={actionLoading}
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Disconnect GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Not Connected State */}
          <div className="p-6 bg-zinc-800 rounded-lg text-center">
            <Github className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Connect Your GitHub Account</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Connect your GitHub account to access repositories, issues, pull requests, and more directly from Banbury.
            </p>
            
            <div className="space-y-3 text-left max-w-sm mx-auto mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-zinc-300 text-sm">Access all your repositories and code</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-zinc-300 text-sm">View and manage issues and pull requests</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-zinc-300 text-sm">Let AI help with code reviews and documentation</p>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={actionLoading}
              className="bg-[#24292e] hover:bg-[#1b1f23] text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub Account
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}