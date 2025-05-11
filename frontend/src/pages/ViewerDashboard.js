import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewerDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const limit = 10;

  const fetchFilms = async (query = '', pageNum = 1) => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        q: query,
        page: pageNum,
        limit,
        published: true
      };
      const response = await axios.get(`${API_BASE_URL}/films/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const filmsWithThumbnails = await Promise.all(
        response.data.films.map(async (film) => {
          if (film.thumbnail_path) {
            try {
              const thumbRes = await axios.get(
                `${API_BASE_URL}/films/${film.id}/thumbnail`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { ...film, thumbnailUrl: thumbRes.data.thumbnailUrl };
            } catch {
              return film;
            }
          }
          return film;
        })
      );
      setFilms(filmsWithThumbnails);
      setTotal(response.data.total);
      setPage(response.data.page);
    } catch (error) {
      console.error('Error fetching films:', error);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const handleSearch = () => {
    fetchFilms(searchQuery, 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleCardClick = (film) => {
    setSelectedFilm(film);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedFilm(null);
  };

  const handleWatchConfirm = () => {
    setOpenDialog(false);
    navigate(`/viewer-film/${selectedFilm.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Viewer Dashboard
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search films"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>
      <Stack spacing={2}>
        {films.map((film) => (
          <Card
            key={film.id}
            sx={{ display: 'flex', cursor: 'pointer' }}
            onClick={() => handleCardClick(film)}
          >
            {film.thumbnailUrl && (
              <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={film.thumbnailUrl}
                alt={film.title}
              />
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography component="div" variant="h5">
                  {film.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" component="div">
                  Duration: {film.duration} minutes
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div" noWrap>
                  {film.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div" noWrap>
                  Artists: {film.artists?.map((a) => a.name).join(', ') || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div" noWrap>
                  Genres: {film.genres?.map((g) => g.name).join(', ') || 'N/A'}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Stack>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Watch Film</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah ingin menonton film "{selectedFilm?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Tidak</Button>
          <Button onClick={handleWatchConfirm} variant="contained">
            Iya
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewerDashboard;
