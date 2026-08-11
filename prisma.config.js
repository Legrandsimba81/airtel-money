// prisma.config.js
require('dotenv/config'); // lit .env (optionnel, mais assure que process.env.DATABASE_URL est chargé)

module.exports = {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
};