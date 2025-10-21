import axios, { AxiosError } from 'axios'
import { CONFIG } from '../config/config'
import { ApiService } from './apiService'

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  email: string | null
  bio: string | null
  company: string | null
  location: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  clone_url: string
  language: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
  labels: Array<{
    id: number
    name: string
    color: string
  }>
  assignees: Array<{
    login: string
    avatar_url: string
  }>
  milestone: {
    title: string
    number: number
  } | null
  created_at: string
  updated_at: string
  closed_at: string | null
  repository?: {
    full_name: string
  }
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed' | 'merged'
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
    sha: string
  }
  merged: boolean
  merged_at: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  repository?: {
    full_name: string
  }
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
  author: {
    login: string
    avatar_url: string
  } | null
}

export interface GitHubConnectionStatus {
  connected: boolean
  username?: string
  scopes?: string[]
  expires_at?: string
}

export class GitHubService {
  private static baseURL = CONFIG.url

  /**
   * Check if user has connected their GitHub account
   */
  static async getConnectionStatus(): Promise<GitHubConnectionStatus> {
    try {
      const response = await ApiService.get<GitHubConnectionStatus>('/integrations/github/status/')
      return response
    } catch (error) {
      console.error('Failed to get GitHub connection status:', error)
      return { connected: false }
    }
  }

  /**
   * Initiate GitHub OAuth flow
   */
  static async initiateGitHubAuth(): Promise<{ success: boolean; authUrl?: string; error?: string }> {
    try {
      const redirectUri = typeof window !== 'undefined' 
        ? `${window.location.origin}/integrations/github/callback`
        : 'http://localhost:3000/integrations/github/callback'

      const response = await ApiService.get<{ 
        authUrl?: string
        error?: string
      }>(`/integrations/github/oauth/authorize/?redirect_uri=${encodeURIComponent(redirectUri)}`)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.authUrl) {
        return { success: true, authUrl: response.authUrl }
      } else {
        throw new Error('Failed to initiate GitHub login - no auth URL returned')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub login initiation failed'
      return { success: false, error: message }
    }
  }

  /**
   * Handle GitHub OAuth callback
   */
  static async handleGitHubCallback(code: string, state?: string): Promise<{
    success: boolean
    user?: GitHubUser
    error?: string
  }> {
    try {
      const redirectUri = typeof window !== 'undefined' 
        ? `${window.location.origin}/integrations/github/callback`
        : 'http://localhost:3000/integrations/github/callback'

      const params = new URLSearchParams()
      params.set('code', code)
      params.set('redirect_uri', redirectUri)
      if (state) params.set('state', state)

      const response = await ApiService.get<{
        success: boolean
        user?: GitHubUser
        error?: string
      }>(`/integrations/github/oauth/callback/?${params.toString()}`)

      if (response.success && response.user) {
        return {
          success: true,
          user: response.user
        }
      } else {
        throw new Error(response.error || 'GitHub authentication failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub OAuth callback failed'
      return { success: false, error: message }
    }
  }

  /**
   * Disconnect GitHub account
   */
  static async disconnectGitHub(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.delete<{ success: boolean; error?: string }>('/integrations/github/disconnect/')
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect GitHub'
      return { success: false, error: message }
    }
  }

  /**
   * Get authenticated user's profile
   */
  static async getUserProfile(): Promise<GitHubUser | null> {
    try {
      const response = await ApiService.get<GitHubUser>('/integrations/github/user/')
      return response
    } catch (error) {
      console.error('Failed to get GitHub user profile:', error)
      return null
    }
  }

  /**
   * Get user's repositories
   */
  static async getRepositories(params?: {
    type?: 'all' | 'owner' | 'member'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  }): Promise<GitHubRepository[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.type) queryParams.append('type', params.type)
      if (params?.sort) queryParams.append('sort', params.sort)
      if (params?.direction) queryParams.append('direction', params.direction)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())

      const response = await ApiService.get<GitHubRepository[]>(
        `/integrations/github/repositories/?${queryParams.toString()}`
      )
      return response
    } catch (error) {
      console.error('Failed to get GitHub repositories:', error)
      return []
    }
  }

  /**
   * Get repository details
   */
  static async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
    try {
      const response = await ApiService.get<GitHubRepository>(
        `/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/`
      )
      return response
    } catch (error) {
      console.error('Failed to get GitHub repository:', error)
      return null
    }
  }

  /**
   * Get issues across all repositories or for a specific repository
   */
  static async getIssues(params?: {
    owner?: string
    repo?: string
    state?: 'open' | 'closed' | 'all'
    labels?: string
    sort?: 'created' | 'updated' | 'comments'
    direction?: 'asc' | 'desc'
    since?: string
    per_page?: number
    page?: number
  }): Promise<GitHubIssue[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.state) queryParams.append('state', params.state)
      if (params?.labels) queryParams.append('labels', params.labels)
      if (params?.sort) queryParams.append('sort', params.sort)
      if (params?.direction) queryParams.append('direction', params.direction)
      if (params?.since) queryParams.append('since', params.since)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())

      let endpoint = '/integrations/github/issues/'
      if (params?.owner && params?.repo) {
        endpoint = `/integrations/github/repositories/${encodeURIComponent(params.owner)}/${encodeURIComponent(params.repo)}/issues/`
      }

      const response = await ApiService.get<GitHubIssue[]>(`${endpoint}?${queryParams.toString()}`)
      return response
    } catch (error) {
      console.error('Failed to get GitHub issues:', error)
      return []
    }
  }

  /**
   * Get pull requests across all repositories or for a specific repository
   */
  static async getPullRequests(params?: {
    owner?: string
    repo?: string
    state?: 'open' | 'closed' | 'all'
    head?: string
    base?: string
    sort?: 'created' | 'updated' | 'popularity' | 'long-running'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  }): Promise<GitHubPullRequest[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.state) queryParams.append('state', params.state)
      if (params?.head) queryParams.append('head', params.head)
      if (params?.base) queryParams.append('base', params.base)
      if (params?.sort) queryParams.append('sort', params.sort)
      if (params?.direction) queryParams.append('direction', params.direction)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())

      let endpoint = '/integrations/github/pulls/'
      if (params?.owner && params?.repo) {
        endpoint = `/integrations/github/repositories/${encodeURIComponent(params.owner)}/${encodeURIComponent(params.repo)}/pulls/`
      }

      const response = await ApiService.get<GitHubPullRequest[]>(`${endpoint}?${queryParams.toString()}`)
      return response
    } catch (error) {
      console.error('Failed to get GitHub pull requests:', error)
      return []
    }
  }

  /**
   * Get branches for a repository
   */
  static async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    try {
      const response = await ApiService.get<GitHubBranch[]>(
        `/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches/`
      )
      return response
    } catch (error) {
      console.error('Failed to get GitHub branches:', error)
      return []
    }
  }

  /**
   * Get commits for a repository
   */
  static async getCommits(owner: string, repo: string, params?: {
    sha?: string
    path?: string
    author?: string
    since?: string
    until?: string
    per_page?: number
    page?: number
  }): Promise<GitHubCommit[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.sha) queryParams.append('sha', params.sha)
      if (params?.path) queryParams.append('path', params.path)
      if (params?.author) queryParams.append('author', params.author)
      if (params?.since) queryParams.append('since', params.since)
      if (params?.until) queryParams.append('until', params.until)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())

      const response = await ApiService.get<GitHubCommit[]>(
        `/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/?${queryParams.toString()}`
      )
      return response
    } catch (error) {
      console.error('Failed to get GitHub commits:', error)
      return []
    }
  }

  /**
   * Search GitHub repositories, issues, code, etc.
   */
  static async search(params: {
    type: 'repositories' | 'issues' | 'code' | 'commits' | 'users'
    q: string
    sort?: string
    order?: 'asc' | 'desc'
    per_page?: number
    page?: number
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('q', params.q)
      if (params.sort) queryParams.append('sort', params.sort)
      if (params.order) queryParams.append('order', params.order)
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params.page) queryParams.append('page', params.page.toString())

      const response = await ApiService.get(
        `/integrations/github/search/${params.type}/?${queryParams.toString()}`
      )
      return response
    } catch (error) {
      console.error('Failed to search GitHub:', error)
      return null
    }
  }

  /**
   * Create an issue in a repository
   */
  static async createIssue(owner: string, repo: string, data: {
    title: string
    body?: string
    assignees?: string[]
    labels?: string[]
    milestone?: number
  }): Promise<GitHubIssue | null> {
    try {
      const response = await ApiService.post<GitHubIssue>(
        `/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/`,
        data
      )
      return response
    } catch (error) {
      console.error('Failed to create GitHub issue:', error)
      return null
    }
  }

  /**
   * Update an issue
   */
  static async updateIssue(owner: string, repo: string, issueNumber: number, data: {
    title?: string
    body?: string
    state?: 'open' | 'closed'
    assignees?: string[]
    labels?: string[]
    milestone?: number | null
  }): Promise<GitHubIssue | null> {
    try {
      const response = await ApiService.put<GitHubIssue>(
        `/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/`,
        data
      )
      return response
    } catch (error) {
      console.error('Failed to update GitHub issue:', error)
      return null
    }
  }

  /**
   * Get file content from a repository
   */
  static async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<{
    content: string
    encoding: string
    sha: string
    size: number
  } | null> {
    try {
      const queryParams = ref ? `?ref=${encodeURIComponent(ref)}` : ''
      const response = await ApiService.get<{
        content: string
        encoding: string
        sha: string
        size: number
      }>(`/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}${queryParams}`)
      return response
    } catch (error) {
      console.error('Failed to get GitHub file content:', error)
      return null
    }
  }
}