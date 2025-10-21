import { useState } from 'react'
import { Github, Search, GitBranch, GitPullRequest, AlertCircle } from 'lucide-react'
import { Button } from '../../../ui/button'
import { Input } from '../../../ui/input'
import { GitHubDataViewer } from '../../../integrations/GitHubDataViewer'
import { 
  handleRepositorySelect, 
  handleIssueSelect, 
  handlePullRequestSelect 
} from '../../../integrations/handlers/githubDataViewer'
import { GitHubRepository, GitHubIssue, GitHubPullRequest } from '../../../../services/githubService'

interface GitHubToolProps {
  onClose?: () => void
  onInsertToEditor?: (content: string) => void
}

export function GitHubTool({ onClose, onInsertToEditor }: GitHubToolProps) {
  const [selectedTab, setSelectedTab] = useState<'browse' | 'search'>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'repositories' | 'issues' | 'code'>('repositories')

  const handleRepoSelect = (repo: GitHubRepository) => {
    const content = handleRepositorySelect(repo, onInsertToEditor)
    console.log('Selected repository:', repo.full_name)
  }

  const handleIssueSelectWrapper = (issue: GitHubIssue) => {
    const content = handleIssueSelect(issue, onInsertToEditor)
    console.log('Selected issue:', issue.title)
  }

  const handlePRSelect = (pr: GitHubPullRequest) => {
    const content = handlePullRequestSelect(pr, onInsertToEditor)
    console.log('Selected PR:', pr.title)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg border border-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center">
          <Github className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-semibold">GitHub Integration</h3>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ×
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-700">
        <button
          onClick={() => setSelectedTab('browse')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            selectedTab === 'browse'
              ? 'text-white border-b-2 border-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setSelectedTab('search')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            selectedTab === 'search'
              ? 'text-white border-b-2 border-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Search
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === 'browse' ? (
          <GitHubDataViewer
            onSelectRepository={handleRepoSelect}
            onSelectIssue={handleIssueSelectWrapper}
            onSelectPullRequest={handlePRSelect}
          />
        ) : (
          <div className="p-4">
            <div className="space-y-4">
              {/* Search Type Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchType('repositories')}
                  className={`px-3 py-1 rounded text-sm ${
                    searchType === 'repositories'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Repositories
                </button>
                <button
                  onClick={() => setSearchType('issues')}
                  className={`px-3 py-1 rounded text-sm ${
                    searchType === 'issues'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Issues
                </button>
                <button
                  onClick={() => setSearchType('code')}
                  className={`px-3 py-1 rounded text-sm ${
                    searchType === 'code'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Code
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder={`Search ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Search Results */}
              <div className="text-center py-8">
                <p className="text-zinc-400">
                  Enter a search query to find {searchType} on GitHub
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Quick Actions */}
      <div className="p-4 border-t border-zinc-700">
        <div className="text-xs text-zinc-400 text-center">
          Click on any item to insert it into your conversation
        </div>
      </div>
    </div>
  )
}