const { Film, Artist, Genre } = require('../models');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Op, literal } = require('sequelize');

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const createFilm = async (req, res) => {
  try {
    const { title, description, duration, artistIds, genreIds, published } = req.body;

    if (!title || !duration) {
      return res.status(400).json({ message: 'Title and duration are required' });
    }

    if (!req.files || !req.files.video || req.files.video.length === 0) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    // Parse artistIds and genreIds if sent as JSON string
    let artists = [];
    let genres = [];
    if (artistIds) {
      artists = Array.isArray(artistIds) ? artistIds : JSON.parse(artistIds);
    }
    if (genreIds) {
      genres = Array.isArray(genreIds) ? genreIds : JSON.parse(genreIds);
    }

    // Upload video to Supabase storage
    const videoBuffer = fs.readFileSync(videoFile.path);
    const videoName = `${Date.now()}_${videoFile.originalname}`;
    const { data: videoData, error: videoError } = await supabase.storage
      .from('film')
      .upload(`video/${videoName}`, videoBuffer, {
        contentType: videoFile.mimetype,
        upsert: false,
      });
    if (videoError) {
      console.error('Supabase video upload error:', videoError);
      return res.status(500).json({ message: 'Failed to upload video' });
    }
    const videoPath = videoData.path || `video/${videoName}`;
    fs.unlinkSync(videoFile.path);

    let thumbnailPath = null;
    if (thumbnailFile) {
      // Upload thumbnail to Supabase storage
      const thumbnailBuffer = fs.readFileSync(thumbnailFile.path);
      const thumbnailName = `${Date.now()}_${thumbnailFile.originalname}`;
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from('film')
        .upload(`thumbnail/${thumbnailName}`, thumbnailBuffer, {
          contentType: thumbnailFile.mimetype,
          upsert: false,
        });
      if (thumbnailError) {
        console.error('Supabase thumbnail upload error:', thumbnailError);
        return res.status(500).json({ message: 'Failed to upload thumbnail' });
      }
      thumbnailPath = thumbnailData.path || `thumbnail/${thumbnailName}`;
      fs.unlinkSync(thumbnailFile.path);
    }

    const film = await Film.create({
      title,
      description,
      duration,
      video_path: videoPath,
      thumbnail_path: thumbnailPath,
      published: published === 'true' || published === true,
    });

    if (artists.length > 0) {
      await film.setArtists(artists);
    }
    if (genres.length > 0) {
      await film.setGenres(genres);
    }

    // Reload film with artists and genres included with proper attributes and through options
    const createdFilm = await Film.findByPk(film.id, {
      include: [
        {
          model: Artist,
          as: 'artists',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          model: Genre,
          as: 'genres',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    res.status(201).json({ film: createdFilm });
  } catch (error) {
    console.error('Create film error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateFilm = async (req, res) => {
  try {
    const filmId = req.params.id;
    const film = await Film.findByPk(filmId);
    if (!film) {
      return res.status(404).json({ message: 'Film not found' });
    }

    const { title, description, duration, artistIds, genreIds, published } = req.body;

    // Update fields if provided
    if (title !== undefined) film.title = title;
    if (description !== undefined) film.description = description;
    if (duration !== undefined) film.duration = duration;
    if (published !== undefined) film.published = published === 'true' || published === true;

    // Handle file updates
    if (req.files) {
      if (req.files.video && req.files.video.length > 0) {
        // Delete old video file
        if (film.video_path && fs.existsSync(film.video_path)) {
          fs.unlinkSync(film.video_path);
        }
        film.video_path = path.relative(process.cwd(), req.files.video[0].path);
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        // Delete old thumbnail file
        if (film.thumbnail_path && fs.existsSync(film.thumbnail_path)) {
          fs.unlinkSync(film.thumbnail_path);
        }
        film.thumbnail_path = path.relative(process.cwd(), req.files.thumbnail[0].path);
      }
    }

    await film.save();

    // Update associations
    if (artistIds !== undefined) {
      let artists = [];
      if (artistIds) {
        artists = Array.isArray(artistIds) ? artistIds : JSON.parse(artistIds);
      }
      await film.setArtists(artists);
    }
    if (genreIds !== undefined) {
      let genres = [];
      if (genreIds) {
        genres = Array.isArray(genreIds) ? genreIds : JSON.parse(genreIds);
      }
      await film.setGenres(genres);
    }

    const updatedFilm = await Film.findByPk(film.id, {
      include: ['artists', 'genres'],
    });

    res.json({ film: updatedFilm });
  } catch (error) {
    console.error('Update film error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const searchFilms = async (req, res) => {
  try {
    let { q = '', page = 1, limit = 10, genreIds, artistIds, sortBy = 'created_at', order = 'DESC', published } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const include = [
      {
        model: Artist,
        as: 'artists',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        required: false,
      },
      {
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        required: false,
      },
    ];

    if (genreIds) {
      const genreIdArray = Array.isArray(genreIds) ? genreIds : genreIds.split(',');
      include[1].where = { id: genreIdArray };
      include[1].required = true;
    }

    if (artistIds) {
      const artistIdArray = Array.isArray(artistIds) ? artistIds : artistIds.split(',');
      include[0].where = { id: artistIdArray };
      include[0].required = true;
    }

    // Fuzzy search using PostgreSQL similarity function or ILIKE for title, description, artist name, genre name
    const whereConditions = [];

    if (q) {
      whereConditions.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          literal(`EXISTS (SELECT 1 FROM film_artists fa JOIN artists a ON fa.artist_id = a.id WHERE fa.film_id = "Film".id AND a.name ILIKE '%${q}%')`),
          literal(`EXISTS (SELECT 1 FROM film_genres fg JOIN genres g ON fg.genre_id = g.id WHERE fg.film_id = "Film".id AND g.name ILIKE '%${q}%')`),
        ],
      });
    }

    if (published !== undefined) {
      const publishedBool = published === 'true' || published === true;
      whereConditions.push({ published: publishedBool });
    }

    const validSortFields = ['created_at', 'title', 'duration'];
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'created_at';
    }
    order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Film.findAndCountAll({
      where: whereConditions.length > 0 ? { [Op.and]: whereConditions } : {},
      include,
      order: [[sortBy, order]],
      distinct: true,
      offset: (page - 1) * limit,
      limit,
    });

    res.json({
      films: rows,
      total: count,
      page,
      limit,
    });
  } catch (error) {
    console.error('Search films error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFilmDetails = async (req, res) => {
  try {
    const filmId = req.params.id;
    const film = await Film.findByPk(filmId, {
      include: ['artists', 'genres'],
    });
    if (!film) {
      return res.status(404).json({ message: 'Film not found' });
    }
    res.json({ film });
  } catch (error) {
    console.error('Get film details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFilmVideoUrl = async (req, res) => {
  try {
    const filmId = req.params.id;
    const film = await Film.findByPk(filmId);
    if (!film) {
      return res.status(404).json({ message: 'Film not found' });
    }
    // Generate public URL for video from Supabase storage
    const { data, error } = supabase.storage
      .from('film')
      .getPublicUrl(film.video_path);
    if (error) {
      console.error('Error getting video URL:', error);
      return res.status(500).json({ message: 'Failed to get video URL' });
    }
    res.json({ videoUrl: data.publicUrl });
  } catch (error) {
    console.error('Get film video URL error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFilmThumbnailUrl = async (req, res) => {
  try {
    const filmId = req.params.id;
    const film = await Film.findByPk(filmId);
    if (!film) {
      return res.status(404).json({ message: 'Film not found' });
    }
    if (!film.thumbnail_path) {
      return res.status(404).json({ message: 'Thumbnail not found' });
    }
    // Generate public URL for thumbnail from Supabase storage
    const { data, error } = supabase.storage
      .from('film')
      .getPublicUrl(film.thumbnail_path);
    if (error) {
      console.error('Error getting thumbnail URL:', error);
      return res.status(500).json({ message: 'Failed to get thumbnail URL' });
    }
    res.json({ thumbnailUrl: data.publicUrl });
  } catch (error) {
    console.error('Get film thumbnail URL error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteFilm = async (req, res) => {
  try {
    const filmId = req.params.id;
    const film = await Film.findByPk(filmId);
    if (!film) {
      return res.status(404).json({ message: 'Film not found' });
    }

    // Delete video from Supabase storage
    if (film.video_path) {
      const { error: videoDeleteError } = await supabase.storage
        .from('film')
        .remove([film.video_path]);
      if (videoDeleteError) {
        console.error('Error deleting video from storage:', videoDeleteError);
      }
    }

    // Delete thumbnail from Supabase storage
    if (film.thumbnail_path) {
      const { error: thumbnailDeleteError } = await supabase.storage
        .from('film')
        .remove([film.thumbnail_path]);
      if (thumbnailDeleteError) {
        console.error('Error deleting thumbnail from storage:', thumbnailDeleteError);
      }
    }

    // Remove associations
    await film.setArtists([]);
    await film.setGenres([]);

    // Delete film record
    await film.destroy();

    res.json({ message: 'Film deleted successfully' });
  } catch (error) {
    console.error('Delete film error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createFilm,
  updateFilm,
  searchFilms,
  getFilmDetails,
  getFilmVideoUrl,
  getFilmThumbnailUrl,
  deleteFilm,
};
