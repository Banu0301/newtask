const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        preferences: req.user.preferences,
        bookmarks: req.user.bookmarks,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { categories, countries, language } = req.body;

    const validCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    const validCountries = ['us', 'gb', 'ca', 'au', 'in', 'de', 'fr', 'jp', 'cn', 'br'];
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'];

    // Validate categories
    if (categories && !Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories must be an array' });
    }
    if (categories && categories.some(cat => !validCategories.includes(cat))) {
      return res.status(400).json({ message: 'Invalid category provided' });
    }

    // Validate countries
    if (countries && !Array.isArray(countries)) {
      return res.status(400).json({ message: 'Countries must be an array' });
    }
    if (countries && countries.some(country => !validCountries.includes(country))) {
      return res.status(400).json({ message: 'Invalid country code provided' });
    }

    // Validate language
    if (language && !validLanguages.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code provided' });
    }

    // Update preferences
    const updateData = {};
    if (categories) updateData['preferences.categories'] = categories;
    if (countries) updateData['preferences.countries'] = countries;
    if (language) updateData['preferences.language'] = language;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add bookmark
router.post('/bookmarks', auth, async (req, res) => {
  try {
    const { title, description, url, urlToImage, source, publishedAt } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    // Check if article is already bookmarked
    const user = await User.findById(req.user._id);
    const existingBookmark = user.bookmarks.find(bookmark => bookmark.url === url);
    
    if (existingBookmark) {
      return res.status(400).json({ message: 'Article already bookmarked' });
    }

    // Add bookmark
    const bookmark = {
      title,
      description,
      url,
      urlToImage,
      source,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date()
    };

    user.bookmarks.push(bookmark);
    await user.save();

    res.status(201).json({
      message: 'Article bookmarked successfully',
      bookmark: user.bookmarks[user.bookmarks.length - 1]
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.user._id);
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const bookmarks = user.bookmarks
      .sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt))
      .slice(startIndex, endIndex);

    res.json({
      bookmarks,
      totalBookmarks: user.bookmarks.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(user.bookmarks.length / limit)
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove bookmark
router.delete('/bookmarks/:bookmarkId', auth, async (req, res) => {
  try {
    const { bookmarkId } = req.params;

    const user = await User.findById(req.user._id);
    const bookmarkIndex = user.bookmarks.findIndex(
      bookmark => bookmark._id.toString() === bookmarkId
    );

    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    user.bookmarks.splice(bookmarkIndex, 1);
    await user.save();

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
