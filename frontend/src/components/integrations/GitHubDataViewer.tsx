import { useState, useEffect } from 'react'
import { 
  GitHubService, 
  GitHubRepository, 
  GitHubIssue, 
  GitHubPullRequest,
  GitHubConnectionStatus 
} from '../../services/githubService'
import { 
  Github, 
  GitBranch, 
  GitPullRequest, 
  AlertCircle, 
  Star,
  Eye,
  GitFork,
  Clock,
  ExternalLink,
  Loader2,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface GitHubDataViewerProps {
  onSelectRepository?: (repo: GitHubRepository) => void
  onSelectIssue?: (issue: GitHubIssue) => void
  onSelectPullRequest?: (pr: GitHubPullRequest) => void
}

export function GitHubDataViewer({ 
  onSelectRepository,
  onSelectIssue,
  onSelectPullRequest
}: GitHubDataViewerProps) {
  const [connectionStatus, setConnectionStatus] = useState<GitHubConnectionStatus | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('repositories')
  const [searchQuery, setSearchQuery] = useState('')
  const [repoFilter, setRepoFilter] = useState<'all' | 'owner' | 'member'>('all')
  const [issueState, setIssueState] = useState<'open' | 'closed' | 'all'>('open')
  const [prState, setPrState] = useState<'open' | 'closed' | 'all'>('open')

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (connectionStatus?.connected) {
      if (activeTab === 'repositories') {
        loadRepositories()
      } else if (activeTab === 'issues') {
        loadIssues()
      } else if (activeTab === 'pull-requests') {
        loadPullRequests()
      }
    }
  }, [activeTab, repoFilter, issueState, prState])

  const checkConnection = async () => {
    try {
      const status = await GitHubService.getConnectionStatus()
      setConnectionStatus(status)
      if (status.connected) {
        loadRepositories()
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRepositories = async () => {
    setLoading(true)
    try {
      const repos = await GitHubService.getRepositories({
        type: repoFilter,
        sort: 'updated',
        direction: 'desc',
        per_page: 30
      })
      setRepositories(repos)
    } catch (error) {
      console.error('Error loading repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadIssues = async () => {
    setLoading(true)
    try {
      const issuesList = await GitHubService.getIssues({
        state: issueState,
        sort: 'updated',
        direction: 'desc',
        per_page: 30
      })
      setIssues(issuesList)
    } catch (error) {
      console.error('Error loading issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPullRequests = async () => {
    setLoading(true)
    try {
      const prList = await GitHubService.getPullRequests({
        state: prState,
        sort: 'updated',
        direction: 'desc',
        per_page: 30
      })
      setPullRequests(prList)
    } catch (error) {
      console.error('Error loading pull requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes} minutes ago`
      }
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 30) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (!connectionStatus?.connected) {
    return (
      <div className="p-8 text-center">
        <Github className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">Connect Your GitHub Account</h3>
        <p className="text-zinc-400 mb-4">
          Connect your GitHub account to access your repositories and collaborate with AI.
        </p>
        <Button 
          onClick={() => window.location.href = '/settings?tab=connections'}
          className="bg-[#24292e] hover:bg-[#1b1f23] text-white"
        >
          <Github className="h-4 w-4 mr-2" />
          Connect GitHub
        </Button>
      </div>
    )
  }

  const filteredRepositories = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.body?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  const filteredPullRequests = pullRequests.filter(pr =>
    pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pr.body?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Github className="h-5 w-5 mr-2" />
            GitHub
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-zinc-900 border-b border-zinc-700 rounded-none">
          <TabsTrigger value="repositories" className="data-[state=active]:bg-zinc-800">
            Repositories
          </TabsTrigger>
          <TabsTrigger value="issues" className="data-[state=active]:bg-zinc-800">
            Issues
          </TabsTrigger>
          <TabsTrigger value="pull-requests" className="data-[state=active]:bg-zinc-800">
            Pull Requests
          </TabsTrigger>
        </TabsList>

        {/* Repositories Tab */}
        <TabsContent value="repositories" className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <Select value={repoFilter} onValueChange={(value: any) => setRepoFilter(value)}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter repositories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                <SelectItem value="owner">My Repositories</SelectItem>
                <SelectItem value="member">Member Of</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer transition-colors"
                  onClick={() => onSelectRepository?.(repo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold flex items-center">
                        {repo.private && (
                          <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded mr-2">
                            Private
                          </span>
                        )}
                        {repo.full_name}
                      </h3>
                      {repo.description && (
                        <p className="text-zinc-400 text-sm mt-1">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                        {repo.language && (
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center">
                          <GitFork className="h-3 w-3 mr-1" />
                          {repo.forks_count}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(repo.updated_at)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white ml-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <Select value={issueState} onValueChange={(value: any) => setIssueState(value)}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter issues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Issues</SelectItem>
                <SelectItem value="closed">Closed Issues</SelectItem>
                <SelectItem value="all">All Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer transition-colors"
                  onClick={() => onSelectIssue?.(issue)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'
                        }`} />
                        {issue.title}
                      </h3>
                      {issue.repository && (
                        <p className="text-zinc-500 text-sm">{issue.repository.full_name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {issue.labels.map((label) => (
                          <span
                            key={label.id}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `#${label.color}20`,
                              color: `#${label.color}`,
                              border: `1px solid #${label.color}40`
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                        <span>#{issue.number}</span>
                        <span>by {issue.user.login}</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(issue.updated_at)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white ml-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pull Requests Tab */}
        <TabsContent value="pull-requests" className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <Select value={prState} onValueChange={(value: any) => setPrState(value)}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter PRs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open PRs</SelectItem>
                <SelectItem value="closed">Closed PRs</SelectItem>
                <SelectItem value="all">All PRs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPullRequests.map((pr) => (
                <div
                  key={pr.id}
                  className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer transition-colors"
                  onClick={() => onSelectPullRequest?.(pr)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold flex items-center">
                        <GitPullRequest className={`h-4 w-4 mr-2 ${
                          pr.state === 'open' ? 'text-green-500' : 
                          pr.merged ? 'text-purple-500' : 'text-red-500'
                        }`} />
                        {pr.title}
                      </h3>
                      {pr.repository && (
                        <p className="text-zinc-500 text-sm">{pr.repository.full_name}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                        <span>#{pr.number}</span>
                        <span>by {pr.user.login}</span>
                        <span>{pr.head.ref} → {pr.base.ref}</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(pr.updated_at)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white ml-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}