const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Equipment = require('../models/Equipment');
const Attendance = require('../models/Attendance');
const dayjs = require('dayjs');

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

exports.getRevenueTrend = async (req, res, next) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = dayjs().subtract(i, 'month').startOf('month').toDate();
      const end = dayjs().subtract(i, 'month').endOf('month').toDate();
      months.push({ start, end, label: dayjs().subtract(i, 'month').format('MMM YYYY') });
    }

    const results = await Promise.all(
      months.map(async (m) => {
        const agg = await Payment.aggregate([
          { $match: { paidOn: { $gte: m.start, $lte: m.end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return { month: m.label, revenue: agg.length > 0 ? agg[0].total : 0 };
      })
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceTrend = async (req, res, next) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const start = date.startOf('day').toDate();
      const end = date.endOf('day').toDate();
      days.push({ start, end, label: date.format('ddd') });
    }

    const results = await Promise.all(
      days.map(async (d) => {
        const count = await Attendance.countDocuments({
          checkInTime: { $gte: d.start, $lte: d.end },
        });
        return { day: d.label, attendance: count };
      })
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getMemberGrowth = async (req, res, next) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = dayjs().subtract(i, 'month').startOf('month').toDate();
      const end = dayjs().subtract(i, 'month').endOf('month').toDate();
      months.push({ start, end, label: dayjs().subtract(i, 'month').format('MMM') });
    }

    const results = await Promise.all(
      months.map(async (m) => {
        const count = await Member.countDocuments({
          createdAt: { $gte: m.start, $lte: m.end },
        });
        return { month: m.label, members: count };
      })
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getPaymentMethods = async (req, res, next) => {
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const results = await Payment.aggregate([
      { $match: { paidOn: { $gte: monthStart } } },
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);

    const methodLabels = { cash: 'Cash', card: 'Card', upi: 'UPI', bank_transfer: 'Bank Transfer', other: 'Other' };
    const formatted = results.map((r) => ({
      method: methodLabels[r._id] || r._id,
      count: r.count,
      total: r.total,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.getShiftDistribution = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const results = await Attendance.aggregate([
      { $match: { checkInTime: { $gte: todayStart, $lte: todayEnd } } },
      {
        $lookup: {
          from: 'members',
          localField: 'member',
          foreignField: '_id',
          as: 'memberData',
        },
      },
      { $unwind: '$memberData' },
      { $group: { _id: '$memberData.shift', count: { $sum: 1 } } },
    ]);

    const formatted = results.map((r) => ({
      shift: r._id ? r._id.charAt(0).toUpperCase() + r._id.slice(1) : 'Unknown',
      count: r.count,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};
