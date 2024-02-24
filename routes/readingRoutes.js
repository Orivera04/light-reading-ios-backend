const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const { validateFields } = require('../middlewares/validateFields');
const { validateJWT } = require('../middlewares/validateJwt');
const { createReading, updateReading, deleteReading, getAllReadings, getReadingById } = require('../controllers/ReadingController');

router.use(validateJWT);

router.get('/', getAllReadings);
router.get('/:id', getReadingById);

router.post('/', [
  check('KwhReading', 'The KWH reading is needed.').not().isEmpty(),
  check('dateOfReading', 'The date of reading is needed.').not().isEmpty(),
  check('isCutoffDate', 'The isCutoffDate is needed.').not().isEmpty(),
  check('meter', 'The meter is needed.').not().isEmpty(),
  validateFields
], createReading );

router.put('/:id', updateReading);
router.delete('/:id', deleteReading);

module.exports = router;
