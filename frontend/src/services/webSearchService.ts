export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
}

export class WebSearchService {
  /**
   * Searches the web using multiple strategies:
   * 1. Try DuckDuckGo instant answers API for specific queries
   * 2. Fall back to intelligent results that include real search links
   */
  static async searchWeb(query: string): Promise<WebSearchResponse> {
    try {
      // Try DuckDuckGo instant answers first
      const instantResults = await this.searchDuckDuckGoInstant(query);
      
      // If we got good results from instant answers, return them
      if (instantResults.results.length > 1) {
        return instantResults;
      }
      
      // If instant answers didn't return much, enhance with intelligent results
      const intelligentResults = this.getIntelligentResults(query);
      
      // Combine instant answers with intelligent results
      return {
        results: [
          ...instantResults.results,
          ...intelligentResults.results.slice(0, 4 - instantResults.results.length)
        ].slice(0, 5),
        query
      };
      
    } catch (error) {
      console.warn('DuckDuckGo instant answers failed:', error);
      
      // Fall back to intelligent results
      return this.getIntelligentResults(query);
    }
  }



  /**
   * Searches using DuckDuckGo instant answers API
   */
  private static async searchDuckDuckGoInstant(query: string): Promise<WebSearchResponse> {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );

    if (!response.ok) {
      throw new Error(`DuckDuckGo API returned ${response.status}`);
    }

    const data = await response.json();
    const results: WebSearchResult[] = [];
    
    // Add abstract if available
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || data.AbstractSource || 'DuckDuckGo Result',
        url: data.AbstractURL,
        snippet: data.Abstract
      });
    }

    // Add instant answer if available
    if (data.Answer && data.AnswerType) {
      results.push({
        title: `Instant Answer: ${data.AnswerType}`,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: data.Answer
      });
    }

    // Add official results
    if (data.Results && Array.isArray(data.Results)) {
      data.Results.slice(0, 2).forEach((result: any) => {
        if (result.Text && result.FirstURL) {
          results.push({
            title: result.Text,
            url: result.FirstURL,
            snippet: result.Text
          });
        }
      });
    }

    // Add related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 2).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related Topic',
            url: topic.FirstURL,
            snippet: topic.Text
          });
        }
      });
    }

    if (results.length === 0) {
      throw new Error('No results from DuckDuckGo instant answers');
    }

    return {
      results,
      query
    };
  }





  /**
   * Provides intelligent search results based on query analysis
   */
  private static getIntelligentResults(query: string): WebSearchResponse {
    const results: WebSearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Primary search result - DuckDuckGo
    results.push({
      title: `"${query}" - Web Search Results`,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: `Comprehensive search results for "${query}" on DuckDuckGo. Privacy-focused search engine with no tracking.`
    });

    // Context-specific results based on query type
    if (this.isTechQuery(queryLower)) {
      results.push({
        title: `${query} - Developer Resources`,
        url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Programming discussions, solutions, and code examples for ${query} from the Stack Overflow community.`
      });

      results.push({
        title: `${query} - Official Documentation`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query + ' official documentation site:docs')}`,
        snippet: `Official documentation, API references, and guides for ${query}.`
      });

      // Add GitHub for open source projects
      results.push({
        title: `${query} - GitHub Projects`,
        url: `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`,
        snippet: `Open source projects, libraries, and code repositories related to ${query} on GitHub.`
      });
    }

    else if (this.isNewsQuery(queryLower)) {
      results.push({
        title: `Breaking News: ${query}`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
        snippet: `Latest breaking news, articles, and updates about ${query} from multiple news sources.`
      });

      results.push({
        title: `${query} - Reddit Discussions`,
        url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=top&t=week`,
        snippet: `Community discussions and real-time reactions about ${query} on Reddit.`
      });
    }

    else if (this.isAcademicQuery(queryLower)) {
      results.push({
        title: `Academic Papers: ${query}`,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
        snippet: `Peer-reviewed academic papers, theses, and research publications about ${query}.`
      });

      results.push({
        title: `${query} - Research Gate`,
        url: `https://www.researchgate.net/search/publication?q=${encodeURIComponent(query)}`,
        snippet: `Scientific publications and research discussions about ${query} on ResearchGate.`
      });
    }

    else if (this.isShoppingQuery(queryLower)) {
      results.push({
        title: `Shop for ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`,
        snippet: `Compare prices and find the best deals for ${query} across multiple retailers.`
      });

      results.push({
        title: `${query} - Amazon`,
        url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
        snippet: `Browse and purchase ${query} on Amazon with customer reviews and fast shipping.`
      });
    }

    else {
      // General knowledge queries
      results.push({
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        snippet: `Comprehensive encyclopedia article about ${query} with detailed information and references.`
      });

      results.push({
        title: `${query} - YouTube`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        snippet: `Educational videos, tutorials, and content related to ${query} on YouTube.`
      });
    }

    // Always include Google as the final comprehensive option
    results.push({
      title: `"${query}" - Google Search`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Complete web search results for "${query}" with the most comprehensive coverage available.`
    });

    return {
      results: results.slice(0, 5), // Limit to 5 results for clean display
      query
    };
  }

  /**
   * Determines if a query is tech/programming related
   */
  private static isTechQuery(query: string): boolean {
    const techKeywords = [
      'javascript', 'python', 'react', 'node', 'css', 'html', 'api', 'function',
      'programming', 'code', 'error', 'bug', 'framework', 'library', 'npm',
      'git', 'github', 'typescript', 'java', 'c++', 'algorithm', 'database'
    ];
    return techKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Determines if a query is news related
   */
  private static isNewsQuery(query: string): boolean {
    const newsKeywords = [
      'news', 'latest', 'breaking', 'today', 'current', 'recent', 'update',
      'happened', 'politics', 'election', 'covid', 'weather', 'stock'
    ];
    return newsKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Determines if a query is academic/research related
   */
  private static isAcademicQuery(query: string): boolean {
    const academicKeywords = [
      'research', 'study', 'paper', 'thesis', 'theory', 'analysis', 'journal',
      'academic', 'university', 'science', 'experiment', 'hypothesis'
    ];
    return academicKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Determines if a query is shopping related
   */
  private static isShoppingQuery(query: string): boolean {
    const shoppingKeywords = [
      'buy', 'purchase', 'shop', 'price', 'deal', 'sale', 'discount', 'cheap',
      'best', 'review', 'compare', 'store', 'online', 'order', 'delivery'
    ];
    return shoppingKeywords.some(keyword => query.includes(keyword));
  }


}
