import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/genres`, axiosConfig);
      setGenres(response.data);
    } catch (err) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleOpenDialog = (genre = null) => {
    if (genre) {
      setEditingGenre(genre);
      setName(genre.name);
    } else {
      setEditingGenre(null);
      setName('');
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      if (editingGenre) {
        await axios.put(`${API_BASE_URL}/genres/${editingGenre.id}`, { name }, axiosConfig);
      } else {
        await axios.post(`${API_BASE_URL}/genres`, { name }, axiosConfig);
      }
      fetchGenres();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving genre:', err);
      setError(err.response?.data?.message || 'Failed to save genre');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this genre?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/genres/${id}`, axiosConfig);
      fetchGenres();
    } catch (err) {
      console.error('Error deleting genre:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Genre Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpenDialog()}>
        Add New Genre
      </Button>
      {loading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {genres.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell>{genre.name}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(genre)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(genre.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGenre ? 'Edit Genre' : 'Add New Genre'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingGenre ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GenreManagement;
