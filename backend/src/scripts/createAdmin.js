#!/usr/bin/env node
/* ============================================
   StartupEvents — Create Admin Account Script
   
   Usage: node backend/src/scripts/createAdmin.js
   
   Reads MONGODB_URI from backend/.env automatically.
   Creates a new admin user or promotes an existing user.
   ============================================ */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const readline = require('readline');

// Load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in backend/.env');
    process.exit(1);
  }

  console.log('\n🔑 StartupEvents — Admin Account Creator\n');
  console.log(`📡 Connecting to: ${mongoUri.split('@')[1] || 'database'}...\n`);

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB\n');

  // Check if any admin already exists
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log(`⚠️  An admin already exists: ${existingAdmin.email} (${existingAdmin.firstName} ${existingAdmin.lastName})`);
    const proceed = await ask('Create another admin? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Exiting.');
      await mongoose.disconnect();
      rl.close();
      return;
    }
  }

  console.log('--- Create New Admin Account ---\n');

  const firstName = await ask('First Name: ');
  const lastName = await ask('Last Name: ');
  const email = await ask('Email: ');
  const password = await ask('Password (min 8 chars, 1 uppercase, 1 number): ');

  // Validate
  if (!firstName || !lastName || !email || !password) {
    console.error('❌ All fields are required.');
    await mongoose.disconnect();
    rl.close();
    return;
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    await mongoose.disconnect();
    rl.close();
    return;
  }

  // Check if email already exists
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`\n⚠️  User with email "${email}" already exists (role: ${existing.role}).`);
    const promote = await ask('Promote this user to admin? (y/n): ');
    if (promote.toLowerCase() === 'y') {
      existing.role = 'admin';
      existing.organizerStatus = 'verified';
      await existing.save();
      console.log(`\n✅ User "${existing.firstName} ${existing.lastName}" promoted to admin!`);
    } else {
      console.log('Exiting.');
    }
    await mongoose.disconnect();
    rl.close();
    return;
  }

  // Create new admin user
  const admin = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    role: 'admin',
    organizerStatus: 'verified',
  });

  console.log(`\n✅ Admin account created successfully!`);
  console.log(`   Name:  ${admin.firstName} ${admin.lastName}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(`\n🔐 You can now log in at https://startup-event-app.vercel.app/login\n`);

  await mongoose.disconnect();
  rl.close();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  mongoose.disconnect();
  rl.close();
  process.exit(1);
});
