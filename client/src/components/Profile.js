import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const [preferences, setPreferences] = useState({
    categories: [],
    countries: [],
    language: 'en'
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' }
  ];

  const countries = [
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

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ar', label: 'Arabic' }
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
      
      setPreferences({
        categories: user.preferences?.categories || [],
        countries: user.preferences?.countries || [],
        language: user.preferences?.language || 'en'
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences({
      ...preferences,
      [field]: value
    });
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/user/profile', {
        name: profileData.name.trim()
      });

      const updatedUser = { ...user, ...response.data.user };
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/user/preferences', preferences);

      const updatedUser = { 
        ...user, 
        preferences: response.data.preferences 
      };
      updateUser(updatedUser);
      setSuccess('Preferences updated successfully!');
    } catch (error) {
      console.error('Preferences update error:', error);
      setError(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (value) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  const getCountryLabel = (value) => {
    return countries.find(country => country.value === value)?.label || value;
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile Settings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your account and news preferences
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">Profile Information</Typography>
              </Box>

              <Box component="form" onSubmit={handleUpdateProfile}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={profileData.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                  >
                    Update Profile
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* News Preferences */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                News Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Customize your news feed by selecting your preferred categories, countries, and language
              </Typography>

              <Box component="form" onSubmit={handleUpdatePreferences}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Preferred Categories</InputLabel>
                      <Select
                        multiple
                        value={preferences.categories}
                        onChange={(e) => handlePreferenceChange('categories', e.target.value)}
                        input={<OutlinedInput label="Preferred Categories" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={getCategoryLabel(value)} size="small" />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Preferred Countries</InputLabel>
                      <Select
                        multiple
                        value={preferences.countries}
                        onChange={(e) => handlePreferenceChange('countries', e.target.value)}
                        input={<OutlinedInput label="Preferred Countries" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={getCountryLabel(value)} size="small" />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {countries.map((country) => (
                          <MenuItem key={country.value} value={country.value}>
                            {country.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={preferences.language}
                        label="Language"
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      >
                        {languages.map((language) => (
                          <MenuItem key={language.value} value={language.value}>
                            {language.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                  >
                    Update Preferences
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Account Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Member since
                  </Typography>
                  <Typography variant="body1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last login
                  </Typography>
                  <Typography variant="body1">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Profile;
