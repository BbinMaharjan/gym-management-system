const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/planController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ctrl.getPlans);
router.get('/:id', ctrl.getPlan);
router.post('/', checkPermission('members:manage'), ctrl.createPlan);
router.put('/:id', checkPermission('members:manage'), ctrl.updatePlan);
router.delete('/:id', checkPermission('members:manage'), ctrl.deletePlan);

module.exports = router;
