const axios = require('axios');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseURL = 'https://newsapi.org/v2';
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  // Generate cache key
  generateCacheKey(endpoint, params) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  // Check if cache is valid
  isCacheValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < this.cacheTimeout;
  }

  // Get cached data or fetch new
  async getCachedOrFetch(endpoint, params) {
    const cacheKey = this.generateCacheKey(endpoint, params);
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && this.isCacheValid(cachedData)) {
      return cachedData.data;
    }

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          ...params,
          apiKey: this.apiKey
        }
      });

      const data = response.data;
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('NewsAPI Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch news');
    }
  }

  // Get top headlines
  async getTopHeadlines(options = {}) {
    const params = {
      pageSize: options.pageSize || 20,
      page: options.page || 1
    };

    if (options.category) params.category = options.category;
    if (options.country) params.country = options.country;
    if (options.sources) params.sources = options.sources;
    if (options.q) params.q = options.q;

    return await this.getCachedOrFetch('/top-headlines', params);
  }

  // Search everything
  async searchEverything(options = {}) {
    const params = {
      pageSize: options.pageSize || 20,
      page: options.page || 1,
      sortBy: options.sortBy || 'publishedAt'
    };

    if (options.q) params.q = options.q;
    if (options.sources) params.sources = options.sources;
    if (options.domains) params.domains = options.domains;
    if (options.from) params.from = options.from;
    if (options.to) params.to = options.to;
    if (options.language) params.language = options.language;

    return await this.getCachedOrFetch('/everything', params);
  }

  // Get sources
  async getSources(options = {}) {
    const params = {};
    
    if (options.category) params.category = options.category;
    if (options.language) params.language = options.language;
    if (options.country) params.country = options.country;

    return await this.getCachedOrFetch('/sources', params);
  }

  // Get personalized news based on user preferences
  async getPersonalizedNews(userPreferences, options = {}) {
    const { categories, countries, language } = userPreferences;
    
    try {
      // Get news from preferred categories and countries
      const newsPromises = [];
      
      // Get headlines for each preferred category and country combination
      for (const category of categories.slice(0, 3)) { // Limit to 3 categories
        for (const country of countries.slice(0, 2)) { // Limit to 2 countries
          newsPromises.push(
            this.getTopHeadlines({
              category,
              country,
              pageSize: 10,
              page: 1
            })
          );
        }
      }

      const results = await Promise.allSettled(newsPromises);
      const articles = [];

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.articles) {
          articles.push(...result.value.articles);
        }
      });

      // Remove duplicates based on URL
      const uniqueArticles = articles.filter((article, index, self) =>
        index === self.findIndex(a => a.url === article.url)
      );

      // Sort by published date
      uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      return {
        status: 'ok',
        totalResults: uniqueArticles.length,
        articles: uniqueArticles.slice(0, options.pageSize || 20)
      };
    } catch (error) {
      console.error('Personalized news error:', error);
      throw error;
    }
  }
}

module.exports = new NewsService();
