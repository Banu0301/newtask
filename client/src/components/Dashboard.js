import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';
import NewsCard from './NewsCard';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Paper
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newsType, setNewsType] = useState('personalized'); // personalized, headlines, search

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' }
  ];

  const countries = [
    { value: '', label: 'All Countries' },
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'in', label: 'India' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'br', label: 'Brazil' }
  ];

  useEffect(() => {
    fetchNews();
  }, [currentPage, selectedCategory, selectedCountry, newsType]);

  const fetchNews = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      const params = {
        page: currentPage,
        pageSize: 12
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedCountry) params.country = selectedCountry;

      switch (newsType) {
        case 'personalized':
          response = await axios.get('/news/personalized', { params });
          break;
        case 'search':
          if (searchQuery.trim()) {
            params.q = searchQuery.trim();
            response = await axios.get('/news/search', { params });
          } else {
            response = await axios.get('/news/headlines', { params });
          }
          break;
        default:
          response = await axios.get('/news/headlines', { params });
      }

      const { articles, totalResults } = response.data;
      setNews(articles || []);
      setTotalPages(Math.ceil((totalResults || 0) / 12));
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error.response?.data?.message || 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setNewsType('search');
    setCurrentPage(1);
    fetchNews();
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchNews();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsTypeChange = (type) => {
    setNewsType(type);
    setCurrentPage(1);
    if (type !== 'search') {
      setSearchQuery('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Stay updated with the latest news
          </Typography>
        </Box>

        {/* News Type Selection */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Personalized"
              onClick={() => handleNewsTypeChange('personalized')}
              color={newsType === 'personalized' ? 'primary' : 'default'}
              variant={newsType === 'personalized' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Top Headlines"
              onClick={() => handleNewsTypeChange('headlines')}
              color={newsType === 'headlines' ? 'primary' : 'default'}
              variant={newsType === 'headlines' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Search"
              onClick={() => handleNewsTypeChange('search')}
              color={newsType === 'search' ? 'primary' : 'default'}
              variant={newsType === 'search' ? 'filled' : 'outlined'}
            />
          </Box>

          {/* Search and Filters */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleSearch}
                      disabled={loading}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      <Search />
                    </Button>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  label="Country"
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.value} value={country.value}>
                      {country.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleRefresh}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* News Grid */}
        {!loading && news.length > 0 && (
          <>
            <Grid container spacing={3}>
              {news.map((article, index) => (
                <Grid item xs={12} sm={6} md={4} key={`${article.url}-${index}`}>
                  <NewsCard article={article} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && news.length === 0 && !error && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No news articles found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search criteria or filters
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
