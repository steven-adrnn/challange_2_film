'use strict';

module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('Genre', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
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
    tableName: 'genres',
    timestamps: false,
  });

  Genre.associate = function(models) {
    Genre.belongsToMany(models.Film, {
      through: 'film_genres',
      foreignKey: 'genre_id',
      otherKey: 'film_id',
      as: 'films',
    });
  };

  return Genre;
};
