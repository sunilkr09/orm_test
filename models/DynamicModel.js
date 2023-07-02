const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DynamicModel = sequelize.define('DynamicModel', {
  // Columns can be dynamically defined based on the CSV file headers
});

module.exports = DynamicModel;
