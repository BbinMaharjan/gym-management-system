const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/equipmentController');
const maintenanceCtrl = require('../controllers/maintenanceController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', checkPermission('equipment:view'), ctrl.getEquipment);
router.get('/:id', checkPermission('equipment:view'), ctrl.getEquipmentItem);
router.post('/', checkPermission('equipment:create'), ctrl.createEquipment);
router.put('/:id', checkPermission('equipment:edit'), ctrl.updateEquipment);
router.delete('/:id', checkPermission('equipment:delete'), ctrl.deleteEquipment);

router.get('/:id/maintenance', checkPermission('equipment:view'), maintenanceCtrl.getEquipmentMaintenanceLogs);
router.post('/:id/maintenance', checkPermission('equipment:edit'), maintenanceCtrl.createMaintenanceLog);

module.exports = router;
