const fs = require('fs');
const csvParser = require('csv-parser');
const { DataTypes, col } = require('sequelize');
const DynamicModel = require('./models/DynamicModel');
const sequelize = require('./config/database');

const csvFilePath = 'organizations-100000.csv';
const tableName = 'TestPDCEncum'; // Replace with the desired table name

fs.createReadStream(csvFilePath)
  .pipe(csvParser({ separator: ',' }))
  .on('headers', (headers) => {
    const columnDefinitions = {};

    headers.forEach(header => {
      columnDefinitions[header] = {
        type: DataTypes.TEXT,
        allowNull: true, // Adjust as needed
      };
    });

    DynamicModel.init(columnDefinitions, {
      sequelize,
      tableName,
      //modelName: 'DynamicModel',
    })

    sequelize.sync({ force: true });

  })
  .on('data', (row) => DynamicModel.create(row))
  .on('end', () => sequelize.close());