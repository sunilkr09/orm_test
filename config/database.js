const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite' // Replace with the actual path to your SQLite database file
});

module.exports = sequelize;
