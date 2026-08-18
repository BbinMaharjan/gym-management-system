const Equipment = require('../models/Equipment');

exports.getEquipment = async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (category) filter.category = category;

    const items = await Equipment.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.getEquipmentItem = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.createEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.deleteEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    next(err);
  }
};
