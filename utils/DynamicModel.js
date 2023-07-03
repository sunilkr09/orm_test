const { DataTypes } = require('sequelize');
const DynamicModel = require('../models/DynamicModel');
const sequelize = require('../config/database');

function createHeaders(headers, tableName) {
    const columnDefinitions = {};
    headers.forEach((header) => {
        columnDefinitions[header] = {
            type: DataTypes.TEXT,
            allowNull: true, // Adjust as needed
        };
    });
    columnDefinitions['lineNo'] = {
        type: DataTypes.NUMBER,
        allowNull: true, // Adjust as needed
    };
    columnDefinitions['fileName'] = {
        type: DataTypes.TEXT,
        allowNull: true, // Adjust as needed
    };
    DynamicModel.init(columnDefinitions, {
        sequelize,
        tableName,
        timestamps: false
        //modelName: 'DynamicModel',
    });
    DynamicModel.removeAttribute('id');
}

module.exports = { createHeaders };
