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


const ArtistManagement = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/artists`, axiosConfig);
      setArtists(response.data);
    } catch (err) {
      console.error('Error fetching artists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleOpenDialog = (artist = null) => {
    if (artist) {
      setEditingArtist(artist);
      setName(artist.name);
    } else {
      setEditingArtist(null);
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
      if (editingArtist) {
        await axios.put(`${API_BASE_URL}/artists/${editingArtist.id}`, { name }, axiosConfig);
      } else {
        await axios.post(`${API_BASE_URL}/artists`, { name }, axiosConfig);
      }
      fetchArtists();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving artist:', err);
      setError(err.response?.data?.message || 'Failed to save artist');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artist?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/artists/${id}`, axiosConfig);
      fetchArtists();
    } catch (err) {
      console.error('Error deleting artist:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Artist Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpenDialog()}>
        Add New Artist
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
              {artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell>{artist.name}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(artist)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(artist.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingArtist ? 'Edit Artist' : 'Add New Artist'}</DialogTitle>
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
            {editingArtist ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArtistManagement;
