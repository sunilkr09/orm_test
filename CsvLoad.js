const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const ora = require('ora');
const DynamicModel = require('./models/DynamicModel');
const sequelize = require('./config/database');
const { createHeaders } = require('./utils/DynamicModel.js');

const delimiter = '|';
const csvFilePath = 'organizations-100000.csv';
const tableName = 'TestCsvTable'; // Replace with the desired table name
const BATCH_SIZE = 1_00_000; // Number of rows per batch
const dropTable = true;

const csvFileName = path.basename(csvFilePath);
let rowsToInsert = [];
let totalRows = 0;

// Initialize line counter for row indexing
const lineCounter = ((i = 0) => () => ++i)();

// Initialize the loader
const spinner = ora(`File Processing Started -> ${csvFileName}`).info();
console.time('Time Elapsed');

(async () => {
  try {
    // Step 1: Read headers to create the database table structure
    const headerStream = fs.createReadStream(csvFilePath)
      .pipe(csvParser({ separator: delimiter }));

    for await (const headers of headerStream) {
      createHeaders(Object.keys(headers), tableName);
      break; // Only need the first row for headers
    }

    // Drop Table if exists
    if (dropTable) {
      await DynamicModel.drop({ logging: (sql, time) => spinner.start(`Dropping the table ${tableName}! ${sql}`) });
      spinner.succeed(`${tableName} table dropped!`);
    }

    // Sync the database
    await sequelize.sync({ force: true });

    // Step 2: Process the file in chunks
    const stream = fs.createReadStream(csvFilePath)
      .pipe(csvParser({ separator: delimiter }));
    spinner.start('Loading data...');

    for await (const row of stream) {
      row['lineNo'] = lineCounter();
      row['fileName'] = csvFileName;
      rowsToInsert.push(row);
      totalRows++;

      if (rowsToInsert.length >= BATCH_SIZE) {
        // Insert the current batch into the database
        await DynamicModel.bulkCreate(rowsToInsert);
        rowsToInsert = []; // Clear the batch
      }

      // Update the loader message
      spinner.text = `Loading data... Processed ${totalRows} rows so far.`;
    }

    // Insert remaining rows (if any)
    if (rowsToInsert.length > 0) {
      await DynamicModel.bulkCreate(rowsToInsert);
    }

    spinner.succeed(`Data loading complete. Total Rows Inserted: ${totalRows}`);
  } catch (error) {
    spinner.fail('Error loading data.');
    console.error('Error processing file:', error.message);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
    console.timeEnd('Time Elapsed');
  }
})();
