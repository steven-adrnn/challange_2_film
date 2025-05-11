import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewerFilm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/films/${id}/video`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideoUrl(response.data.videoUrl);
      } catch (err) {
        setError('Failed to load video.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideoUrl();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading video...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/viewer-dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/viewer-dashboard')}>
        Back to Dashboard
      </Button>
      <video
        src={videoUrl}
        controls
        autoPlay
        style={{ width: '100%', maxHeight: '80vh' }}
      />
    </Box>
  );
};

export default ViewerFilm;
