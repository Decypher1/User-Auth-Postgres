const {DataTypes} = require('sequelize');
const sequelize = require('../db');
const User = require('./user_model')
const Organization = require('./organization')

const UserOrganization = sequelize.define('UserOrganization', {
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'userId',
        },
    },
    orgId: {
        type: DataTypes.UUID,
        references: {
            model: Organization,
            key: 'orgId',
        },
    },
});

User.belongsToMany(Organization, {through: UserOrganization});
Organization.belongsToMany(User, {through: UserOrganization});

module.exports= UserOrganization;