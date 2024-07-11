require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const { sequelize, User, Organization, UserOrganization } = require('./db');

const app = express();
const secret = process.env.JWT_SECRET; // Store this in an environment variable

app.use(bodyParser.json());

// Helper function to send validation errors
const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
};

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Registration endpoint
app.post('/auth/register', [
  check('firstName').not().isEmpty(),
  check('lastName').not().isEmpty(),
  check('email').isEmail(),
  check('password').isLength({ min: 6 })
], async (req, res) => {
  sendValidationErrors(req, res);
  const { firstName, lastName, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await sequelize.transaction(async (t) => {
      const user = await User.create({ firstName, lastName, email, password: hashedPassword, phone }, { transaction: t });
      const orgName = `${firstName}'s Organization`;
      const organization = await Organization.create({ name: orgName }, { transaction: t });
      await user.addOrganization(organization, { transaction: t });

      const accessToken = jwt.sign({ userId: user.userId, email: user.email }, secret);
      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: {
          accessToken,
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          }
        }
      });
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Registration unsuccessful',
      statusCode: 400
    });
  }
});

// Login endpoint
app.post('/auth/login', [
  check('email').isEmail(),
  check('password').not().isEmpty()
], async (req, res) => {
  sendValidationErrors(req, res);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const accessToken = jwt.sign({ userId: user.userId, email: user.email }, secret);
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          accessToken,
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          }
        }
      });
    } else {
      res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Protected endpoint to get user details
app.get('/api/users/:id', authenticateToken, async (req, res) => {
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
});

// Protected endpoint to get organizations the user belongs to
app.get('/api/organisations', authenticateToken, async (req, res) => {
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
});

// Protected endpoint to create a new organization
app.post('/api/organisations', [
  authenticateToken,
  check('name').not().isEmpty()
], async (req, res) => {
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
});

// Protected endpoint to get a single organization
app.get('/api/organisations/:orgId', authenticateToken, async (req, res) => {
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
});

// Protected endpoint to add a user to an organization
app.post('/api/organisations/:orgId/users', [
  authenticateToken,
  check('userId').isUUID()
], async (req, res) => {
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
        status: 'Bad request',
        message: 'client error',
        statusCode: 400
    })
}
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});