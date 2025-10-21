import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { GitHubService } from "../../../services/githubService"

// Tool to search GitHub repositories
export const searchGitHubReposTool = tool(
  async ({ query, sort, type }) => {
    try {
      const repos = await GitHubService.search({
        type: 'repositories',
        q: query,
        sort,
        order: 'desc',
        per_page: 10
      })
      
      if (!repos || !repos.items) {
        return "No repositories found"
      }

      const results = repos.items.map((repo: any) => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url,
        private: repo.private
      }))

      return JSON.stringify(results, null, 2)
    } catch (error) {
      return `Error searching repositories: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: "search_github_repos",
    description: "Search for GitHub repositories",
    schema: z.object({
      query: z.string().describe("Search query for repositories"),
      sort: z.enum(["stars", "forks", "updated", "created"]).optional().describe("Sort criteria"),
      type: z.enum(["all", "owner", "member"]).optional().describe("Filter by repository type")
    })
  }
)

// Tool to get user's repositories
export const getMyGitHubReposTool = tool(
  async ({ type, sort }) => {
    try {
      const repos = await GitHubService.getRepositories({
        type: type || 'all',
        sort: sort || 'updated',
        direction: 'desc',
        per_page: 20
      })

      if (!repos || repos.length === 0) {
        return "No repositories found"
      }

      const results = repos.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        private: repo.private,
        stars: repo.stargazers_count,
        language: repo.language,
        updated: repo.updated_at,
        url: repo.html_url
      }))

      return JSON.stringify(results, null, 2)
    } catch (error) {
      return `Error getting repositories: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: "get_my_github_repos",
    description: "Get the authenticated user's GitHub repositories",
    schema: z.object({
      type: z.enum(["all", "owner", "member"]).optional().describe("Filter by repository type"),
      sort: z.enum(["created", "updated", "pushed", "full_name"]).optional().describe("Sort criteria")
    })
  }
)

// Tool to get issues
export const getGitHubIssuesTool = tool(
  async ({ owner, repo, state, labels }) => {
    try {
      const issues = await GitHubService.getIssues({
        owner,
        repo,
        state: state || 'open',
        labels: labels?.join(','),
        sort: 'updated',
        direction: 'desc',
        per_page: 20
      })

      if (!issues || issues.length === 0) {
        return "No issues found"
      }

      const results = issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user.login,
        labels: issue.labels.map(l => l.name),
        created: issue.created_at,
        updated: issue.updated_at,
        url: issue.html_url,
        body: issue.body?.substring(0, 200) + (issue.body && issue.body.length > 200 ? '...' : '')
      }))

      return JSON.stringify(results, null, 2)
    } catch (error) {
      return `Error getting issues: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: "get_github_issues",
    description: "Get GitHub issues for a repository or all repositories",
    schema: z.object({
      owner: z.string().optional().describe("Repository owner (if getting issues for specific repo)"),
      repo: z.string().optional().describe("Repository name (if getting issues for specific repo)"),
      state: z.enum(["open", "closed", "all"]).optional().describe("Issue state filter"),
      labels: z.array(z.string()).optional().describe("Filter by labels")
    })
  }
)

// Tool to get pull requests
export const getGitHubPullRequestsTool = tool(
  async ({ owner, repo, state }) => {
    try {
      const prs = await GitHubService.getPullRequests({
        owner,
        repo,
        state: state || 'open',
        sort: 'updated',
        direction: 'desc',
        per_page: 20
      })

      if (!prs || prs.length === 0) {
        return "No pull requests found"
      }

      const results = prs.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user.login,
        branch: `${pr.head.ref} → ${pr.base.ref}`,
        merged: pr.merged,
        created: pr.created_at,
        updated: pr.updated_at,
        url: pr.html_url,
        body: pr.body?.substring(0, 200) + (pr.body && pr.body.length > 200 ? '...' : '')
      }))

      return JSON.stringify(results, null, 2)
    } catch (error) {
      return `Error getting pull requests: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: "get_github_pull_requests",
    description: "Get GitHub pull requests for a repository or all repositories",
    schema: z.object({
      owner: z.string().optional().describe("Repository owner (if getting PRs for specific repo)"),
      repo: z.string().optional().describe("Repository name (if getting PRs for specific repo)"),
      state: z.enum(["open", "closed", "all"]).optional().describe("Pull request state filter")
    })
  }
)

// Tool to create an issue
export const createGitHubIssueTool = tool(
  async ({ owner, repo, title, body, labels, assignees }) => {
    try {
      const issue = await GitHubService.createIssue(owner, repo, {
        title,
        body,
        labels,
        assignees
      })

      if (!issue) {
        return "Failed to create issue"
      }

      return JSON.stringify({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
        created: issue.created_at
      }, null, 2)
    } catch (error) {
      return `Error creating issue: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: "create_github_issue",
    description: "Create a new issue in a GitHub repository",
    schema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      title: z.string().describe("Issue title"),
      body: z.string().optional().describe("Issue description"),
      labels: z.array(z.string()).optional().describe("Labels to apply"),
      assignees: z.array(z.string()).optional().describe("Users to assign")
    })
  }
)

// Tool to get repository details
export const getGitHubRepoDetailsTool = tool(
  async ({ owner, repo }) => {
    try {
      const repository = await GitHubService.getRepository(owner, repo)

      if (!repository) {
        return "Repository not found"
      }

      const details = {
        name: repository.full_name,
        description: repository.description,
        private: repository.private,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        watchers: repository.watchers_count,
        issues: repository.open_issues_count,
        language: repository.language,
        created: repository.created_at,
        updated: repository.updated_at,
        pushed: repository.pushed_at,
        clone_url: repository.clone_url,
        url: repository.html_url,
        owner: {
          login: repository.owner.login,
          avatar: repository.owner.avatar_url
        }
      }

      return JSON.stringify(details, null, 2)
    } catch (error) {
      return `Error getting repository details: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: "get_github_repo_details",
    description: "Get detailed information about a specific GitHub repository",
    schema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name")
    })
  }
)

// Tool to search code
export const searchGitHubCodeTool = tool(
  async ({ query, language, repo }) => {
    try {
      // Build search query
      let searchQuery = query
      if (language) {
        searchQuery += ` language:${language}`
      }
      if (repo) {
        searchQuery += ` repo:${repo}`
      }

      const results = await GitHubService.search({
        type: 'code',
        q: searchQuery,
        per_page: 10
      })

      if (!results || !results.items || results.items.length === 0) {
        return "No code results found"
      }

      const codeResults = results.items.map((item: any) => ({
        name: item.name,
        path: item.path,
        repository: item.repository.full_name,
        url: item.html_url,
        sha: item.sha
      }))

      return JSON.stringify(codeResults, null, 2)
    } catch (error) {
      return `Error searching code: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: "search_github_code",
    description: "Search for code in GitHub repositories",
    schema: z.object({
      query: z.string().describe("Code search query"),
      language: z.string().optional().describe("Programming language filter"),
      repo: z.string().optional().describe("Search within specific repository (format: owner/repo)")
    })
  }
)

// Export all tools as an array
export const githubTools = [
  searchGitHubReposTool,
  getMyGitHubReposTool,
  getGitHubIssuesTool,
  getGitHubPullRequestsTool,
  createGitHubIssueTool,
  getGitHubRepoDetailsTool,
  searchGitHubCodeTool
]