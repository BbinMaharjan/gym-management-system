const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const attendanceCtrl = require('../controllers/attendanceController');
const paymentCtrl = require('../controllers/paymentController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.use(verifyToken);

router.get('/summary', checkPermission('reports:view'), ctrl.getSummary);
router.get('/revenue-trend', checkPermission('reports:view'), ctrl.getRevenueTrend);
router.get('/attendance-trend', checkPermission('attendance:view'), ctrl.getAttendanceTrend);
router.get('/member-growth', checkPermission('reports:view'), ctrl.getMemberGrowth);
router.get('/payment-methods', checkPermission('payments:view'), ctrl.getPaymentMethods);
router.get('/shift-distribution', checkPermission('attendance:view'), ctrl.getShiftDistribution);
router.get('/attendance', checkPermission('attendance:view'), attendanceCtrl.getAllAttendance);
router.get('/attendance/today', checkPermission('attendance:view'), attendanceCtrl.getTodayCheckedIn);
router.delete('/attendance/:id', checkPermission('attendance:manage'), attendanceCtrl.deleteAttendance);
router.get('/payments', checkPermission('payments:view'), paymentCtrl.getPayments);
router.put('/payments/:id', checkPermission('payments:manage'), paymentCtrl.updatePayment);
router.delete('/payments/:id', checkPermission('payments:manage'), paymentCtrl.deletePayment);

module.exports = router;
