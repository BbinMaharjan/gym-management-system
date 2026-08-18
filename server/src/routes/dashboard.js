const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const attendanceCtrl = require('../controllers/attendanceController');
const paymentCtrl = require('../controllers/paymentController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.use(verifyToken);

router.get('/summary', checkPermission('reports:view'), ctrl.getSummary);
router.get('/attendance', checkPermission('attendance:view'), attendanceCtrl.getAllAttendance);
router.get('/payments', checkPermission('payments:view'), paymentCtrl.getPayments);

module.exports = router;
