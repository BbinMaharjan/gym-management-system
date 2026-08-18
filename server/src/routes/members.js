const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/memberController');
const paymentCtrl = require('../controllers/paymentController');
const attendanceCtrl = require('../controllers/attendanceController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', checkPermission('members:view'), ctrl.getMembers);
router.get('/:id', checkPermission('members:view'), ctrl.getMember);
router.post('/', checkPermission('members:create'), ctrl.createMember);
router.put('/:id', checkPermission('members:edit'), ctrl.updateMember);
router.delete('/:id', checkPermission('members:delete'), ctrl.deleteMember);
router.put('/:id/assign-plan', checkPermission('members:edit'), ctrl.assignPlan);

router.get('/:id/attendance', checkPermission('attendance:view'), attendanceCtrl.getMemberAttendance);
router.post('/:id/attendance/check-in', checkPermission('attendance:manage'), attendanceCtrl.checkIn);
router.post('/:id/attendance/check-out', checkPermission('attendance:manage'), attendanceCtrl.checkOut);

router.get('/:id/payments', checkPermission('payments:view'), paymentCtrl.getMemberPayments);
router.post('/:id/payments', checkPermission('payments:manage'), paymentCtrl.createPayment);

module.exports = router;
