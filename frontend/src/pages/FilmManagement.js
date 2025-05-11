import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  CardMedia,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FilmManagement = () => {
  const [films, setFilms] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    artistIds: [],
    genreIds: [],
    published: false,
    video: null,
    thumbnail: null,
  });
  const [error, setError] = useState('');
  const [watchDialogOpen, setWatchDialogOpen] = useState(false);
  const [selectedFilmToWatch, setSelectedFilmToWatch] = useState(null);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchFilms = async (query = '') => {
    setLoading(true);
    try {
      const params = {};
      if (query) {
        params.q = query;
      }
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
    } catch (err) {
      console.error('Error fetching films:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/artists`, axiosConfig);
      setArtists(response.data);
    } catch (err) {
      console.error('Error fetching artists:', err);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/genres`, axiosConfig);
      setGenres(response.data);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  useEffect(() => {
    fetchFilms(searchQuery);
    fetchArtists();
    fetchGenres();
  }, [searchQuery]);
  
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenDialog = (film = null) => {
    if (film) {
      setEditingFilm(film);
      setFormData({
        title: film.title,
        description: film.description || '',
        duration: film.duration,
        artistIds: film.artists ? film.artists.map((a) => a.id) : [],
        genreIds: film.genres ? film.genres.map((g) => g.id) : [],
        published: film.published,
        video: null,
        thumbnail: null,
      });
    } else {
      setEditingFilm(null);
      setFormData({
        title: '',
        description: '',
        duration: '',
        artistIds: [],
        genreIds: [],
        published: false,
        video: null,
        thumbnail: null,
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.duration) {
      setError('Title and duration are required');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('duration', formData.duration);
    data.append('published', formData.published);
    data.append('artistIds', JSON.stringify(formData.artistIds));
    data.append('genreIds', JSON.stringify(formData.genreIds));
    if (formData.video) {
      data.append('video', formData.video);
    }
    if (formData.thumbnail) {
      data.append('thumbnail', formData.thumbnail);
    }

    try {
      if (editingFilm) {
        await axios.put(`${API_BASE_URL}/films/${editingFilm.id}`, data, axiosConfig);
      } else {
        await axios.post(`${API_BASE_URL}/films`, data, axiosConfig);
      }
      fetchFilms();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving film:', err);
      setError(err.response?.data?.message || 'Failed to save film');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this film?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/films/${id}`, axiosConfig);
      fetchFilms();
    } catch (err) {
      console.error('Error deleting film:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Film Management
      </Typography>
      <TextField
        label="Search films"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchInputChange}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={() => handleOpenDialog()}>
        Add New Film
      </Button>
      {loading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thumbnail</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Artists</TableCell>
                <TableCell>Genres</TableCell>
                <TableCell>Published</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {films.map((film) => (
                <TableRow
                  key={film.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedFilmToWatch(film);
                    setWatchDialogOpen(true);
                  }}
                >
                  <TableCell>
                    {film.thumbnailUrl ? (
                      <CardMedia
                        component="img"
                        sx={{ width: 100, height: 60, objectFit: 'cover' }}
                        image={film.thumbnailUrl}
                        alt={film.title}
                      />
                    ) : (
                      'No Thumbnail'
                    )}
                  </TableCell>
                  <TableCell>{film.title}</TableCell>
                  <TableCell>{film.description}</TableCell>
                  <TableCell>{film.duration}</TableCell>
                  <TableCell>{film.artists?.map((a) => a.name).join(', ')}</TableCell>
                  <TableCell>{film.genres?.map((g) => g.name).join(', ')}</TableCell>
                  <TableCell>{film.published ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(film);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(film.id);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFilm ? 'Edit Film' : 'Add New Film'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Title"
            name="title"
            fullWidth
            required
            value={formData.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            label="Duration (minutes)"
            name="duration"
            type="number"
            fullWidth
            required
            value={formData.duration}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="artist-label">Artists</InputLabel>
            <Select
              labelId="artist-label"
              name="artistIds"
              multiple
              value={formData.artistIds}
              onChange={(e) => setFormData((prev) => ({ ...prev, artistIds: e.target.value }))}
              renderValue={(selected) =>
                artists.filter((a) => selected.includes(a.id)).map((a) => a.name).join(', ')
              }
            >
              {artists.map((artist) => (
                <MenuItem key={artist.id} value={artist.id}>
                  {artist.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="genre-label">Genres</InputLabel>
            <Select
              labelId="genre-label"
              name="genreIds"
              multiple
              value={formData.genreIds}
              onChange={(e) => setFormData((prev) => ({ ...prev, genreIds: e.target.value }))}
              renderValue={(selected) =>
                genres.filter((g) => selected.includes(g.id)).map((g) => g.name).join(', ')
              }
            >
              {genres.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl margin="normal">
            <InputLabel shrink>Published</InputLabel>
            <Select
              name="published"
              value={formData.published}
              onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.value === 'true' }))}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
          <Box mt={2}>
            <input
              accept="video/*"
              style={{ display: 'none' }}
              id="video-upload"
              type="file"
              name="video"
              onChange={handleInputChange}
            />
            <label htmlFor="video-upload">
              <Button variant="outlined" component="span">
                Upload Video
              </Button>
              {formData.video && <span style={{ marginLeft: 10 }}>{formData.video.name}</span>}
            </label>
          </Box>
          <Box mt={2}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="thumbnail-upload"
              type="file"
              name="thumbnail"
              onChange={handleInputChange}
            />
            <label htmlFor="thumbnail-upload">
              <Button variant="outlined" component="span">
                Upload Thumbnail
              </Button>
              {formData.thumbnail && <span style={{ marginLeft: 10 }}>{formData.thumbnail.name}</span>}
            </label>
          </Box>
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingFilm ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={watchDialogOpen} onClose={() => setWatchDialogOpen(false)}>
        <DialogTitle>Watch Film</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah kamu ingin menonton film "{selectedFilmToWatch?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWatchDialogOpen(false)}>Tidak</Button>
          <Button
            onClick={() => {
              setWatchDialogOpen(false);
              window.location.href = `/viewer-film/${selectedFilmToWatch.id}`;
            }}
            variant="contained"
          >
            Iya
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilmManagement;
