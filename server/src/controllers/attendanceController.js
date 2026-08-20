const Attendance = require('../models/Attendance');

exports.getMemberAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ member: req.params.id }).sort({
      checkInTime: -1,
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const record = await Attendance.create({
      member: req.params.id,
      checkInTime: new Date(),
    });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const record = await Attendance.findOne({
      member: req.params.id,
      checkOutTime: null,
    }).sort({ checkInTime: -1 });

    if (!record) {
      return res.status(404).json({ error: 'No active check-in found' });
    }

    record.checkOutTime = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const filter = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.checkInTime = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(filter)
      .populate('member', 'name phone')
      .sort({ checkInTime: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.getTodayCheckedIn = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      checkInTime: { $gte: todayStart, $lte: todayEnd },
      checkOutTime: null,
    })
      .populate('member', 'name phone photo shift')
      .sort({ checkInTime: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    next(err);
  }
};
