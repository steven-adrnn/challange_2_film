const { Genre } = require('../models');

const createGenre = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const existing = await Genre.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'Genre with this name already exists' });
    }

    const genre = await Genre.create({ name });
    res.status(201).json({ genre });
  } catch (error) {
    console.error('Create genre error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const listGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.json(genres);
  } catch (error) {
    console.error('List genres error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateGenre = async (req, res) => {
  try {
    const genreId = req.params.id;
    const { name } = req.body;

    const genre = await Genre.findByPk(genreId);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    if (name) {
      const existing = await Genre.findOne({ where: { name } });
      if (existing && existing.id !== genre.id) {
        return res.status(409).json({ message: 'Genre with this name already exists' });
      }
      genre.name = name;
    }

    await genre.save();
    res.json({ genre });
  } catch (error) {
    console.error('Update genre error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteGenre = async (req, res) => {
  try {
    const genreId = req.params.id;
    const genre = await Genre.findByPk(genreId);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    await genre.destroy();
    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error('Delete genre error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createGenre,
  listGenres,
  updateGenre,
  deleteGenre,
};
