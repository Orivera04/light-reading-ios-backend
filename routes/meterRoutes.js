const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const { validateFields } = require('../middlewares/validateFields');
const { getAllMeters, getMeterById, updateMeter, deleteMeter, createMeter } = require('../controllers/MeterController');
const { validateJWT } = require('../middlewares/validateJwt');

router.use(validateJWT);

router.get('/', getAllMeters);
router.get('/:id', getMeterById);

router.post('/', [
  check('name', 'The name is needed.').not().isEmpty(),
  check('tag', 'The tag is needed.').not().isEmpty(),
  check('lastBillingKwh', 'The lastBillingKwh is needed.').not().isEmpty(),
  validateFields
], createMeter );

router.put('/:id', updateMeter);
router.delete('/:id', deleteMeter);

module.exports = router;
