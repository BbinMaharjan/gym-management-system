require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const SUPERADMIN_EMAIL = 'superadmin@gym.com';
const SUPERADMIN_PASSWORD = 'SuperAdmin@123';

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    const existing = await User.findOne({ email: SUPERADMIN_EMAIL });
    if (existing) {
      console.log('SuperAdmin already exists');
      process.exit(0);
    }

    await User.create({
      name: 'SuperAdmin',
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      role: 'superadmin',
      permissions: [],
      isActive: true,
    });

    console.log('SuperAdmin created successfully');
    console.log(`Email: ${SUPERADMIN_EMAIL}`);
    console.log(`Password: ${SUPERADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedSuperAdmin();
