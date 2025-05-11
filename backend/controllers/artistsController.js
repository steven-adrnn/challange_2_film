const { Artist } = require('../models');

const createArtist = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const existing = await Artist.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'Artist with this name already exists' });
    }

    const artist = await Artist.create({ name });
    res.status(201).json({ artist });
  } catch (error) {
    console.error('Create artist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const listArtists = async (req, res) => {
  try {
    const artists = await Artist.findAll();
    res.json(artists);
  } catch (error) {
    console.error('List artists error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    const { name } = req.body;

    const artist = await Artist.findByPk(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    if (name) {
      const existing = await Artist.findOne({ where: { name } });
      if (existing && existing.id !== artist.id) {
        return res.status(409).json({ message: 'Artist with this name already exists' });
      }
      artist.name = name;
    }

    await artist.save();
    res.json({ artist });
  } catch (error) {
    console.error('Update artist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    const artist = await Artist.findByPk(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    await artist.destroy();
    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    console.error('Delete artist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createArtist,
  listArtists,
  updateArtist,
  deleteArtist,
};
