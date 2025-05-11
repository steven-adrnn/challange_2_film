'use strict';

module.exports = (sequelize, DataTypes) => {
  const Film = sequelize.define('Film', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    video_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'films',
    timestamps: false,
  });

  Film.associate = function(models) {
    Film.belongsToMany(models.Artist, {
      through: 'film_artists',
      foreignKey: 'film_id',
      otherKey: 'artist_id',
      as: 'artists',
    });
    Film.belongsToMany(models.Genre, {
      through: 'film_genres',
      foreignKey: 'film_id',
      otherKey: 'genre_id',
      as: 'genres',
    });
  };

  return Film;
};
