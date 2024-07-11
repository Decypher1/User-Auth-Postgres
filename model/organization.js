const {DataTypes} = require('sequelize')
const sequelize = require ('../db')

const Organization = sequelize.define('Organization', {
    orgId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
});
module.exports = Organization;