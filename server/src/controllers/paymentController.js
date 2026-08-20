const Payment = require('../models/Payment');
const Member = require('../models/Member');
const MembershipPlan = require('../models/MembershipPlan');

const updateMemberPlan = async (memberId, planId, paidOn) => {
  if (!memberId || !planId) return;
  const plan = await MembershipPlan.findById(planId);
  if (!plan) return;
  const start = paidOn ? new Date(paidOn) : new Date();
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + plan.durationInDays);
  await Member.findByIdAndUpdate(memberId, {
    membershipPlan: planId,
    planStartDate: start,
    planExpiryDate: expiry,
    status: 'active',
  });
};

exports.getPayments = async (req, res, next) => {
  try {
    const { member, from, to } = req.query;
    const filter = {};
    if (member) filter.member = member;
    if (from || to) {
      filter.paidOn = {};
      if (from) filter.paidOn.$gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.paidOn.$lte = endDate;
      }
    }

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
      member: req.params.id,
      plan: req.body.planId || req.body.plan,
      recordedBy: req.user._id,
    });
    await updateMemberPlan(payment.member, payment.plan, payment.paidOn);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const oldPayment = await Payment.findById(req.params.id);
    const updateData = { ...req.body };
    if (updateData.planId) {
      updateData.plan = updateData.planId;
      delete updateData.planId;
    }
    const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('member', 'name phone')
      .populate('plan', 'name');
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.plan && (payment.plan._id.toString() !== (oldPayment.plan?.toString() || '') || payment.paidOn !== oldPayment.paidOn)) {
      await updateMemberPlan(payment.member._id, payment.plan._id, payment.paidOn);
    }

    res.json(payment);
  } catch (err) {
    next(err);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
};
