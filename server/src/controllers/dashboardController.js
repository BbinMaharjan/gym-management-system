const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Equipment = require('../models/Equipment');
const Attendance = require('../models/Attendance');

exports.getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [
      totalActiveMembers,
      expiringThisWeek,
      totalEquipment,
      equipmentUnderMaintenance,
      monthlyRevenue,
      recentAttendance,
      totalMembers,
    ] = await Promise.all([
      Member.countDocuments({ status: 'active' }),
      Member.countDocuments({
        status: 'active',
        planExpiryDate: { $gte: now, $lte: weekEnd },
      }),
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: 'maintenance' }),
      Payment.aggregate([
        { $match: { paidOn: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Attendance.countDocuments({
        checkInTime: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
      }),
      Member.countDocuments(),
    ]);

    res.json({
      totalActiveMembers,
      expiringThisWeek,
      totalEquipment,
      equipmentUnderMaintenance,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      todayAttendance: recentAttendance,
      totalMembers,
    });
  } catch (err) {
    next(err);
  }
};
