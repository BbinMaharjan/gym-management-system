const Member = require('../models/Member');

exports.getNextMembershipNumber = async (req, res, next) => {
  try {
    const last = await Member.findOne({ membershipNumber: { $exists: true, $ne: '' } })
      .sort({ createdAt: -1 })
      .select('membershipNumber');
    let nextNum = 1;
    if (last && last.membershipNumber) {
      const match = last.membershipNumber.match(/\d+$/);
      if (match) nextNum = parseInt(match[0], 10) + 1;
    }
    const padded = String(nextNum).padStart(4, '0');
    res.json({ membershipNumber: `GYM-${padded}` });
  } catch (err) {
    next(err);
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const { search, status, plan } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (plan) filter.membershipPlan = plan;

    const members = await Member.find(filter)
      .populate('membershipPlan', 'name durationInDays price')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    next(err);
  }
};

exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).populate(
      'membershipPlan',
      'name durationInDays price'
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    next(err);
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) {
      data.photo = `/uploads/members/${req.file.filename}`;
    }
    const member = await Member.create(data);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = `/uploads/members/${req.file.filename}`;
    }
    const member = await Member.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    }).populate('membershipPlan', 'name durationInDays price');
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) {
    next(err);
  }
};

exports.assignPlan = async (req, res, next) => {
  try {
    const { planId, startDate } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const plan = require('../models/MembershipPlan').findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const start = startDate ? new Date(startDate) : new Date();
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + plan.durationInDays);

    member.membershipPlan = planId;
    member.planStartDate = start;
    member.planExpiryDate = expiry;
    member.status = 'active';
    await member.save();

    res.json(await member.populate('membershipPlan', 'name durationInDays price'));
  } catch (err) {
    next(err);
  }
};
