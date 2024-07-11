const { check, validationResult } = require('express-validator');
const User = require('../model/user_model');
const Organization = require('../model/organization');
const UserOrganization = require('../model/userOrganization');
const { sendValidationErrors } = require('../utils/helpers');

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (user) {
      res.status(200).json({
        status: 'success',
        message: 'User retrieved successfully',
        data: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      });
    } else {
      res.status(404).json({ status: 'error', message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getOrganizations = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: Organization,
    });

    if (user) {
      res.status(200).json({
        status: 'success',
        message: 'Organizations retrieved successfully',
        data: { organizations: user.Organizations }
      });
    } else {
      res.status(404).json({ status: 'error', message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createOrganization = [
  check('name').not().isEmpty(),
  async (req, res) => {
    sendValidationErrors(req, res);
    const { name, description } = req.body;

    try {
      const organization = await Organization.create({ name, description });
      await UserOrganization.create({ userId: req.user.userId, orgId: organization.orgId });

      res.status(201).json({
        status: 'success',
        message: 'Organization created successfully',
        data: organization
      });
    } catch (error) {
      res.status(400).json({
        status: 'Bad Request',
        message: 'Client error',
        statusCode: 400
      });
    }
  }
];

const getOrganization = async (req, res) => {
  const { orgId } = req.params;

  try {
    const organization = await Organization.findByPk(orgId);
    if (organization) {
      res.status(200).json({
        status: 'success',
        message: 'Organization retrieved successfully',
        data: organization
      });
    } else {
      res.status(404).json({ status: 'error', message: 'Organization not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const addUserToOrganization = [
  check('userId').isUUID(),
  async (req, res) => {
    sendValidationErrors(req, res);
    const { orgId } = req.params;
    const { userId } = req.body;

    try {
      await UserOrganization.create({ userId, orgId });
      res.status(200).json({
        status: 'success',
        message: 'User added to organization successfully'
      });
    } catch (error) {
      res.status(400).json({
        status: 'Bad Request',
        message: 'Client error',
        statusCode: 400
      });
    }
  }
];

module.exports = {
  getUser,
  getOrganizations,
  createOrganization,
  getOrganization,
  addUserToOrganization
};
