import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Delete,
  OpenInNew,
  Share
} from '@mui/icons-material';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bookmark: null });

  useEffect(() => {
    fetchBookmarks();
  }, [currentPage]);

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/user/bookmarks', {
        params: {
          page: currentPage,
          limit: 12
        }
      });

      const { bookmarks, totalPages } = response.data;
      setBookmarks(bookmarks || []);
      setTotalPages(totalPages || 1);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError(error.response?.data?.message || 'Failed to fetch bookmarks');
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await axios.delete(`/user/bookmarks/${bookmarkId}`);
      
      // Remove bookmark from local state
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== bookmarkId));
      
      // If this was the last bookmark on the page and we're not on page 1, go back a page
      if (bookmarks.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchBookmarks(); // Refresh to get updated pagination
      }
      
      setDeleteDialog({ open: false, bookmark: null });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      setError(error.response?.data?.message || 'Failed to delete bookmark');
    }
  };

  const handleShare = async (bookmark) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookmark.title,
          text: bookmark.description,
          url: bookmark.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(bookmark.url);
        // You could add a snackbar here to show success
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const openDeleteDialog = (bookmark) => {
    setDeleteDialog({ open: true, bookmark });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, bookmark: null });
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Bookmarks
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Articles you've saved for later reading
          </Typography>
        </Box>

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

        {/* Bookmarks Grid */}
        {!loading && bookmarks.length > 0 && (
          <>
            <Grid container spacing={3}>
              {bookmarks.map((bookmark) => (
                <Grid item xs={12} sm={6} md={4} key={bookmark._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {bookmark.urlToImage && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={bookmark.urlToImage}
                        alt={bookmark.title}
                        sx={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Chip
                          label={bookmark.source?.name || 'Unknown Source'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <IconButton
                          onClick={() => openDeleteDialog(bookmark)}
                          size="small"
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {bookmark.title}
                      </Typography>

                      {bookmark.description && (
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
                          {bookmark.description}
                        </Typography>
                      )}

                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Bookmarked: {formatDate(bookmark.bookmarkedAt)}
                        </Typography>
                        
                        {bookmark.publishedAt && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Published: {formatDate(bookmark.publishedAt)}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<OpenInNew />}
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ flexGrow: 1 }}
                          >
                            Read Article
                          </Button>
                          
                          <IconButton
                            onClick={() => handleShare(bookmark)}
                            size="small"
                            color="primary"
                          >
                            <Share />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
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

        {/* No Bookmarks */}
        {!loading && bookmarks.length === 0 && !error && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No bookmarks yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start bookmarking articles from the dashboard to see them here
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={closeDeleteDialog}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            Remove Bookmark
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove this bookmark? This action cannot be undone.
            </Typography>
            {deleteDialog.bookmark && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{deleteDialog.bookmark.title}"
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button
              onClick={() => handleDeleteBookmark(deleteDialog.bookmark._id)}
              color="error"
              variant="contained"
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Bookmarks;
