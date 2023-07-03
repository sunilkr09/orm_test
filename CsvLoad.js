const fs = require('fs');
const csvParser = require('csv-parser');
const DynamicModel = require('./models/DynamicModel');
const sequelize = require('./config/database');
const { createHeaders } = require('./utils/DynamicModel.js');

const csvFilePath = 'organizations-100000.csv';
const csvFileName = csvFilePath.substring(csvFilePath.lastIndexOf('\\') + 1);
const tableName = 'TestCsvTable'; // Replace with the desired table name
const rowsToInsert = [];
const lineCounter = ((i = 0) => () => ++i)();

fs.createReadStream(csvFilePath)
  .pipe(csvParser({ separator: ',' }))
  .on('headers', async (headers, lineNo = lineCounter()) => {
    try {
      createHeaders(headers, tableName);
    } catch (error) {
      console.error('Error getting the column details: ', error.message);
    }
  });

sequelize.sync({ force: true }).then(() => {
  try {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser({ separator: ',' }))
      .on('data', async (row, lineNo = lineCounter()) => {
        try {
          row['lineNo'] = lineNo;
          row['fileName'] = csvFileName;
          rowsToInsert.push(row);
        } catch (error) {
          console.error('Error rows Array: ', error.message);
        }
      })
      .on('end', async () => {
        try {
          await DynamicModel.bulkCreate(rowsToInsert);
          console.log("Rows Inserted: ", await DynamicModel.count());

          await sequelize.close();
          console.log("Database closed.");
        } catch (error) {
          console.error('Error inserting row: ', error.message);
        }
      });
  } catch (err) {
    console.log("Error occured: ", err.message);
  }
}).catch(err => {
  console.log(`Error: `, err.message);
  process.exit(1);
});