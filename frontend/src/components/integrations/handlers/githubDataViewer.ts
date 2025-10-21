import { GitHubRepository, GitHubIssue, GitHubPullRequest } from '../../../services/githubService'

export function handleRepositorySelect(
  repo: GitHubRepository,
  onInsertToEditor?: (content: string) => void
) {
  // Format repository information for insertion
  const repoInfo = `
GitHub Repository: ${repo.full_name}
${repo.private ? '(Private)' : '(Public)'}

Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Not specified'}
Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count} | Open Issues: ${repo.open_issues_count}
Created: ${new Date(repo.created_at).toLocaleDateString()}
Last Updated: ${new Date(repo.updated_at).toLocaleDateString()}
URL: ${repo.html_url}
Clone URL: ${repo.clone_url}
`.trim()

  if (onInsertToEditor) {
    onInsertToEditor(repoInfo)
  }

  return repoInfo
}

export function handleIssueSelect(
  issue: GitHubIssue,
  onInsertToEditor?: (content: string) => void
) {
  // Format issue information for insertion
  const issueInfo = `
GitHub Issue #${issue.number}: ${issue.title}
Repository: ${issue.repository?.full_name || 'Unknown'}
Status: ${issue.state === 'open' ? '🟢 Open' : '🟣 Closed'}
Author: @${issue.user.login}
Created: ${new Date(issue.created_at).toLocaleDateString()}
${issue.labels.length > 0 ? `Labels: ${issue.labels.map(l => l.name).join(', ')}` : ''}
${issue.assignees.length > 0 ? `Assignees: ${issue.assignees.map(a => '@' + a.login).join(', ')}` : ''}

${issue.body || 'No description provided'}

URL: ${issue.html_url}
`.trim()

  if (onInsertToEditor) {
    onInsertToEditor(issueInfo)
  }

  return issueInfo
}

export function handlePullRequestSelect(
  pr: GitHubPullRequest,
  onInsertToEditor?: (content: string) => void
) {
  // Format pull request information for insertion
  const prInfo = `
GitHub Pull Request #${pr.number}: ${pr.title}
Repository: ${pr.repository?.full_name || 'Unknown'}
Status: ${pr.state === 'open' ? '🟢 Open' : pr.merged ? '🟣 Merged' : '🔴 Closed'}
Author: @${pr.user.login}
Branch: ${pr.head.ref} → ${pr.base.ref}
Created: ${new Date(pr.created_at).toLocaleDateString()}
${pr.merged ? `Merged: ${new Date(pr.merged_at!).toLocaleDateString()}` : ''}

${pr.body || 'No description provided'}

URL: ${pr.html_url}
`.trim()

  if (onInsertToEditor) {
    onInsertToEditor(prInfo)
  }

  return prInfo
}

export async function searchGitHubCode(
  query: string,
  repo?: string,
  language?: string
): Promise<string> {
  // This would use the GitHubService to search code
  // For now, return a placeholder
  return `Search for "${query}" in ${repo || 'all repositories'}${language ? ` (${language} files)` : ''}`
}

export function formatGitHubUrl(type: 'repo' | 'issue' | 'pr', owner: string, repo: string, number?: number): string {
  const baseUrl = `https://github.com/${owner}/${repo}`
  
  switch (type) {
    case 'repo':
      return baseUrl
    case 'issue':
      return `${baseUrl}/issues/${number}`
    case 'pr':
      return `${baseUrl}/pull/${number}`
    default:
      return baseUrl
  }
}