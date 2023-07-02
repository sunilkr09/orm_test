const app = require('express')();
const fs = require('fs');
const csvParser = require('csv-parser');
const { DataTypes } = require('sequelize');
const DynamicModel = require('./models/DynamicModel');
const sequelize = require('./config/database');

const csvFilePath = 'organizations-100000.csv';
const tableName = 'TestCsvTable'; // Replace with the desired table name

 fs.createReadStream(csvFilePath)
  .pipe(csvParser({ separator: ',' }))
  .on('headers', async (headers) => {
    try {
      const columnDefinitions = {};
      headers.forEach((header) => {
        columnDefinitions[header] = {
          type: DataTypes.TEXT,
          allowNull: true, // Adjust as needed
        };
      });
       DynamicModel.init(columnDefinitions, {
        sequelize,
        tableName,
        //modelName: 'DynamicModel',
      });
    } catch (error) {
      console.error('Error creating table:', error.message);
    }
  })


app.get('/:id', (req, res)=>{

  DynamicModel.findByPk( req.params.id ).then(data=>{

    res.status(200).json({ Users: data})
  })
  .catch(err=>{
    res.status(501).json({ message: err.message})

  })
})

  sequelize.sync({ force: true }).then(result=>{
    try {
      app.listen(3000, console.log(`Server up at 3000`));
      fs.createReadStream(csvFilePath)
        .pipe(csvParser({ separator: ',' }))
        .on('data', async (row) => {
          try {
            await DynamicModel.create(row);
          } catch (error) {
            console.error('Error inserting row:', error);
          }
        })
  
  
    } catch (err) {
      console.log("Error occured ", err.message);
    }
  })
  .catch(err=>{
    console.log(`Server errror`, err.message);
    process.exit(1);
  })
  