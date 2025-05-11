require('dotenv').config();

module.exports = {
  development: {
    url: process.env.SUPABASE_DB_URL,
    dialect: 'postgres',
    logging: false
  },
  test: {
    url: process.env.SUPABASE_DB_URL,
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.SUPABASE_DB_URL,
    dialect: 'postgres',
    logging: false
  }
};
