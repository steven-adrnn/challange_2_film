'use strict';

module.exports = (sequelize, DataTypes) => {
  const FilmArtist = sequelize.define('FilmArtist', {
    film_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'films',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    artist_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'artists',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'film_artists',
    timestamps: false,
  });

  return FilmArtist;
};
