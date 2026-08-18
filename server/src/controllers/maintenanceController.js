const MaintenanceLog = require('../models/MaintenanceLog');
const Equipment = require('../models/Equipment');

exports.getEquipmentMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find({ equipment: req.params.id }).sort({
      date: -1,
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

exports.createMaintenanceLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.create({
      ...req.body,
      equipment: req.params.id,
    });

    await Equipment.findByIdAndUpdate(req.params.id, {
      lastServicedDate: log.date,
      status: 'maintenance',
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};
