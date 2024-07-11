require('dotenv').config()
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.SUPABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// const User = sequelize.define('User', {
//   userId: {
//     type: DataTypes.UUID,
//     defaultValue: Sequelize.UUIDV4,
//     primaryKey: true,
//   },
//   firstName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   lastName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true,
//     },
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   phone: {
//     type: DataTypes.STRING,
//   },
// });

// const Organization = sequelize.define('Organization', {
//   orgId: {
//     type: DataTypes.UUID,
//     defaultValue: Sequelize.UUIDV4,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.STRING,
//   },
// });

// const UserOrganization = sequelize.define('UserOrganization', {
//   userId: {
//     type: DataTypes.UUID,
//     references: {
//       model: User,
//       key: 'userId',
//     },
//   },
//   orgId: {
//     type: DataTypes.UUID,
//     references: {
//       model: Organization,
//       key: 'orgId',
//     },
//   },
// });

// User.belongsToMany(Organization, { through: UserOrganization });
// Organization.belongsToMany(User, { through: UserOrganization });

// sequelize.sync();

// module.exports = { sequelize, User, Organization, UserOrganization };
module.exports = sequelize;