'use strict';

module.exports = (sequelize, DataTypes) => {
  const FilmGenre = sequelize.define('FilmGenre', {
    film_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'films',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    genre_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'genres',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'film_genres',
    timestamps: false,
  });

  return FilmGenre;
};
