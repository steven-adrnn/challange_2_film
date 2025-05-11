import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { useNavigate, Routes, Route } from 'react-router-dom';
import FilmManagement from './FilmManagement';
import ArtistManagement from './ArtistManagement';
import GenreManagement from './GenreManagement';

const AdminDashboard = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => navigate('films')}>
          Manage Films
        </Button>
        <Button variant="contained" onClick={() => navigate('artists')}>
          Manage Artists
        </Button>
        <Button variant="contained" onClick={() => navigate('genres')}>
          Manage Genres
        </Button>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>

      <Routes>
        <Route path="films/*" element={<FilmManagement />} />
        <Route path="artists/*" element={<ArtistManagement />} />
        <Route path="genres/*" element={<GenreManagement />} />
      </Routes>
    </Box>
  );
};

export default AdminDashboard;
