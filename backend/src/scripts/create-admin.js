const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

const createAdmin = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(config.mongoUri);
    
    const adminEmail = 'admin@startupevents.com';
    const adminPassword = 'AdminSecure123!';
    
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('🔄 Admin already exists. Updating password and ensuring admin role...');
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.organizerStatus = 'verified';
    } else {
      console.log('✨ Creating new admin account...');
      admin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        organizerStatus: 'verified'
      });
    }

    await admin.save();
    console.log('✅ Success! Admin account is ready.');
    console.log('📧 Email: ' + adminEmail);
    console.log('🔑 Password: ' + adminPassword);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
