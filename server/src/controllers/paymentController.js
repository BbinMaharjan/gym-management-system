const Payment = require('../models/Payment');

exports.getPayments = async (req, res, next) => {
  try {
    const { member } = req.query;
    const filter = {};
    if (member) filter.member = member;

    const payments = await Payment.find(filter)
      .populate('member', 'name phone')
      .populate('plan', 'name')
      .sort({ paidOn: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.getMemberPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ member: req.params.id })
      .populate('plan', 'name')
      .sort({ paidOn: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      recordedBy: req.user._id,
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};
