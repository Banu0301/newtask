const express = require('express');
const newsService = require('../services/newsService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get top headlines
router.get('/headlines', async (req, res) => {
  try {
    const {
      category,
      country,
      sources,
      q,
      pageSize,
      page
    } = req.query;

    const options = {
      category,
      country,
      sources,
      q,
      pageSize: parseInt(pageSize) || 20,
      page: parseInt(page) || 1
    };

    const news = await newsService.getTopHeadlines(options);
    res.json(news);
  } catch (error) {
    console.error('Headlines error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search everything
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      sources,
      domains,
      from,
      to,
      language,
      sortBy,
      pageSize,
      page
    } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const options = {
      q,
      sources,
      domains,
      from,
      to,
      language,
      sortBy,
      pageSize: parseInt(pageSize) || 20,
      page: parseInt(page) || 1
    };

    const news = await newsService.searchEverything(options);
    res.json(news);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get news sources
router.get('/sources', async (req, res) => {
  try {
    const { category, language, country } = req.query;
    
    const options = {
      category,
      language,
      country
    };

    const sources = await newsService.getSources(options);
    res.json(sources);
  } catch (error) {
    console.error('Sources error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get personalized news (requires authentication)
router.get('/personalized', auth, async (req, res) => {
  try {
    const { pageSize, page } = req.query;
    
    const options = {
      pageSize: parseInt(pageSize) || 20,
      page: parseInt(page) || 1
    };

    const news = await newsService.getPersonalizedNews(req.user.preferences, options);
    res.json(news);
  } catch (error) {
    console.error('Personalized news error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { country, pageSize, page } = req.query;

    const validCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const options = {
      category,
      country,
      pageSize: parseInt(pageSize) || 20,
      page: parseInt(page) || 1
    };

    const news = await newsService.getTopHeadlines(options);
    res.json(news);
  } catch (error) {
    console.error('Category news error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get news by country
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { category, pageSize, page } = req.query;

    const validCountries = ['us', 'gb', 'ca', 'au', 'in', 'de', 'fr', 'jp', 'cn', 'br'];
    
    if (!validCountries.includes(country)) {
      return res.status(400).json({ message: 'Invalid country code' });
    }

    const options = {
      country,
      category,
      pageSize: parseInt(pageSize) || 20,
      page: parseInt(page) || 1
    };

    const news = await newsService.getTopHeadlines(options);
    res.json(news);
  } catch (error) {
    console.error('Country news error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
