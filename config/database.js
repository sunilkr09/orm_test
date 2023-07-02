const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'C:\\Users\\SunilKumarMallah\\AppData\\Local\\ToscaDataIntegrityExecutor\\Caching.sqlite' // Replace with the actual path to your SQLite database file
});

module.exports = sequelize;
