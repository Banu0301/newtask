import React, { useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  OpenInNew,
  Share
} from '@mui/icons-material';

const NewsCard = ({ article, isBookmarked = false, onBookmarkChange }) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleBookmark = async () => {
    setLoading(true);
    try {
      if (bookmarked) {
        // Remove bookmark - we'll need the bookmark ID for this
        // For now, we'll implement add bookmark functionality
        setSnackbar({
          open: true,
          message: 'Bookmark removal not implemented yet',
          severity: 'info'
        });
      } else {
        // Add bookmark
        await axios.post('/user/bookmarks', {
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          source: article.source,
          publishedAt: article.publishedAt
        });
        
        setBookmarked(true);
        setSnackbar({
          open: true,
          message: 'Article bookmarked successfully!',
          severity: 'success'
        });
        
        if (onBookmarkChange) {
          onBookmarkChange(article, true);
        }
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to bookmark article',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(article.url);
        setSnackbar({
          open: true,
          message: 'Article URL copied to clipboard!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {article.urlToImage && (
          <CardMedia
            component="img"
            height="200"
            image={article.urlToImage}
            alt={article.title}
            sx={{ objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Chip
              label={article.source?.name || 'Unknown Source'}
              size="small"
              color="primary"
              variant="outlined"
            />
            <IconButton
              onClick={handleBookmark}
              disabled={loading}
              size="small"
              color="primary"
            >
              {bookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>

          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            {article.title}
          </Typography>

          {article.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                mb: 2
              }}
            >
              {article.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              {formatDate(article.publishedAt)}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<OpenInNew />}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ flexGrow: 1 }}
              >
                Read More
              </Button>
              
              <IconButton
                onClick={handleShare}
                size="small"
                color="primary"
              >
                <Share />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NewsCard;
