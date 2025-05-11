'use strict';

module.exports = (sequelize, DataTypes) => {
  const Artist = sequelize.define('Artist', {
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
    tableName: 'artists',
    timestamps: false,
  });

  Artist.associate = function(models) {
    Artist.belongsToMany(models.Film, {
      through: 'film_artists',
      foreignKey: 'artist_id',
      otherKey: 'film_id',
      as: 'films',
    });
  };

  return Artist;
};
