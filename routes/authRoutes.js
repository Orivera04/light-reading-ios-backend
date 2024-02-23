const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const { validateFields } = require('../middlewares/validateFields');
const { createUser, login, refreshToken } = require('../controllers/AuthController');
const { validateJWT } = require('../middlewares/validateJwt');

router.post('/', [
  check('email', 'The email is needed.').isEmail(),
  check('password', 'The password needs to be longer than 6 characters.').isLength({ min: 6 }),
  validateFields
], login);

router.post('/new', [
  check('name', 'The name is not optional.').not().isEmpty(),
  check('email', 'The email is not optional.').isEmail(),
  check('password', 'The password needs to be longer than 6 characters.').isLength({ min: 6 }),
  validateFields
], createUser);

router.use(validateJWT);

router.get('/renew', refreshToken);

module.exports = router;
